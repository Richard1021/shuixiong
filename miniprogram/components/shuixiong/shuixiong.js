Component({
  properties: {
    emotion: {
      type: String,
      value: 'normal',  // normal, happy, encourage, cheer, listening
    },
    speech: {
      type: String,
      value: '',
    },
  },

  data: {
    blink: false,
  },

  lifetimes: {
    attached: function () {
      // 自动眨眼
      this.startBlinkLoop();
    },
  },

  methods: {
    startBlinkLoop: function () {
      const blink = () => {
        this.setData({ blink: true });
        setTimeout(() => {
          this.setData({ blink: false });
        }, 200);

        // 随机 3-6 秒眨眼
        const nextBlink = Math.random() * 3000 + 3000;
        setTimeout(blink, nextBlink);
      };

      setTimeout(blink, 3000);
    },
  },
});
