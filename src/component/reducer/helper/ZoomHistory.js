export default class ZoomHistory {
  constructor() {
    this.stack = [];
  }

  static getInstance(ZoomHistoryInstances, nucleus) {
    if (
      ZoomHistoryInstances[nucleus] &&
      ZoomHistoryInstances[nucleus] instanceof ZoomHistory
    ) {
      return ZoomHistoryInstances[nucleus];
    }
    ZoomHistoryInstances[nucleus] = new ZoomHistory();
    return ZoomHistoryInstances[nucleus];
  }

  push(val) {
    this.stack.push(val);
  }

  pop() {
    const val = this.stack.pop();
    return val ? this.stack[this.stack.length - 1] : null;
  }

  getLast() {
    if (this.stack.length === 0) return null;
    return this.stack[this.stack.length - 1];
  }
}
