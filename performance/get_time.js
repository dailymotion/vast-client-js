const { pathToFileURL } = require('url');
const process = require('process');
const { VASTClient } = require('../dist/vast-client-node.min.js');

const url = pathToFileURL('spec/samples/inline-linear.xml').toString();

const VastClient = new VASTClient();

const timeBefore = process.hrtime();
VastClient.get(url)
  .then(() => {
    const res = process.hrtime(timeBefore);
    console.log(res[0] * 1000 + res[1] * 0.000001);
  })
  .catch((e) => {
    console.error(e)
  });
