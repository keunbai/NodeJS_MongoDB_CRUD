const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const { format } = require('date-fns');
const { v4: uuid } = require('uuid');


const logEvents = async (msg, logFileName) => {
  const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
  const logItem = `${dateTime}\t${uuid()}\t${msg}\n`;
  //console.log(logItem);

  try{
    if (!fs.existsSync(path.join(__dirname, '../logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '../logs'));
    }
    await fsPromises.appendFile(path.join(__dirname, '../logs', logFileName), logItem);  
  } catch (err) {
    console.error(err);
  }
};

const logger = (req, _res, next) => {
  logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, `reqLog.txt`);
  console.log(`${req.method} ${req.path}`);
  next();
};

module.exports = {
  logEvents,
  logger
};
