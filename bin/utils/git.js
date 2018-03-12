
'use strict'
const {
  runCommand,
} = require('../utils/common.js')

/** ************************
 * A few git helper functions
 ***************************/

// A Promise wrapper around git status
// return a formatted status object
// {
//   branchName: 'PV-1234',
//   files: [
//     'path/to/pending/files'
//   ],
//   clean: true
// }
function gitStatus() {
  return runCommand('git status --porcelain --branch')
    .then(function(str) {
      const status = {
        branchName : '',
        files      : [],
        clean      : true,
      }
      const lines = str.trim().split('\n')
      // The first line contains branch information. It's formatted such as:
      // "## branchName...origin/master [ahead 2]", "## branchName...origin/branchName", "## branchName"
      // Too bad destructuring assignment is not yet supported in Node 4.4.5 or we could have written it that way
      // eslint-disable-next-line no-useless-escape
      status.branchName = lines.shift().match(/^## ([^(\.\.\.)]+)(?:\.\.\.)?.*$/)[1]
      // [, status.branchName] = lines.shift().match(/^## ([^(\.\.\.)]+)(?:\.\.\.)?.*$/)

      lines.forEach(function(line) {
        // exclude empty lines
        if (line.match(/\S/)) {
          // each line is like ' M html5/app/scripts/components/stats/tracking.coffee'
          // only keep the file path
          status.files.push(line.trim().split(/\s+/)[1])
        }
      })
      status.clean = status.files.length === 0
      return status
    })
}

function gitGetHEAD() {
  return runCommand('git log --pretty=format:"%h" --no-color -1')
}

function gitGetHash() {
  return runCommand('git rev-parse HEAD')
}

function gitGetVersion() {
  return runCommand('git describe --abbrev=0')
}

function gitResetHard(rev) {
  return runCommand(`git reset --hard ${rev}`)
}

function gitAdd(files) {
  if (!Array.isArray(files)) {
    files = [files]
  }
  return runCommand(`git add ${files.join(' ')}`)
}

function gitMove(coffeeFile, jsFile) {
  return runCommand(`git mv ${coffeeFile} ${jsFile}`)
}

function gitCommit(msg, force) {
  // ES6 linting is done in a pre-commmit hook – we want to ignore
  // that when moving coffee files to js (without doing any translation)
  const noVerify = force ? '--no-verify' : ''
  // TODO : escape the message...
  return runCommand(`git commit -m "${msg}" ${noVerify}`)
}

function gitAddThenCommit(files, msg) {
  return gitAdd(files)
   .then(function() {
     return gitCommit(msg)
   })
}

function gitGetCurrentBranch() {
  return runCommand('git rev-parse --abbrev-ref HEAD')
    .then((stdout) => {
      return stdout.trim()
    })
    .catch(() => false)
}

module.exports = {
  gitStatus,
  gitGetHEAD,
  gitGetHash,
  gitGetVersion,
  gitResetHard,
  gitAdd,
  gitMove,
  gitCommit,
  gitAddThenCommit,
  gitGetCurrentBranch,
}
