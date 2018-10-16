import {
    createLogger,
    format,
    transports
} from 'winston'
const {
    combine,
    timestamp,
    json
} = format
import fs from 'fs'
import path from 'path'

var logDir = 'log'; // directory path you want to set
if (!fs.existsSync(logDir)) {
    // Create the directory if it does not exist
    fs.mkdirSync(logDir);
}

const options = {
    console: {
        colorize: true,
        handleExceptions: true,
        json: false,
        level: 'debug',
    },
    file: {
        colorize: false,
        filename: path.join(logDir, '/app.log'),
        handleExceptions: true,
        json: true,
        level: 'info',
        maxFiles: 5,
        maxsize: 5242880, // 5MB
    },
}
const myFormat = combine(timestamp(), json())

const log = createLogger({
    exitOnError: false, // do not exit on handled exceptions
    format: myFormat,
    level: 'info',
    transports: [
        new transports.File(options.file),
        new transports.Console(options.console),
    ],
})

// if (process.env.NODE_ENV !== 'production') {
//   log.add(
//     new transports.Console({
//       format: winston.format.simple(),
//     }),
//   )
// }
log.info(`logs written to ${options.file.filename}`)
export default log
