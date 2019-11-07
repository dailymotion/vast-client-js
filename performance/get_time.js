const path = require('path');
const { VASTClient } = require('../dist/vast-client-node.min.js');

const url = path.join('file://', __dirname, '..', 'spec', 'samples', 'inline-linear.xml');

const VastClient = new VASTClient();

const timeBefore = Date.now();

VastClient.get(url)
  .then(() => {
    console.log(Date.now() - timeBefore);
  })
  .catch((e) => {
    console.error(e)
  });
