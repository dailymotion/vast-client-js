const path = require('path');
const xmldom = require('xmldom');
const fs = require('fs');
const { VASTParser } = require('../dist/vast-client-node.min.js');

const url = path.join(__dirname, '..', 'spec', 'samples', 'inline-linear.xml');
const stringifiedXml = fs.readFileSync(url).toString();
const inlineXml = new xmldom.DOMParser().parseFromString(stringifiedXml, 'text/xml');

const VastParser = new VASTParser();

const timeBefore = Date.now();
VastParser.parseVAST(inlineXml)
  .then(() => {
    console.log(Date.now() - timeBefore);
  })
  .catch((e) => {
    console.error(e)
  });
