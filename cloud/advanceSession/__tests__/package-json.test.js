const fs = require('fs')
const path = require('path')

describe('cloud function package manifests', () => {
  test('advanceSession declares wx-server-sdk dependency', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'))

    expect(manifest.dependencies).toBeDefined()
    expect(manifest.dependencies['wx-server-sdk']).toBeTruthy()
  })

  test('submitPracticeResult declares wx-server-sdk dependency', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../../submitPracticeResult/package.json'), 'utf8'))

    expect(manifest.dependencies).toBeDefined()
    expect(manifest.dependencies['wx-server-sdk']).toBeTruthy()
  })
})
