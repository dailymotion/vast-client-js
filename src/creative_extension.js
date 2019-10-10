export function createCreativeExtension() {
  return {
    name: null,
    value: null,
    attributes: {},
    children: []
  };
}

export function isEmptyExtension(creativeExtension) {
  return (
    creativeExtension.value === null &&
    Object.keys(creativeExtension.attributes).length === 0 &&
    creativeExtension.children.length === 0
  );
}
