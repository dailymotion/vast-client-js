const { spawn } = require('child_process');

const numberOfRuns = 100;

const getAverage = list => {
  return list.reduce((res, value) => (res += value), 0) / list.length;
};

/**
 * Calculates the average time taken of the given async test by running it multiple times.
 * Each run is executed in a child process, to not share resources between test runs.
 * The given async test must pass the time taken in a console log, for the performance test to work.
 * @param {String} name - name of the test for the console log
 * @param {String} testFilePath - absolute path to the test file
 */
const runAsyncTimeAverageTest = async (name, testFilePath) => {
  const times = [];

  for (let i = 0; i < numberOfRuns; i++) {
    try {
      const time = await new Promise((resolve, reject) => {
        const proc = spawn("node", [testFilePath]);

        proc.stdout.on("data", (data) => {
          const dataString = data.toString()
          if (dataString.match(/^\d+|\d+\.\d+$/g)) {
            resolve(parseInt(dataString, 10))
          }
        })
        proc.stderr.on("data", (error) => {
          reject(error.toString());
        })
      })

      times.push(time)
    } catch(e) {
      console.error(e);
      process.exit(1);
    }
  }

  console.log(`${name} - Average parsing time:`, getAverage(times), 'ms');
}

runAsyncTimeAverageTest('VASTClient', 'performance/get_time.js')
runAsyncTimeAverageTest('VASTParser', 'performance/parse_time.js')
