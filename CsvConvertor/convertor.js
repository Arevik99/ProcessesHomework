import path from 'path';
import csv from 'csv-parser';
import fs from 'fs';
import cluster from 'cluster';
import process from 'process'
import os from 'os'
if (process.argv.length != 3) {
  process.stderr.write("Invalid number of arguments!");
  process.exit();
}
else {
  if (cluster.isPrimary) {
    distributeFiles();

  }
  else if (cluster.isWorker) {
    process.on('message', (message) => {
      if (message.taskIndex && message.filePath) {
        const taskIndex = message.taskIndex;
        const filePath = message.filePath;
        readCSVFile(filePath).then(
          (data) => {
            const jsonFilePath = path.join('./converted', path.parse(filePath).name);
            return writeInJSONFile(`${jsonFilePath}.json`, data);
          },
          (err) => {
            console.log(`Error while reading file: ${err}`);
          }).then((numOfRecords) => {
            process.send({ event: 'taskCompleted', taskIndex, numOfRecords });
          }, (err) => {
            process.stderr(`Error while writting file: ${err}`)
          });
      }
    });
  }

  function readCSVFile(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error))
    });
  }

  function writeInJSONFile(filePath, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, JSON.stringify(data), (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(data.length);
        }
      });
    });
  }
}
function distributeFiles() {
  const numWorkers = os.cpus().length;
  const csvFilesList = [];
  const directoryPath = path.resolve(process.cwd(), process.argv[2].toString());
  fs.readdirSync(directoryPath, (err) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
  }).filter(file => path.extname(file) === '.csv').forEach((file) => {
    csvFilesList.push(path.resolve(directoryPath, file));
  });
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  let currentTaskIndex = 0;
  let numOfAllrecords = 0
  Object.values(cluster.workers).forEach((worker) => {
    worker.on('message', (message) => {
      if (message.event === 'taskCompleted') {
        console.log(`Worker process ${worker.process.pid} is done`);
        currentTaskIndex++;
        numOfAllrecords += message.numOfRecords;
        if (currentTaskIndex < csvFilesList.length) {
          worker.send({ taskIndex: currentTaskIndex, filePath: csvFilesList[currentTaskIndex] });
        } else {
          worker.kill();
        }
      }
    });
  });
  let ind = 0;
  Object.values(cluster.workers).forEach((worker) => {
    setTimeout(() => {
      worker.send({ taskIndex: ind, filePath: csvFilesList[ind] });
      ind++;
    }, 1000);
  });

  cluster.on('exit', (worker, code) => {
    console.log(`Worker ${worker.process.pid} exited with code ${code}`);
    if (Object.keys(cluster.workers).length === 0) {
      console.log(`All childs finished their work,and total count of records is: ${numOfAllrecords}`);
      process.exit();
    }
  });
}