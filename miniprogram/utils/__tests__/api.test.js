global.getApp = () => ({
  globalData: {},
  setCurrentChild: jest.fn(),
  setLatestSession: jest.fn()
})

global.wx = {
  cloud: {
    callFunction: jest.fn(() => Promise.resolve({ result: {} }))
  },
  getStorageSync: jest.fn(() => null)
}

const api = require('../api')

describe('miniprogram utils api', () => {
  test('exports advanceSession and submitPracticeResult helpers', () => {
    expect(typeof api.advanceSession).toBe('function')
    expect(typeof api.submitPracticeResult).toBe('function')
  })

  test('picks current child from profile list when local cache is empty', () => {
    const result = api.pickCurrentChildFromProfiles([
      { childId: 'child_1', nickname: '小明', isCurrent: 0 },
      { childId: 'child_2', nickname: '小红', isCurrent: 1 }
    ])

    expect(result).toEqual({ childId: 'child_2', nickname: '小红', isCurrent: 1 })
  })
})
