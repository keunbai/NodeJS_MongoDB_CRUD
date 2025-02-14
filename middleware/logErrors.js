const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const { format } = require('date-fns');
const { v4: uuid } = require('uuid');


const logErrors = async (msg, logFileName) => {
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

const errorHandler = (err, req, res, next) => {
  logErrors(`${err.name}: ${err.message}`, `errLog.txt`);
  //console.log(err.stack);
  res.status(500).send(err.message);  
  //next();  // 맨마지막 위치, 불필요
};

module.exports = {
  logErrors,
  errorHandler
};