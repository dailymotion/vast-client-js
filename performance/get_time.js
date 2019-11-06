const path = require('path');
const { VASTClient } = require('../dist/vast-client-node.min.js');

const url = path.join('file://', __dirname, '..', 'spec', 'samples', 'inline-linear.xml');

const VastClient = new VASTClient();

const timeBefore = Date.now();

VastClient.get(url)
  .then(() => {
    const timeAfter = Date.now();
    console.log(timeAfter - timeBefore);
  })
  .catch((e) => {
    console.error(e)
  });
