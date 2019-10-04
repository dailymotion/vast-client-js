const fs = require('fs');
const path = require('path');

const newDistPath = './dist';
const oldDistPath = './dist_old';

const getFileSizes = folderPath => {
  return fs.readdirSync(folderPath).reduce((res, fileName) => {
    res[fileName] = fs.readFileSync(path.join(folderPath, fileName)).byteLength;
    return res;
  }, {});
};

const oldValues = getFileSizes(oldDistPath);
const newValues = getFileSizes(newDistPath);

Object.entries(oldValues).forEach(([name, size]) => {
  const newSize = newValues[name];
  const delta = newSize - size;
  const sizeColorFg = delta <= 0 ? '\x1b[32m' : '\x1b[31m';
  const resetColorFg = '\x1b[0m';
  const nameColorFg = '\x1b[36m';
  // eslint-disable-next-line no-console
  console.log(
    `${nameColorFg}%s${resetColorFg}%s${sizeColorFg}%s${resetColorFg}`,
    `${name}:`,
    ` ${size} B -> ${newSize} B `,
    `(${delta >= 0 ? '+' : ''}${delta} B)`
  );
});
