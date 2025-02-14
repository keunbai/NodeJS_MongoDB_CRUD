//! https://velog.io/@effirin/CORS%EB%9E%80-%EB%AC%B4%EC%97%87%EC%9D%B8%EA%B0%80
//! 화면7-1_CORS_error_credentials_include.png 확인

const allowedOrigins = require('../config/allowedOrigins');

const credentials = (req, res, next) => {
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', true);
  }

  next();
};


module.exports = credentials;