const path = require('path');
const xmldom = require('xmldom');
const fs = require('fs');
const { performance } = require('perf_hooks');
const { VASTParser } = require('./dist/vast-client-node.min.js');

const getXmlFromFilename = filename => {
  const url = path
    .resolve(path.join('spec', 'samples', filename))
    .replace(/\\/g, '/');

  const stringifiedXml = fs.readFileSync(url).toString();
  const parser = new xmldom.DOMParser();
  return parser.parseFromString(stringifiedXml, 'text/xml');
};

const getParsingTime = (VastParser, xml) => {
  const timeBefore = performance.now();
  return VastParser.parseVAST(xml).then(() => {
    const timeAfter = performance.now();
    return timeAfter - timeBefore;
  });
};

const getAverage = list => {
  return list.reduce((res, value) => (res += value), 0) / list.length;
};

const inlineXml = getXmlFromFilename('inline-linear.xml');
const VastParser = new VASTParser();
const numberOfRuns = 500;
const arr = new Array(numberOfRuns).fill(0);

const promises = arr.map(() => getParsingTime(VastParser, inlineXml));

Promise.all(promises).then(results => {
  const average = getAverage(results);
  // eslint-disable-next-line no-console
  console.log('Average parsing time', average);
});
