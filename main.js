import path from 'path';
import csv from 'csv-parser';
import fs from 'fs';
import cluster from 'cluster';
import process from 'process'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (cluster.isMaster) {
  const worker = cluster.fork();
  // worker.on('message', message => {
  //     console.log(message);
  // });
  // setTimeout(() => {
      worker.send('From Master');
  // }, 1000);
} else {
  process.on('message', message => {
      console.log(message);
  });

  // process.send('From Worker');
}
// if (cluster.isPrimary) {

//     let numReqs = 0;
//     // setInterval(() => {
//     //   console.log(`numReqs = ${numReqs}`);
//     // }, 1000);
  
//     function messageHandler(msg) {
//       if (msg.cmd && msg.cmd === 'notifyRequest') {
// console.log(msg) ;   
//   }
//     }
  
//     for (let i = 0; i < 2; i++) {
//       cluster.fork();
//     }
  
//     for (const id in cluster.workers) {
//       cluster.workers[id].on('message', messageHandler);
//     }
// } else {
//   // This block of code is where worker process lives

//   // send a mesasge to master process
//   // from worker process
//   process.send({ cmd: 'notifyRequest' });

//   // process.send({ data: "Hi Master!" });
// }

    // checkParams();


    // // Function to distribute files among worker processes
    // function distributeFiles(files) {
    //     return new Promise((resolve, reject) => {
    //         const workers = [];
    //         const results = [];
    //         let completed = 0;

    //         for (let i = 0; i < numWorkers; i++) {
    //             const worker = new Worker(__filename, {
    //                 workerData: { files: files.slice(i * chunkSize, (i + 1) * chunkSize) },
    //             });

    //             worker.on('message', (message) => {
    //                 results.push(...message);
    //                 completed++;

    //                 if (completed === numWorkers) {
    //                     resolve(results);
    //                 }
    //             });

    //             worker.on('error', (error) => {
    //                 reject(error);
    //             });

    //             workers.push(worker);
    //         }

    //         workers.forEach((worker) => {
    //             worker.postMessage('start');
    //         });
    //     });
    // }

    // // Main script
    // if (isMainThread) {
    //     const inputDirectory = process.argv[2];

    //     if (!inputDirectory) {
    //         console.error('Please provide the directory path containing the .csv files.');
    //         process.exit(1);
    //     }

    //     const outputDirectory = path.join(__dirname, 'converted');
    //     const files = fs.readdirSync(inputDirectory).filter((file) => file.endsWith('.csv'));
    //     const numWorkers = cluster.isMaster ? require('os').cpus().length : 1;
    //     const chunkSize = Math.ceil(files.length / numWorkers);

    //     if (!fs.existsSync(outputDirectory)) {
    //         fs.mkdirSync(outputDirectory);
    //     }

    //     const startTime = Date.now();

    //     if (cluster.isMaster) {
    //         distributeFiles(files)
    //             .then((results) => {
    //                 const totalCount = results.reduce((acc, count) => acc + count, 0);
    //                 const duration = Date.now() - startTime;

    //                 console.log(`Total count: ${totalCount}`);
    //                 console.log(`Parsing duration (ms): ${duration}`)
    //             });
    //     }
    // }
