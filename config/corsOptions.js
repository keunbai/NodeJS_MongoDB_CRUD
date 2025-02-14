const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
  origin: (origin, callback) => {                        // 파라미터 origin - 서버 접근 도메인(클라이언트)
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {   // origin === null <- localhost:3500 에서 접근 시
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200
};

module.exports = corsOptions;