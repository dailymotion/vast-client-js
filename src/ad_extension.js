export class AdExtension {
  constructor() {
    this.name = null;
    this.value = null;
    this.attributes = {};
    this.children = [];
  }

  isEmpty() {
    return (
      this.value === null &&
      Object.keys(this.attributes).length === 0 &&
      this.children.length === 0
    );
  }
}
