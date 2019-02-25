import { DOMParser } from 'xmldom';

export const getNodesFromXml = xmlString => {
  const parser = new DOMParser();
  return parser.parseFromString(xmlString, 'text/xml').childNodes[0];
};
