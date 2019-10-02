export function AdExtension() {
  this.name = null;
  this.value = null;
  this.attributes = {};
  this.children = [];
  this.isEmpty = function() {
    return (
      this.value === null &&
      Object.keys(this.attributes).length === 0 &&
      this.children.length === 0
    );
  };
}
