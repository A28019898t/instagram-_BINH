const fs = require('fs');
const fsPromises = require('fs').promises;
const { format } = require('date-fns');
const { v4: uuid } = require('uuid');
const path = require('path');

const logEvent = async (message, logFileName) => {
    const dateTime = `${format(new Date(), 'yyyy-MM-dd\thh:MM:ss')}`;
    const logItem = `${uuid()}\t${dateTime}\t${message}\n`;

    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem);
    } catch (err) {
        console.error(err);
    }
}

const logger = (req, res, next) => {
    console.log(req.method, req.url);
    logEvent(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');

    next();
}

module.exports = { logger, logEvent }