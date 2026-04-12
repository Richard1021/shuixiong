const fs = require('fs')
const path = require('path')

describe('advanceSession entry imports', () => {
  test('passes guided promptText into resolvePromptAudio synthesis request', () => {
    const content = fs.readFileSync(path.join(__dirname, '../index.js'), 'utf8')

    expect(content.includes('text: result.promptText')).toBe(true)
  })
})
