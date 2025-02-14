//! ================================================
//! [MongoDB] Async CRUD Operations
//*   - Asynchronous CRUD operations 구현 
//*
//!   -> Thunder Client extension 이용해서 라우팅 결과 확인
//*     ① 로그인
//*     ② Refresh
//*     ③ 로그아웃
//*
//*     ④ 앱매뉴(employees) CRUD 
//*        : 로그인으로 accessToken 확보
//*        : 항상 'keunbai' user 로 로그인 (superuser role) 
//*        : 실행 결과는 MongoDB 서버에서도 확인
//* 
//*   (from 14tut-mongodb-schemas-data-models)
//! ================================================


//! ------------------------------------------------
//! 4. '로그인' -> 'Refresh' -> '로그아웃' 
//*    - Mongoose method 이용 MongoDB 연계 ('users' collection)
//*
//*    ① controller/controllerAuth.js 수정
//*    ② controller/controllerRefreshToken.js 수정
//*       ※ No MongoDB update -> GET request
//*    ③ controller/controllerLogout.js 수정
//! ------------------------------------------------


//! ------------------------------------------------
//! 5. '앱 서비스 메뉴 CRUD 구현'  
//*    - Mongoose method 이용 MongoDB 연계 ('employees' collection)
//*
//*    ④ controller/controllerEmployees.js 수정 
//*
//*    (29:56)
//! ------------------------------------------------

const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');

const express = require('express');
const app = express();

const { logEvents, logger } = require('./middleware/logEvents');  
const { logErrors, errorHandler } = require('./middleware/logErrors');  
const verifyJWT = require('./middleware/verifyJWT');  
const credentials = require('./middleware/credentials');
const cookieParser = require('cookie-parser');

const mongoose = require('mongoose');
const connectDB = require('./config/dbConn');

const routerRoot = require('./routes/root');
const routerEmployees = require('./routes/api/employees');
const routerRegister = require('./routes/register');
const routerAuth = require('./routes/auth');
const routerRefresh = require('./routes/refresh');
const routerLogout = require('./routes/logout');

const PORT = process.env.PORT || 3500;


//! Connect to MongoDB
connectDB();

//! Server setup 1
//*   - Custom middleware

// custom middleware logger
app.use(logger);

// custom middle to handle options credentials check
// and fetch cookies credentials requirement
// (before CORS!)
app.use(credentials);


//! Server setup 2
//*   - Third party middleware

// CORS (Cross Origin Resource Sharing)
//app.use(cors());           // 모든 도메인 허용
app.use(cors(corsOptions));  // whitelist 등록 도메인만 허용


//! Server setup 3
//*   - Built-in middleware

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({extended: false}));

// built-in middleware for json
app.use(express.json());

// built-in middleware for cookies
app.use(cookieParser());

// built-in middleware for static files
app.use('/', express.static(path.join(__dirname, '/public')));


//! Server setup 4
//*   - Router
app.use('/', routerRoot);
app.use('/register', routerRegister);
app.use('/auth', routerAuth);
app.use('/refresh', routerRefresh);
app.use('/logout', routerLogout);

app.use(verifyJWT);   //! Custom middleware - accessToken authorization
app.use('/employees', routerEmployees);   // api routes (여기선 json 데이터 파일 전달 -> static file 설정 不要)


//! Server setup 5
//*   - Route handlers

// Not found
//app.get('/*', (_req, res) => {  
//  //res.sendFile(path.join(__dirname, 'views', '404.html'));   // 200, not found but status code for success
//  res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));   
//});

app.all('*', (req, res) => {   // https://developer-doreen.tistory.com/35
  res.status(404);

  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not Found'});
  } else {
    res.type('txt').send('404 Not Found');
  }
});


//! Server setup 1
//*   - Custom middleware

// custom error handler
app.use(errorHandler);


//! MongoDB open
mongoose.connection.once('open', () => {
  console.log('Connected to MongoDB');

  //! Server waiting
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});



