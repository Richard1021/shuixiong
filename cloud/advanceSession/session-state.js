function pickNextTarget(remainingIds = [], recentIds = []) {
  if (!remainingIds.length) {
    return null
  }

  const availableIds = remainingIds.filter((id) => !recentIds.includes(id))
  return availableIds[0] || remainingIds[0] || null
}

function advanceTargetPool(state = {}, usedId) {
  const remainingIds = Array.isArray(state.remainingIds) ? state.remainingIds : []
  const recentIds = Array.isArray(state.recentIds) ? state.recentIds : []

  return {
    remainingIds: remainingIds.filter((id) => id !== usedId),
    recentIds: [...recentIds, usedId].filter(Boolean).slice(-3)
  }
}

function resetTargetPool(allIds = []) {
  return {
    remainingIds: [...allIds],
    recentIds: []
  }
}

module.exports = {
  pickNextTarget,
  advanceTargetPool,
  resetTargetPool
}
