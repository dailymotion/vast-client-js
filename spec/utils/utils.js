import path from 'path';
import { nodeURLHandler } from '../../src/urlhandlers/node_url_handler';

export const getNodesFromXml = xmlString => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'text/xml').childNodes[0];
};

export const urlFor = fileName => {
  const filePath = path
    .resolve(path.join('spec', 'samples', fileName))
    .replace(/\\/g, '/');
  return `file:///${filePath}`;
};

export const fetchXml = (url, options = {}) => {
  return new Promise(resolve => {
    nodeURLHandler.get(url, options, (error, xml, details) => {
      resolve({ error, xml, details });
    });
  });
};
