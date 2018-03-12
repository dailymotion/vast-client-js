
'use strict'

const colors = require('colors')
const exec = require('child_process').exec
const spawn = require('child_process').spawn

// Shared environement accors modules
const env = {}
function setenv(key, value) {
  env[key] = value
}

function getenv(key) {
  return env[key]
}

// Displays an error with a fancy red 'Oups' prefix
function promptError(...args) {
  args = ['\n  ', colors.red.bold('Oups /!\\'), ':', ...args]
  console.error(...args)
}

// Helper for successfully existing the script
function exitSuccess(res) {
  console.log('done', typeof res !== 'undefined' ? res : '')
  process.exit(0)
}

// Helper for existing the script with an error
function exitFailure(err) {
  promptError(err instanceof Error ? err.message : err)
  process.exit(1)
}

// A Promise wrapper around node's child_process.exec() method
function runCommand(cmd, {
  verbose = (getenv('verbose') || false),
} = {}) {
  return new Promise((resolve, reject) => {
    if (verbose) {
      console.log(colors.blue.bold('> '), cmd)
    }
    exec(cmd, (err, stdout, stderr) => {
      // sometimes (e.g. eslint) we have a meaningful stdout along with the stderr
      const errorMsg = stdout ? `${stdout}\n\n${stderr}` : stderr
      err != null ? reject(errorMsg) : resolve(stdout)
    })
  })
}

// A Promise wrapper around node's child_process.spawn() method
function runRealTimeCommand(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, Object.assign({ shell: true }, options))
    proc.stdout.on('data', (data) => process.stdout.write(data))
    proc.stderr.on('data', (data) => process.stderr.write(data))
    proc.on('close', (code) => {
      code === 0 ? resolve() : reject(new Error(`An error occurred when running ${cmd} (code ${code})`))
    })
  })
}

module.exports = {
  exitFailure,
  exitSuccess,
  getenv,
  promptError,
  runCommand,
  runRealTimeCommand,
  setenv,
}
