let recorderManager = null
let stopHandler = null
let errorHandler = null

function getManager() {
  if (!recorderManager && wx.getRecorderManager) {
    recorderManager = wx.getRecorderManager()
  }

  return recorderManager
}

function registerRecorderListeners({ onStop, onError }) {
  const manager = getManager()

  if (!manager) {
    return null
  }

  stopHandler = onStop
  errorHandler = onError

  manager.onStop((result) => {
    if (typeof stopHandler === 'function') {
      stopHandler(result)
    }
  })
  manager.onError((error) => {
    if (typeof errorHandler === 'function') {
      errorHandler(error)
    }
  })

  return manager
}

function startRecord(options = {}) {
  const manager = getManager()

  if (!manager) {
    throw new Error('recorder unavailable')
  }

  manager.start({
    duration: options.duration || 10000,
    sampleRate: 16000,
    numberOfChannels: 1,
    encodeBitRate: 96000,
    format: 'mp3'
  })
}

function stopRecord() {
  const manager = getManager()

  if (!manager) {
    throw new Error('recorder unavailable')
  }

  manager.stop()
}

module.exports = {
  registerRecorderListeners,
  startRecord,
  stopRecord
}
