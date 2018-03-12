#!/usr/bin/env node

'use strict'

const colors = require('colors')
const path = require('path')
const program = require('commander')
const prompt = require('cli-input')
const replace = require('replace')
const {
  exitFailure,
  exitSuccess,
  promptError,
  runCommand,
  setenv,
} = require('./utils/common.js')
const {
  accessFile,
  moveFile,
  readFile,
  removeFile,
  writeFile,
} = require('./utils/fs.js')
const {
  gitStatus,
  gitGetHEAD,
  gitResetHard,
  gitAdd,
  gitMove,
  gitCommit,
  gitAddThenCommit,
} = require('./utils/git.js')

const STATE_FILE = '.coffee2js.tmp'

/** ************************
 * A few utility functions
 ***************************/

// Displays an argument error
function promptArgumentError(...args) {
  promptError(...args)
  console.log("\n  Please provide a valid path to a CoffeeScript as a 1st parameter  (e.g. 'path/to/file.coffee').\n")
  process.exit(1)
}

// Get a JS file path according to the original CoffeeScript one.
function getJsFilePath(coffeeFile) {
  const pathObj = path.parse(coffeeFile)
  pathObj.base = pathObj.base.replace(pathObj.ext, '.js')
  pathObj.ext = '.js'
  return path.format(pathObj)
}

// Clear error output from `npm run`
function removeNpmERRFromString(error) {
  if (typeof error === 'string' && ~error.indexOf('npm ERR!')) {
    error = error.substr(0, error.indexOf('npm ERR!'))
  }
  return error
}

// Actual conversion from CoffeeScript to JavaScript
function runDecaffeinate(coffeeFile) {
  // Looks like 'decaffeinate' does not have any API for programmatic use... Let's use it as a command line :/
  return runCommand(`decaffeinate ${coffeeFile}`)
    .catch((err) => {
    console.log('error');

      throw removeNpmERRFromString(err)
    })
}

/** ************************
 * Helper functions to handle conversion state
 ***************************/

// Save state to file-system
function writeState(state) {
  return writeFile(STATE_FILE, JSON.stringify(state))
}

// Remove saved state from file-system
function clearState() {
  return removeFile(STATE_FILE)
}

// Read saved state from file-system
function readState() {
  return readFile(STATE_FILE).then(JSON.parse)
}

/** ************************
 * Actual implementation of the conversion tool
 ***************************/

// Aborts conversion process
// Basically runs `git reset --hard <rev>` where rev is the revision number saved in the state
function cmdAbort() {
  // Step 1 : Working directory must be clean. Check status and exit if not.
  gitStatus()
    .then(status => {
      if (!status.clean) {
        throw new Error('Cannot --abort: You have unstaged changes.\nPlease commit or stash them.')
      }
    })
    // Step 2 : Read the saved state if any, and git reset to the saved HEAD revision
    .then(() => {
      return readState()
        .then(state => {
          if (!state.head) {
            throw new Error('state.head missing in saved state... Impossible to abort.')
          }
          else {
            return state.head
          }
        })
        .then(
          rev => gitResetHard(rev),
          () => { throw new Error('No conversion in progress?') }
        )
    })
    // Step 3 : Remove saved state
    .then(() => clearState())
    .then(exitSuccess, exitFailure)
}

// Continues conversion process
function cmdContinue() {
  return readState()
    .then(state => {
      if (!state.file) {
        throw new Error('state.file missing in saved state... No conversion in progress?')
      }
      else if (!state.step) {
        throw new Error('state.step missing in saved state... No conversion in progress?')
      }
      else {
        switch (state.step) {
          case 'prepare':
            console.log('Continue from Step 1 : prepare')
            return fromStepPrepare(state)
              .then(() => console.log('prepare step done!!'))
          case 'lint':
            console.log('Continue from Step 3 : lint')
            return fromStepLint(state)
              .then(() => console.log('lint step done!!'))
          case 'finalize':
            console.log('Continue from Step 4 : finalize')
            return fromFinalize(state)
              .then(() => console.log('finalize step done!!'))
          default:
            throw new Error(`Unexpected saved state: ${state.step}... Not sure what to do in that case... ^^`)
        }
      }
    },
    () => {
      throw new Error('No conversion in progress?')
    })
    .then(exitSuccess, exitFailure)
}

// Starts conversion process
function cmdStart(state) {
  // Step 1 : Working directory must be clean. Check status and exit if not.
  return gitStatus()
    .then(status => {
      // Save branch name for later
      state.branch = status.branchName

      if (!status.clean) {
        throw new Error('Cannot start conversion process: You have unstaged changes.\nPlease commit or stash them.')
      }
    })
    // Step 2 : Check if a conversion process has been started already and exit if yes.
    .then(() => {
      return readState()
        .then(status => {
          // eslint-disable-next-line max-len
          throw new Error('Conversion process already in progress.\nPlease run `./coffee2js --continue` or `./coffee2js --abort`.')
        },
        () => {
          // No existing status actually means we can go ahead. By returning
          // 'undefined', we're turning the rejected Promise into a resolved
          // one.
          // console.log("couldn't found existing status. We're good", arguments[0])
        })
    })
    // Step 3 : Read the current <revision> #id and save it so we can git reset in case of `./coffee2js --abort`
    .then(() => {
      return gitGetHEAD().then(head => {
        state.head = head
        return writeState(state)
      })
    })
    .then(() => fromStepPrepare(state))
    .then(() => console.log('prepare step done!!'))
    .then(exitSuccess, exitFailure)
}

function fromStepPrepare(state) {
  const coffeeFile = state.file
  const branch = state.branch
  const jsFile = getJsFilePath(coffeeFile)

  function displayDoneMessage(didCommit) {
    console.log('  Prepare step : done', colors.green.bold(didCommit ? '(1 commit)' : '(Nothing to commit)'))
  }

  console.log('\nStep 1 : Prepare')
  console.log('  Checking if decaffeinate can run without errors...')

  // Step 1 : Write step in state
  state.step = 'prepare'
  return writeState(state)
    // Step 2 - Attempt to convert the CoffeeScript file
    // If decaffeinate runs without error, that means we don't need any preparation step
    // Otherwise, we must manually edit the .coffee file to fix the conversion
    // issues before continuing
    .then(() => runDecaffeinate(coffeeFile))
    .then(() => {
      // If conversion succeeded, we can commit the changes in the CoffeScript file and go ahead
      return gitAddThenCommit(coffeeFile, `[ES6] prepare ${path.parse(coffeeFile).base}`)
        .then(function() {
          return displayDoneMessage(true)
        },
        function() {
          // commit failed just means there was nothing to commit
          return displayDoneMessage(false)
        })
    })
    .catch(function(err) {
      // If conversion failed, that means the CoffeeScript file needs some edit before conversion.

      /* eslint-disable max-len */
      throw new Error(`decaffeinate failed.
        ${err}
        Make sure you fix the errors above then run \`./coffee2js --continue\` or use \`./coffee2js --abort\` if you changed your mind.`
      )
      /* eslint-enable max-len */
    })
    // Step 3 : Always remove the produced js file
    .then(
      () => removeFile(jsFile),
      (err) => removeFile(jsFile).then(() => { throw err })
    )
    .then(() => fromStepConvert(state))
}

function fromStepConvert(state) {
  const coffeeFile = state.file
  const branch = state.branch
  const jsFile = getJsFilePath(coffeeFile)

  const coffeeFileName = path.parse(coffeeFile).base
  const jsFileName = path.parse(jsFile).base

  console.log('\nStep 2 : Convert')
  state.step = 'convert'
  // Step 1 : Write step in state
  return writeState(state)
    // Step 2 : git mv path/to/file.coffee path/to/file.js
    .then(() => gitMove(coffeeFile, jsFile))
    // Step 3 : git commit intermediate step
    .then(function() {
      console.log('  git move `.coffee` file to `.js` to preserve log history', colors.green.bold('(1 commit)'))
      return gitCommit(`[ES6] move ${coffeeFileName}`, true)
    })
    // Step 4 : mv path/to/file.js path/to/file.coffee
    .then(function() {
      return moveFile(jsFile, coffeeFile)
    })
    // Step 5 : decaffeinate path/to/file.js path/to/file.coffee
    .then(function() {
      console.log(`  Decaffeinate ${coffeeFileName} to ${jsFileName}.`)
      return runDecaffeinate(coffeeFile)
    })
    // Step 6 : replace file name within every other file
    .then(function() {
      console.log(`  Replacing ${coffeeFileName} by ${jsFileName} within "html5" & "bootstrapper" folders.`)
      replace({
        regex       : coffeeFileName,
        replacement : jsFileName,
        paths       : ['src'],
        recursive   : true,
        silent      : !program.verbose,
      })
      return
})
    // Step 7 : remove the remaining CoffeeScript file
    .then(() => {
      console.log(`  Deleting ${coffeeFileName}.`)
      return removeFile(coffeeFile)
    })
    .then(() => fromStepLint(state))
}

function promptQuestion(question) {
  return new Promise((resolve, reject) => {
    const ps = prompt({ prompt: '> ', delimiter: '>' })
    const def = prompt.sets.definitions.confirm.clone({
      message : `${question} (y/n)`,
    })

    ps.on('unacceptable', () => {
      console.error('Please answer with y/n or yes/no')
    })
    ps.run([def], (err, res) => {
      err ? reject(err) : resolve(res && res.map && res.map.confirm || false)
    })
  })
}

function fromStepLint(state) {
  const coffeeFile = state.file
  const jsFile = getJsFilePath(coffeeFile)
  const jsFileName = path.parse(jsFile).base

  console.log('\nStep 3 : Linting')
  state.step = 'lint'
  // Step 1 : Write step in state
  return writeState(state)
    .then(() => fromFinalize(state))
}

function fromFinalize(state) {
  const coffeeFile = state.file
  const branch = state.branch
  const jsFile = getJsFilePath(coffeeFile)
  const jsFileName = path.parse(jsFile).base

  console.log('\nStep 4 : Manual Checks')
  state.step = 'finalize'
  // Step 1 : Write step in state
  return writeState(state)
    // Step 3 : git add the converted file + every file updated by the replace step
    .then(() => gitStatus())
    .then(status => {
      if (status.branchName !== branch) {
        throw new Error(`Unexpected branch name.\nExpected: ${branch} - Actual: ${status.branchName}`)
      }
      if (status.clean) {
        // eslint-disable-next-line max-len
        throw new Error('git status is clean. This is not supposed to happen.\nDid you stashed your changes or something?')
      }
      // Check branch name didn't changed
      return gitAdd(status.files)
    })
    // Step 4 : git commit final step
    .then(() => gitCommit(`[ES6] convert ${path.parse(coffeeFile).base}`))
    .then(() => {
      console.log('  Manuals checks : done', colors.green.bold('(1 commit)'))
    })
    // Step 5 : Remove saved state
    .then(() => clearState())
}

let pathValue
// let cmdValue

program
  .version('0.0.1')
  .allowUnknownOption()
  // eslint-disable-next-line max-len
  .description('Interactive companion to convert the player\'s CoffeeScript code-base into a brand new JavaScript (ES6) one.')
  .usage('[options] <path>')
  .option('-v, --verbose', 'Verbose mode. A lot more information output.')
  .option('--no-color', 'disable colors') // handled by colors module
  .option('--continue', 'Restart the conversion process after having resolved a blocking step')
  .option('--abort', 'Abort the conversion process and reset HEAD to the original commit')
  .action(pathArg => {
    pathValue = pathArg
  })

program.parse(process.argv)

setenv('verbose', program.verbose)

if (program.abort) {
  cmdAbort()
}
else if (program.continue) {
  cmdContinue()
}
else if (typeof pathValue === 'undefined') {
  promptArgumentError('Missing <path> argument')
}
else {
  accessFile(pathValue, { readable: true, writable: true })
    .then(() => {
      if (path.extname(pathValue) !== '.coffee') {
        promptArgumentError(pathValue, 'is not a CoffeeScript file')
      }
      else {
        cmdStart({ file: pathValue })
      }
    })
    .catch(() => {
      promptArgumentError(pathValue, "File doesn't exists or is not readable/writable")
    })
}
