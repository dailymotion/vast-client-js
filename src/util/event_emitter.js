export class EventEmitter {
  constructor() {
    this.handlers = [];
  }

  on(event, handler) {
    this.handlers.push({
      event,
      handler
    });
  }

  off(event, handler) {
    this.handlers.forEach((item, index, object) => {
      if (item.event === event && item.handler === handler) {
        object.splice(index, 1);
      }
    });
  }

  emit(event, ...args) {
    this.handlers.forEach(item => {
      if (item.event === '*') {
        item.handler(event, ...args);
      }
      if (item.event === event) {
        item.handler(...args);
      }
    });
  }

  removeAllListeners() {
    this.handlers = [];
  }
}
