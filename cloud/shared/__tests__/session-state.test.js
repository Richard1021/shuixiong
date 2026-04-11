const {
  pickNextTarget,
  advanceTargetPool,
  resetTargetPool,
  classifyResponseType
} = require('../session-state')

describe('session-state helpers', () => {
  test('picks target outside recent ids when possible', () => {
    const result = pickNextTarget(['t1', 't2'], ['t1'])

    expect(result).toBe('t2')
  })

  test('allows last remaining target even if it is recent', () => {
    const result = pickNextTarget(['t1'], ['t1'])

    expect(result).toBe('t1')
  })

  test('returns null when pool is empty', () => {
    expect(pickNextTarget([], [])).toBeNull()
  })

  test('advances target pool and tracks recent ids', () => {
    const state = advanceTargetPool(
      {
        remainingIds: ['t1', 't2'],
        recentIds: []
      },
      't1'
    )

    expect(state.remainingIds).toEqual(['t2'])
    expect(state.recentIds).toEqual(['t1'])
  })

  test('resets target pool with empty recent ids', () => {
    const state = resetTargetPool(['t1', 't2'])

    expect(state.remainingIds).toEqual(['t1', 't2'])
    expect(state.recentIds).toEqual([])
  })

  test('classifies missing asr output as unavailable', () => {
    expect(classifyResponseType(null)).toBe('asr_unavailable')
  })

  test('classifies successful asr output as responded', () => {
    expect(classifyResponseType({ code: 0, recognizedText: 'apple' })).toBe('responded')
  })

  test('classifies empty recognized text as no response', () => {
    expect(classifyResponseType({ code: 0, recognizedText: '' })).toBe('no_response')
  })

  test('classifies failed asr output as failed', () => {
    expect(classifyResponseType({ code: -1 })).toBe('asr_failed')
  })
})
