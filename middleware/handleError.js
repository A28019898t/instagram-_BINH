const { logEvent } = require('./logger')

const handleError = (err, req, res, next) => {
    console.error(err);
    logEvent(`${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errorLog.log');
    next();
}

module.exports = handleError