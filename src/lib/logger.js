const { transports, createLogger, format } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.Console(),
        new transports.File({filename: 'logs/error/error.log', level: 'error'}),
        new transports.File({filename: 'logs/activity/activity.log', level:'info'})
    ]
});   
logger.level = 'debug';

export default logger 