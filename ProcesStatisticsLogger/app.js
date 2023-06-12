import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class ProcessStatisticsGetter {
  getProcessStatistics(command, args, timeout = Infinity) {
    const startTime = new Date();

    return new Promise((resolve, reject) => {
      const childProcess = spawn(command, args);

      let processOutput;
      let processError;
      childProcess.stdout.on('data', (data) => {
        processOutput = data.toString();
        process.stdout.write(processOutput);
      });
      childProcess.on('error', (error) => {
        processError = error.toString();
      })
      childProcess.stderr.on('data', (error) => {
        processError = error.toString().replace(/[\r\n]+/g, '');
      })
      childProcess.on('exit', (code) => {
        const endTime = new Date();
        const duration = endTime - startTime;
        const statistics = {
          start: startTime.toISOString(),
          duration,
          success: code == 0,
        };

        if (code !== 0) {
          statistics.commandSuccess = !processError;
          statistics.error = processError;
        }

        const logFileName = `${startTime.getTime()}${args[0]}.json`;
        const logFilePath = path.resolve(__dirname, 'logs', logFileName);
        fs.writeFile(logFilePath, JSON.stringify(statistics, null, 2), (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(statistics);
          }
        });
      });

      if (timeout !== Infinity) {
        setTimeout(() => {
          child.kill();
        }, timeout);
      }
    });
  }
}
new ProcessStatisticsGetter().getProcessStatistics('node', ['-v']).then((data) => { console.log(data) })