
'use strict'

const fs = require('fs')

// A Promise wrapper around node's fs.readFile() method
function readFile(file, options) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, options, (err, data) => { err ? reject(err) : resolve(data) })
  })
}

// A Promise wrapper around node's fs.writeFile() method
function writeFile(file, data, options) {
  return new Promise((resolve, reject) => {
    fs.writeFile(file, data, options, (err) => { err ? reject(err) : resolve() })
  })
}

// A Promise wrapper around node's fs.writeFile() method
function moveFile(src, dest) {
  return new Promise((resolve, reject) => {
    fs.rename(src, dest, (err) => { err ? reject(err) : resolve() })
  })
}

// A Promise wrapper around node's fs.unlink() method
function removeFile(file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => { err ? reject(err) : resolve() })
  })
}

function accessFile(file, {
  readable = false,
  writable = false,
  executable = false,
} = {}) {
  let mode = fs.F_OK
  if (readable) { mode = mode | fs.R_OK }
  if (writable) { mode = mode | fs.W_OK }
  if (executable) { mode = mode | fs.X_OK }

  return new Promise((resolve, reject) => {
    fs.access(file, mode, (err) => {
      if (err) {
        reject(err)
      }
      else {
        resolve()
      }
    })
  })
}

module.exports = {
  accessFile,
  readFile,
  writeFile,
  moveFile,
  removeFile,
}
