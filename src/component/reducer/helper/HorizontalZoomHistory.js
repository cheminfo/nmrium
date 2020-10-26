export default class HorizontalZoomHistory {
  stack = [];
  constructor() {
    if (!this.instance) {
      this.instance = this;
    }
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new HorizontalZoomHistory();
    return this.instance;
  }

  push(val) {
    this.stack.push(val);
  }

  pop() {
    if (this.stack.length === 0) return null;
    return this.stack.pop();
  }
}
