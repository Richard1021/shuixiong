const https = require('https')
const crypto = require('crypto')
const cloud = require('wx-server-sdk')
const { buildTtsCacheKey, buildTtsFilePath } = require('./tts.logic')

const TTS_HOST = 'tts.tencentcloudapi.com'
const TTS_ACTION = 'TextToVoice'
const TTS_VERSION = '2019-08-23'
const TTS_SERVICE = 'tts'
const TTS_ALGORITHM = 'TC3-HMAC-SHA256'

function sha256(content) {
  return crypto.createHash('sha256').update(content).digest('hex')
}

function hmacSha256(key, content, encoding) {
  return crypto.createHmac('sha256', key).update(content).digest(encoding)
}

function buildTtsRequestPayload({ text }) {
  return {
    Text: String(text || '').trim(),
    SessionId: String(text || '').trim() || 'prompt',
    ModelType: 1,
    Volume: 0,
    Speed: 0,
    ProjectId: Number(process.env.TENCENT_TTS_APP_ID || 0),
    VoiceType: 1001,
    PrimaryLanguage: 1,
    SampleRate: 16000,
    Codec: 'mp3'
  }
}

function buildTtsRequestHeaders({ body, timestamp, secretId, secretKey }) {
  const date = new Date(timestamp * 1000).toISOString().slice(0, 10)
  const canonicalHeaders = `content-type:application/json; charset=utf-8\nhost:${TTS_HOST}\nx-tc-action:${TTS_ACTION.toLowerCase()}\n`
  const signedHeaders = 'content-type;host;x-tc-action'
  const hashedRequestPayload = sha256(body)
  const canonicalRequest = ['POST', '/', '', canonicalHeaders, signedHeaders, hashedRequestPayload].join('\n')
  const credentialScope = `${date}/${TTS_SERVICE}/tc3_request`
  const stringToSign = [TTS_ALGORITHM, String(timestamp), credentialScope, sha256(canonicalRequest)].join('\n')
  const secretDate = hmacSha256(`TC3${secretKey}`, date)
  const secretService = hmacSha256(secretDate, TTS_SERVICE)
  const secretSigning = hmacSha256(secretService, 'tc3_request')
  const signature = hmacSha256(secretSigning, stringToSign, 'hex')
  const authorization = `${TTS_ALGORITHM} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`

  return {
    Authorization: authorization,
    'Content-Type': 'application/json; charset=utf-8',
    Host: TTS_HOST,
    'X-TC-Action': TTS_ACTION,
    'X-TC-Version': TTS_VERSION,
    'X-TC-Timestamp': String(timestamp)
  }
}

function requestTts({ body, headers }, dependencies = {}) {
  const request = dependencies.request || https.request

  return new Promise((resolve, reject) => {
    const req = request({
      host: TTS_HOST,
      method: 'POST',
      path: '/',
      headers
    }, (response) => {
      const chunks = []

      response.on('data', (chunk) => {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
      })

      response.on('end', () => {
        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`tts request failed with status ${response.statusCode}`))
          return
        }

        try {
          const raw = Buffer.concat(chunks).toString('utf8')
          resolve(JSON.parse(raw || '{}'))
        } catch (error) {
          reject(error)
        }
      })

      response.on('error', reject)
    })

    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function uploadPromptAudio({ audioBase64, cloudPath }, dependencies = {}) {
  if (!audioBase64 || !cloudPath) {
    return ''
  }

  const uploadFile = dependencies.uploadFile || cloud.uploadFile.bind(cloud)
  const getTempFileURL = dependencies.getTempFileURL || cloud.getTempFileURL.bind(cloud)
  const logger = dependencies.logger || console.log
  const uploadResult = await uploadFile({
    cloudPath,
    fileContent: Buffer.from(audioBase64, 'base64')
  })
  const fileID = uploadResult && uploadResult.fileID

  if (!fileID) {
    logger('[advanceSession][tts] upload missing fileID', { cloudPath })
    return ''
  }

  const tempResult = await getTempFileURL({
    fileList: [fileID]
  })
  const fileItem = tempResult && tempResult.fileList && tempResult.fileList[0]
  const tempFileURL = fileItem && (fileItem.tempFileURL || fileItem.tempFileUrl)

  if (!tempFileURL) {
    logger('[advanceSession][tts] temp url missing', {
      cloudPath,
      fileID
    })
    return ''
  }

  logger('[advanceSession][tts] temp url ready', {
    cloudPath,
    fileID,
    tempFileURL
  })

  return tempFileURL
}

async function synthesizePromptAudio(payload = {}, dependencies = {}) {
  const text = String(payload.text || '').trim()

  if (!text) {
    return ''
  }

  const secretId = process.env.TENCENT_TTS_SECRET_ID
  const secretKey = process.env.TENCENT_TTS_SECRET_KEY
  const logger = dependencies.logger || console.log

  if (!secretId || !secretKey) {
    logger('[advanceSession][tts] missing env', {
      hasSecretId: Boolean(secretId),
      hasSecretKey: Boolean(secretKey)
    })
    return ''
  }

  const requestPayload = buildTtsRequestPayload({ text })
  const body = JSON.stringify(requestPayload)
  const now = dependencies.now || Date.now
  const timestamp = Math.floor(now() / 1000)
  const headers = buildTtsRequestHeaders({
    body,
    timestamp,
    secretId,
    secretKey
  })

  logger('[advanceSession][tts] request start', {
    text,
    voiceType: payload.voiceType || 'gentle_female',
    cloudPath: buildTtsFilePath({
      voiceType: payload.voiceType || 'gentle_female',
      text
    })
  })

  const response = await requestTts({ body, headers }, dependencies)
  const responseBody = response && response.Response
  const audioBase64 = responseBody && responseBody.Audio

  if (!audioBase64) {
    if (responseBody && responseBody.Error) {
      logger('[advanceSession][tts] response error', {
        text,
        error: responseBody.Error,
        requestId: responseBody.RequestId || ''
      })
    }
    logger('[advanceSession][tts] response missing audio', {
      text,
      response
    })
    return ''
  }

  logger('[advanceSession][tts] response received', {
    text,
    audioLength: audioBase64.length
  })

  return uploadPromptAudio({
    audioBase64,
    cloudPath: buildTtsFilePath({
      voiceType: payload.voiceType || 'gentle_female',
      text
    })
  }, dependencies)
}

async function resolvePromptAudio(payload = {}, dependencies = {}) {
  const cacheKey = buildTtsCacheKey({
    voiceType: payload.voiceType,
    text: payload.text
  })

  if (!process.env.TENCENT_TTS_APP_ID || !process.env.TENCENT_TTS_SECRET_ID || !process.env.TENCENT_TTS_SECRET_KEY) {
    return {
      promptAudioUrl: '',
      cacheKey
    }
  }

  const synthesize = dependencies.synthesize || synthesizePromptAudio

  try {
    const promptAudioUrl = await synthesize(payload, dependencies)

    return {
      promptAudioUrl: promptAudioUrl || '',
      cacheKey
    }
  } catch (error) {
    return {
      promptAudioUrl: '',
      cacheKey
    }
  }
}

module.exports = {
  resolvePromptAudio,
  synthesizePromptAudio,
  buildTtsRequestPayload,
  buildTtsRequestHeaders
}
