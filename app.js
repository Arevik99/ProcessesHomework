import fs from 'fs';
import { Transform } from 'stream';
import process from 'process';
import path from 'path';
function checkParams() {
    if (process.argv.length != 5) {
        process.stderr.write("Invalid number of arguments!");
        process.exit();
    }
    if (!["uppercase", "lowercase", "reverse"].includes(process.argv[4])) {
        process.stderr.write("Invalid operation name!");
        process.exit();
    }
    else {
        doStreamOperations(process.argv[2].toString(), process.argv[3].toString(), process.argv[4].toString());
    }
}

function doStreamOperations(sourceFile, targetFile, operationName) {
    const sourceFilePath = path.resolve(process.cwd(), sourceFile);
    const readableStream = fs.createReadStream(sourceFilePath);

    const targetFilePath = path.resolve(process.cwd(), targetFile);
    const writtableStream = fs.createWriteStream(targetFilePath);

    const transformStream = new Transform({
        transform(chunk, encoding, callback) {
            switch (operationName) {
                case "uppercase": {
                    callback(null, chunk.toString().toUpperCase());
                    break;
                }
                case "lowercase": {
                    callback(null, chunk.toString().toLowerCase());
                    break;
                }
                case "reverse": {
                    let splitString = chunk.toString().split("");
                    let reverseArray = splitString.reverse();
                    callback(null, reverseArray.join(""));
                    break;
                }
            }
        }
    });
    readableStream.on('error', function (e) { process.stderr.write(e.toString()) }).
        pipe(transformStream).on('error', function (e) { process.stderr.write(e.toString()) }).
        pipe(writtableStream).on('error', function (e) { process.stderr.write(e.toString()) });
}
checkParams();