import * as winston from 'winston';

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({ filename: 'app.log' })
    ]
});


export default logger;