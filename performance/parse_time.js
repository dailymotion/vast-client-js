const xmldom = require('xmldom');
const fs = require('fs');
const process = require('process');
const { VASTParser } = require('../dist/vast-client-node.min.js');

const stringifiedXml = fs.readFileSync('spec/samples/inline-linear.xml').toString();
const inlineXml = new xmldom.DOMParser().parseFromString(stringifiedXml, 'text/xml');

const VastParser = new VASTParser();

const timeBefore = process.hrtime();
VastParser.parseVAST(inlineXml)
  .then(() => {
    const res = process.hrtime(timeBefore);
    console.log(res[0] * 1000 + res[1] * 0.000001);
  })
  .catch((e) => {
    console.error(e)
  });
