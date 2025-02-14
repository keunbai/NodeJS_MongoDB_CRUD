//* User.js 
// [{
//   'username': 'keunbai',
//   'passwd': '$2b$10$3xcqL5jOEWJqy.BACkRrXOJOSnn/uDKgqhQqfaHPtSPc5cLQxMepS',
//   'roles': {'User': 2001},
//   'refreshToken': ~~~
// }]

//* req.body
// {
//   ...,
//   user: 'keunbai',
//   pwd: 'Aa$12345',
//   ...
// }


//! Controller 1
//*   - 사용자 로그인 시 인증 
//*   - Model 파일 업데이트 -> JSON file 응답 API
/*
const userDB = require('../model/users.json');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const path = require('path');
const fsPromises = require('fs').promises;

//! For authentication route
const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    return res.status(400).json({'message': 'Username and password are required'});
  }

  // find login user
  const foundUser = userDB.find(person => person.username === user);
  if (!foundUser) {
    return res.sendStatus(401);   // Unauthorized
  }

  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.passwd);
  if (match) {
    const roles = Object.values(foundUser.roles);  //! 로그인 user 의 roles '코드값' 배열

    //! create JWTs
    const accessToken = jwt.sign(
      {                            
        UserInfo: {
          username: foundUser.username,
          roles   //! accessToken payload 추가
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: '30s'}   
    );

    const refreshToken = jwt.sign(
      {username: foundUser.username},
      process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: '1d'}    // 1 day
    );

    //! save refreshToken with current user in the DB (for log-out)
    //!   <- POST request 
    const otherUsers = userDB.filter(person => person.username !== foundUser.username);
    const currentUser = {...foundUser, refreshToken};

    await fsPromises.writeFile(   // Model DB 파일 업데이트 
      path.join(__dirname, '..', 'model', 'users.json'), 
      JSON.stringify([...otherUsers, currentUser])      
    ); 

    //! send refreshToken/accessToken to the user (순서 주의!)
    res.cookie('jwt_myApp', refreshToken, {   // refreshToken
      httpOnly: true, 
      sameSite: 'None', 
      //secure: true,   // 활성화 시 cookie 원활히 전달 안됨 (사례: refresh 접속)
      maxAge: 24 * 60 * 60 * 1000   // 1 day
    }); 

    res.json({                                // accessToken
      'success': `User ${user} is logged in!`,      
      accessToken    // Front-end 에서는 accessToken 을 메모리에 저장할것!
    }); 
  } else {
    res.sendStatus(401);   // Unauthorized
  }
};
*/


//! Controller 2
//*   - 사용자 로그인 시 인증 
//*   - 메모리 업데이트 -> Model 파일 업데이트 -> JSON file 응답 API
/*
const userDB = {
  users: require('../model/users.json'),
  setUsers: function (data) { 
    this.users = data; 
  }
};

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const path = require('path');
const fsPromises = require('fs').promises;

//! For authentication route
const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;   
  if (!user || !pwd) {
    return res.status(400).json({'message': 'Username and password are required'});
  }

  // find login user
  const foundUser = userDB.users.find(person => person.username === user);
  if (!foundUser) {
    return res.sendStatus(401);   // Unauthorized
  }

  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.passwd);
  if (match) {
    const roles = Object.values(foundUser.roles);  //! 로그인 user 의 roles '코드값' 배열

    //! create JWTs
    const accessToken = jwt.sign(
      {                            
        userInfo: {
          username: foundUser.username,
          roles   //! accessToken payload 추가
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: '30s'}   
    );

    const refreshToken = jwt.sign(
      {username: foundUser.username},
      process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: '1d'}    
    );

    //console.log('accessToken', accessToken);
    //console.log('refreshToken', refreshToken);

    //! save refreshToken with current user in the DB (for log-out)
    //!   <- POST request 
    const otherUsers = userDB.users.filter(person => person.username !== foundUser.username);
    const currentUser = {...foundUser, refreshToken};

    userDB.setUsers([...otherUsers, currentUser]);   // 데이터 메모리 업데이트
    //console.log(userDB.users);

    await fsPromises.writeFile(                      // Model DB 파일 업데이트
      path.join(__dirname, '..', 'model', 'users.json'), 
      JSON.stringify(userDB.users)      
    ); 

    //! send accessToken/refreshToken to the user
    res.cookie('jwt_myApp', refreshToken, {   // refreshToken
      httpOnly: true, 
      sameSite: 'None', 
      //secure: true,   // 활성화 시 cookie 원활히 전달 안됨 (사례: refresh 접속)
      maxAge: 24 * 60 * 60 * 1000  // 1 day
    });

    res.json({                                // accessToken
      'success': `User ${user} is logged in!`,      
      accessToken    // Front-end 에서는 accessToken 을 메모리에 저장할것!
    });    
  } else {
    res.sendStatus(401);   // Unauthorized
  }
};
*/

//! Controller 3
//*   - 사용자 로그인 시 인증
//*   - MongoDB 업데이트

const User = require('../model/User');   //! MongoDB model

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//! For authentication route
const handleLogin = async (req, res) => {
  const { user, pwd } = req.body;   
  if (!user || !pwd) {
    return res.status(400).json({'message': 'Username and password are required'});
  }

  //! find login user
  //   - Mongoose method
  //     Ref) https://mongoosejs.com/docs/api/model.html#Model.findOne()  
  const foundUser = await User.findOne({username: user}).exec();  
  if (!foundUser) {
    return res.sendStatus(401);   // Unauthorized
  }
  console.log('Type of foundUser(controllerAuth.js): ', typeof(foundUser));  // object
  console.log('foundUser(controllerAuth.js): ', foundUser);   //! MongoDB collection 의 document

  // evaluate password
  const match = await bcrypt.compare(pwd, foundUser.passwd);
  if (match) {
    const roles = Object.values(foundUser.roles);  //! 로그인 user 의 roles '코드값' 배열

    //! create JWTs
    const accessToken = jwt.sign(
      {                            
        userInfo: {
          username: foundUser.username,
          roles   //! accessToken payload 추가
        }
      },
      process.env.ACCESS_TOKEN_SECRET,
      {expiresIn: '30s'}   
    );

    const refreshToken = jwt.sign(
      {username: foundUser.username},   // username only!
      process.env.REFRESH_TOKEN_SECRET,
      {expiresIn: '1d'}    
    );

    //console.log('accessToken', accessToken);
    //console.log('refreshToken', refreshToken);

    //! save refreshToken with current user in the DB (for log-out)
    //   <- POST request 
    foundUser.refreshToken = refreshToken;
    const result = await foundUser.save();   
    console.log(`result(controllerAuth.js): ${result}`);

    //! send accessToken/refreshToken to the user
    res.cookie('jwt_myApp', refreshToken, {   // refreshToken
      httpOnly: true, 
      sameSite: 'None', 
      //secure: true,   // 활성화 시 cookie 원활히 전달 안됨 (사례: refresh 접속)
      maxAge: 24 * 60 * 60 * 1000  // 1 day
    });

    res.json({                                // accessToken
      'success': `User ${user} is logged in!`,      
      accessToken    // Front-end 에서는 accessToken 을 메모리에 저장할것!
    });    
  } else {
    res.sendStatus(401);   // Unauthorized
  }
};


module.exports = {
  handleLogin
};

//module.exports = handleLogin;   // 여기선 비추


//! status() vs sendStatus()
//! {secure: true} thunder client 테스트 시에는 비활성화, Chrome 이나 production 시에는 활성화 필요
//! If the backend and frontend are on the same domain we don't need to set the "Same Site: none".

/*
const obj = {
  a: 'somestring',
  b: 42,
  c: false,
};

console.log(Object.values(obj));  // 객체 내 속성값들의 배열 반환
*/
