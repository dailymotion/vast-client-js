export class AdExtension {
  constructor() {
    this.attributes = {};
    this.children = [];
  }
  isEmpty() {
    return (
      Object.keys(this.attributes).length === 0 && this.children.length === 0
    );
  }
}
