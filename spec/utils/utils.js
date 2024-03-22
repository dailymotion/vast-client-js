import path from 'path';

export const getNodesFromXml = (xmlString) => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'text/xml').childNodes[0];
};

export const urlFor = (fileName) => {
  const filePath = path
    .resolve(path.join('spec', 'samples', fileName))
    .replace(/\\/g, '/');
  return `file:///${filePath}`;
};
