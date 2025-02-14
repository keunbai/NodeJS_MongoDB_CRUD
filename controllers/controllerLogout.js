//* User.js 
// [{
//   'username': 'keunbai',
//   'passwd': '$2b$10$3xcqL5jOEWJqy.BACkRrXOJOSnn/uDKgqhQqfaHPtSPc5cLQxMepS',
//   'roles': {'User': 2001},
//   'refreshToken': ~~~
// }]

//* req.body
//*   - Client 에서 직접 입력 
// {
//   ...,
//   user: 'keunbai',
//   pwd: 'Aa$12345',
//   ...
// }


//! Controller 1
//*   - refreshToken 삭제 
//*   - 메모리 업데이트 함수 無
//*
//*   ※ Frontend 에서는 버튼 등으로 로그아웃 시 accessToken 삭제 (여기선 backend 라 구현 불가)
/*
const userDB = require('../model/users.json');

const path = require('path');
const fsPromises = require('fs').promises;

//! For logout route
const handleLogout = async (req, res) => {
  //! Accent Token 삭제 on Client
  //  - button 클릭 시 client 메모리에서 삭제 (frontend 에선 구현 불가)

  //! Refresh Token 확보
  const cookies = req.cookies;
  if (!cookies?.jwt_myApp) {
    return res.sendStatus(204)   // No Content -> ok, stop
  }

  const refreshToken = cookies.jwt_myApp;     

  //! Model file or db 內 refreshToken 확인
  const foundUser = userDB.find(person => person.refreshToken === refreshToken);
  if (!foundUser) {   //? When?
    res.clearCookie('jwt_myApp', {
      httpOnly: true,
      sameSite: 'None',
      //secure: true
    });

    return res.sendStatus(204);   // No Content -> ok, stop
  }

  //! Delete refreshToken in model file or db -> cookie 삭제
  const otherUsers = userDB.filter(person => person.username !== foundUser.username);
  const currentUser = {...foundUser, refreshToken: ''};

  await fsPromises.writeFile(                      // Model DB 파일 업데이트
    path.join(__dirname, '..', 'model', 'users.json'), 
    JSON.stringify([...otherUsers, currentUser])      
  ); 

  res.clearCookie('jwt_myApp', {   
    httpOnly: true, 
    sameSite: 'None', 
    //secure: true,   // Only serves on https! (in production mode)
  });

  res.sendStatus(204);
}
*/


//! Controller 2
//*   - refreshToken 삭제 
//*   - 메모리 업데이트 함수 有
//*
//*   ※ Frontend 에서는 버튼 등으로 로그아웃 시 accessToken 삭제 (여기선 backend 라 구현 불가)
/*
const userDB = {
  users: require('../model/users.json'),
  setUsers: function (data) { 
    this.users = data; 
  }
};

const path = require('path');
const fsPromises = require('fs').promises;

//! For logout route
const handleLogout = async (req, res) => {
  //! Accent Token 삭제 on Client
  //  - button 클릭 시 client 메모리에서 삭제 (frontend 에선 구현 불가)

  //! Refresh Token 확보
  const cookies = req.cookies;
  if (!cookies?.jwt_myApp) {
    return res.sendStatus(204)   // No Content -> ok, stop
  }

  const refreshToken = cookies.jwt_myApp;     

  //! Model file or db 內 refreshToken 확인
  const foundUser = userDB.users.find(person => person.refreshToken === refreshToken);
  if (!foundUser) {   //? When?
    res.clearCookie('jwt_myApp', {
      httpOnly: true,
      sameSite: 'None',
      //secure: true
    });

    return res.sendStatus(204);   // No Content -> ok, stop
  }

  //! Delete refreshToken in model file or db -> cookie 삭제
  const otherUsers = userDB.users.filter(person => person.username !== foundUser.username);
  const currentUser = {...foundUser, refreshToken: ''};

  userDB.setUsers([...otherUsers, currentUser]);   // 데이터 메모리 업데이트

  await fsPromises.writeFile(                      // Model DB 파일 업데이트
    path.join(__dirname, '..', 'model', 'users.json'), 
    JSON.stringify(userDB.users)      
  ); 

  res.clearCookie('jwt_myApp', {   
    httpOnly: true, 
    sameSite: 'None', 
    //secure: true,   // Only serves on https! (in production mode)
  });

  res.sendStatus(204);
}
*/


//! Controller 3
//*   - refreshToken 삭제 
//!   - MongoDB 업데이트
//*
//*   ※ Frontend 에서는 버튼 등으로 로그아웃 시 accessToken 삭제 (여기선 backend 라 구현 불가)

const User = require('../model/User');   //! MongoDB model

//! For logout route
const handleLogout = async (req, res) => {
  //! Accent Token 삭제 on Client
  //  - button 클릭 시 client 메모리에서 삭제 (frontend 에선 구현 불가)

  //! Refresh Token 확보
  const cookies = req.cookies;
  if (!cookies?.jwt_myApp) {
    return res.sendStatus(204)   // No Content -> ok, stop
  }

  const refreshToken = cookies.jwt_myApp;     

  // find user
  //   - Mongoose method
  //   Ref) https://mongoosejs.com/docs/api/model.html#Model.findOne()
  const foundUser = await User.findOne({refreshToken}).exec(); 
  if (!foundUser) {   //? When?
    res.clearCookie('jwt_myApp', {
      httpOnly: true,
      sameSite: 'None',
      //secure: true
    });  
    console.log('Type of foundUser(controllerLogout.js): ', typeof(foundUser));
    console.log('foundUser(controllerLogout.js): ', foundUser);

    return res.sendStatus(204);   // No Content -> ok, stop
  }

  //! Delete refreshToken in mongoDB -> cookie 삭제
  foundUser.refreshToken = '';
  const result = await foundUser.save();   
  console.log(`result(controllerLogout.js): ${result}`);

  res.clearCookie('jwt_myApp', {   
    httpOnly: true, 
    sameSite: 'None', 
    //secure: true,   // Only serves on https! (in production mode)
  });

  //res.json(result);
  res.sendStatus(204);
}


module.exports = { 
  handleLogout 
};