export default class HorizontalZoomHistory {
  static instance = {};
  stack = [];
  constructor(nucleus) {
    if (!HorizontalZoomHistory.instance[nucleus]) {
      HorizontalZoomHistory.instance[nucleus] = this;
    }
  }

  static getInstance(nucleus) {
    if (HorizontalZoomHistory.instance[nucleus]) {
      return HorizontalZoomHistory.instance[nucleus];
    }
    HorizontalZoomHistory.instance[nucleus] = new HorizontalZoomHistory(
      nucleus,
    );
    return HorizontalZoomHistory.instance[nucleus];
  }

  push(val) {
    this.stack.push(val);
  }

  pop() {
    if (this.stack.length === 0) return null;
    return this.stack.pop();
  }

  getLast() {
    if (this.stack.length === 0) return null;
    return this.stack[this.stack.length - 1];
  }
}
