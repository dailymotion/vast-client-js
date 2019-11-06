const { spawn } = require('child_process');

const numberOfRuns = 100;

const getAverage = list => {
  return list.reduce((res, value) => (res += value), 0) / list.length;
};

const runAsyncTimeAverageTest = async (name, testFilePath) => {
  const times = [];

  for(let i = 0; i < numberOfRuns; i++) {
    try {
      const time = await new Promise((resolve, reject) => {
        const proc = spawn("node", [testFilePath]);

        proc.stdout.on("data", (data) => {
          resolve(+data.toString())
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
