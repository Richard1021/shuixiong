const app = getApp();

const STAGES = ['S1'];
const THEMES = ['animals', 'colors', 'daily_items', 'numbers'];

Page({
  data: {
    uploadList: [],
    uploading: false,
    uploadProgress: 0,
    totalCount: 0,
    doneCount: 0,
    logs: [],
  },

  onLoad() {},

  addLog(msg) {
    const logs = this.data.logs;
    logs.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`);
    this.setData({ logs: logs.slice(0, 50) });
  },

  async onSelectFiles() {
    const res = await new Promise((resolve, reject) => {
      wx.chooseMessageFile({
        count: 100,
        type: 'file',
        extension: ['mp3'],
        success: resolve,
        fail: reject,
      });
    }).catch(err => {
      this.addLog('取消选择：' + err.errMsg);
      return null;
    });

    if (!res) return;

    const files = res.tempFiles.map(f => ({
      name: f.name,
      path: f.path,
      size: f.size,
      stage: 'S1',
      theme: this.guessTheme(f.name),
      status: 'pending',
      fileID: '',
    }));

    this.setData({ uploadList: files });
    this.addLog(`已选择 ${files.length} 个文件`);
  },

  guessTheme(name) {
    const n = name.toLowerCase();
    if (n.includes('animal') || n.includes('cat') || n.includes('dog') || n.includes('bear') || n.includes('duck') || n.includes('macdonald') || n.includes('forest') || n.includes('mom') || n.includes('baby')) return 'animals';
    if (n.includes('color') || n.includes('rainbow') || n.includes('red') || n.includes('blue')) return 'colors';
    if (n.includes('number') || n.includes('duck') || n.includes('bed') || n.includes('five') || n.includes('ten')) return 'numbers';
    if (n.includes('morning') || n.includes('teeth') || n.includes('hand') || n.includes('food') || n.includes('wash') || n.includes('brush') || n.includes('yummy')) return 'daily_items';
    return 'animals';
  },

  onStageChange(e) {
    const { index } = e.currentTarget.dataset;
    const uploadList = this.data.uploadList;
    uploadList[index].stage = e.detail.value;
    this.setData({ uploadList });
  },

  onThemeChange(e) {
    const { index } = e.currentTarget.dataset;
    const uploadList = this.data.uploadList;
    uploadList[index].theme = THEMES[e.detail.value];
    this.setData({ uploadList });
  },

  async onUploadAll() {
    const list = this.data.uploadList.filter(f => f.status === 'pending');
    if (list.length === 0) {
      wx.showToast({ title: '没有待上传文件', icon: 'none' });
      return;
    }

    this.setData({ uploading: true, totalCount: list.length, doneCount: 0 });

    for (let i = 0; i < this.data.uploadList.length; i++) {
      const file = this.data.uploadList[i];
      if (file.status !== 'pending') continue;

      this.addLog(`上传中: ${file.name}`);
      const cloudPath = `audio/${file.stage}/${file.theme}/${file.name}`;

      try {
        const uploadRes = await wx.cloud.uploadFile({
          filePath: file.path,
          cloudPath,
        });

        const uploadList = this.data.uploadList;
        uploadList[i].status = 'done';
        uploadList[i].fileID = uploadRes.fileID;
        const doneCount = this.data.doneCount + 1;
        this.setData({
          uploadList,
          doneCount,
          uploadProgress: Math.round((doneCount / this.data.totalCount) * 100),
        });
        this.addLog(`完成: ${file.name} -> ${uploadRes.fileID}`);
      } catch (err) {
        const uploadList = this.data.uploadList;
        uploadList[i].status = 'error';
        this.setData({ uploadList });
        this.addLog(`失败: ${file.name} - ${err.errMsg}`);
      }
    }

    this.setData({ uploading: false });
    this.addLog('全部上传完成');
    wx.showToast({ title: '上传完成', icon: 'success' });
  },

  async onSyncToDB() {
    const doneFiles = this.data.uploadList.filter(f => f.status === 'done');
    if (doneFiles.length === 0) {
      wx.showToast({ title: '没有已上传的文件', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '同步到数据库...' });

    try {
      const result = await wx.cloud.callFunction({
        name: 'syncAudioToDB',
        data: { files: doneFiles.map(f => ({ name: f.name, stage: f.stage, theme: f.theme, fileID: f.fileID })) },
      });

      wx.hideLoading();
      this.addLog(`同步结果: ${JSON.stringify(result.result)}`);
      wx.showToast({ title: '同步成功', icon: 'success' });
    } catch (err) {
      wx.hideLoading();
      this.addLog(`同步失败: ${err.errMsg}`);
      wx.showToast({ title: '同步失败', icon: 'none' });
    }
  },

  onClearList() {
    this.setData({ uploadList: [], logs: [], uploadProgress: 0, doneCount: 0, totalCount: 0 });
  },

  getThemeIndex(theme) {
    return THEMES.indexOf(theme) >= 0 ? THEMES.indexOf(theme) : 0;
  },
});
