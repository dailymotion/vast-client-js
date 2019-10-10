export function createAdExtension() {
  return {
    name: null,
    value: null,
    attributes: {},
    children: []
  };
}

export function isEmptyExtension(adExtension) {
  return (
    adExtension.value === null &&
    Object.keys(adExtension.attributes).length === 0 &&
    adExtension.children.length === 0
  );
}
