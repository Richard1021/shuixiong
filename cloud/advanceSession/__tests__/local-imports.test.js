const fs = require('fs')
const path = require('path')

describe('cloud function local dependency boundaries', () => {
  test('advanceSession entry does not import parent shared directory', () => {
    const content = fs.readFileSync(path.join(__dirname, '../index.js'), 'utf8')
    expect(content.includes("require('../shared/")).toBe(false)
  })

  test('advanceSession logic does not import parent shared directory', () => {
    const content = fs.readFileSync(path.join(__dirname, '../advance-session.logic.js'), 'utf8')
    expect(content.includes("require('../shared/")).toBe(false)
  })

  test('submitPracticeResult entry does not import parent shared directory', () => {
    const content = fs.readFileSync(path.join(__dirname, '../../submitPracticeResult/index.js'), 'utf8')
    expect(content.includes("require('../shared/")).toBe(false)
  })
})
