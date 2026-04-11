const APP = getApp()
const STORAGE_KEY = 'currentChild'

function callFunction(name, data = {}) {
  return wx.cloud.callFunction({
    name,
    data
  }).then((response) => response.result || {})
}

function pickCurrentChildFromProfiles(profiles = []) {
  const currentProfile = profiles.find((item) => Number(item.isCurrent) === 1)
  if (currentProfile) {
    return currentProfile
  }

  return profiles[0] || null
}

function getCurrentChild() {
  if (APP.globalData.currentChild) {
    return APP.globalData.currentChild
  }

  const currentChild = wx.getStorageSync(STORAGE_KEY) || null
  APP.globalData.currentChild = currentChild
  return currentChild
}

function setCurrentChild(child) {
  APP.setCurrentChild(child)
  return child
}

function getChildProfiles() {
  return callFunction('getChildProfiles')
}

function saveChildProfile(payload) {
  return callFunction('saveChildProfile', payload).then((result) => {
    if (result.currentChild) {
      setCurrentChild(result.currentChild)
    }
    return result
  })
}

function initSession(payload) {
  return callFunction('initSession', payload).then((result) => {
    APP.setLatestSession(result)
    return result
  })
}

function submitPracticeResult(payload) {
  return callFunction('submitPracticeResult', payload)
}

function advanceSession(payload) {
  return callFunction('advanceSession', payload)
}

module.exports = {
  getCurrentChild,
  setCurrentChild,
  getChildProfiles,
  saveChildProfile,
  initSession,
  submitPracticeResult,
  advanceSession,
  pickCurrentChildFromProfiles
}
