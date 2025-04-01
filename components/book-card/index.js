// components/book-card/index.js
Component({
  properties: {
    book: {
      type: Object,
      value: {}
    }
  },

  methods: {
    handleTap() {
      this.triggerEvent('tap');
    }
  }
});
