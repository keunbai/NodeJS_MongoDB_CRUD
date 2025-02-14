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
//*   - refresh 접속 시, cookie 內 refreshToken 확인 후 accessToken 새로 발급 
//*   - 메모리 업데이트 함수 無
//*
//*   ※ No userDB update -> GET request
/*
const userDB = require('../model/users.json');

const jwt = require('jsonwebtoken');

//! For refresh route
const handleRefreshToken = (req, res) => {
  // Refresh Token 확보
  const cookies = req.cookies;
  if (!cookies?.jwt) {
    return res.sendStatus(401)   // Unauthorized
  }
  //console.log('cookies', cookies);   

  const refreshToken = cookies.jwt;     
  //console.log('refreshToken', refreshToken);  

  // find user
  const foundUser = userDB.find(person => person.refreshToken === refreshToken);
  if (!foundUser) {
    return res.sendStatus(401);   // Unauthorized
  }

  // Refresh Token 검증
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,   
    (err, decoded) => {  // refreshToken 으로부터 decoded 된 token 정보 확보
      //console.log('decoded', decoded)

      if (err || foundUser.username !== decoded.username) {
        return res.sendStatus(403);  // invalid token -> Forbidden
      }

      // Acess Token 재발급
      const accessToken = jwt.sign(
        {username: decoded.username},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '30s'}   
      );      
      
      // send accessToken to the user, again
      res.json({                                
        'success': `Access Token again to User ${user}!`,      
        accessToken    // Front-end 에서는 accessToken 을 메모리에 저장할것!
      });  
    }
  );
}
*/


//! Controller 2
//*   - refresh 접속 시, cookie 內 refreshToken 확인 후 accessToken 새로 발급 
//*   - 메모리 업데이트 함수 有
//*
//*   ※ No userDB update -> GET request
/*
const userDB = {
  users: require('../model/users.json'),
  setUsers: function (data) { 
    this.users = data; 
  }
};

const jwt = require('jsonwebtoken');

//! For refresh route
const handleRefreshToken = (req, res) => {
  //! Refresh Token 확보
  const cookies = req.cookies;
  if (!cookies?.jwt_myApp) {
    return res.sendStatus(401)   // Unauthorized
  }
  const refreshToken = cookies.jwt_myApp;     

  //! find user
  const foundUser = userDB.users.find(person => person.refreshToken === refreshToken);
  if (!foundUser) {
    return res.sendStatus(401);   // Unauthorized
  }

  //! refreshToken 검증
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,   
    (err, decoded) => {  // refreshToken 으로부터 decoded 된 token 정보 확보
      //console.log('decoded', decoded)

      if (err || foundUser.username !== decoded.username) {   //? When? ref. comments below
        console.log(err.message);
        return res.sendStatus(403);  // invalid token -> Forbidden
      }

      // Access Token 재발급
      const roles = Object.values(decoded.roles);  //! 로그인 user 의 roles '코드값' 배열

      const accessToken = jwt.sign(
        {                            
          userInfo: {
            username: decoded.username,
            roles   //! payload 추가
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '30s'}   
      );

      // send accessToken to the user, again
      res.json({                                
        'success': `Access Token again to User ${foundUser.username}!`,      
        accessToken    // Front-end 에서는 accessToken 을 메모리에 저장할것!
      });  
    }
  );
}
*/


//! Controller 3
//*   - refresh 접속 시, cookie 內 refreshToken 확인 후 accessToken 새로 발급 
//!   ※ No MongoDB update -> GET request

const User = require('../model/User');   //! MongoDB model
const jwt = require('jsonwebtoken');

//! For refresh route
const handleRefreshToken = async (req, res) => {
  // Refresh Token 확보
  const cookies = req.cookies;
  if (!cookies?.jwt_myApp) {
    return res.sendStatus(401)   // Unauthorized
  }
  const refreshToken = cookies.jwt_myApp;     

  // find user
  //   - Mongoose method
  //   Ref) https://mongoosejs.com/docs/api/model.html#Model.findOne()
  const foundUser = await User.findOne({refreshToken}).exec(); 
  if (!foundUser) {
    return res.sendStatus(403);   // Forbidden
  }
  console.log('Type of foundUser(controllerRefreshToken.js): ', typeof(foundUser));
  console.log('foundUser(controllerRefreshToken.js): ', foundUser);   //! MongoDB collection 의 document

  //! refreshToken 검증
  jwt.verify(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET,   
    (err, decoded) => {  // refreshToken 으로부터 decoded 된 token 정보 확보
      console.log('decoded', decoded)

      if (err || foundUser.username !== decoded.username) {   //? When? ref. comments below
        console.log(err.message);
        return res.sendStatus(403);  // invalid token -> Forbidden
      }

      // Access Token 재발급
      const roles = Object.values(foundUser.roles);  //! 로그인 user 의 roles '코드값' 배열

      const accessToken = jwt.sign(
        {                            
          userInfo: {
            username: decoded.username,
            roles   //! payload 추가
          }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: '30s'}   
      );

      // send accessToken to the user, again
      res.json({                                
        'success': `Access Token again to User ${foundUser.username}!`,      
        accessToken    // Front-end 에서는 accessToken 을 메모리에 저장할것!
      });  
    }
  );
}



module.exports = { 
  handleRefreshToken 
};


//! Essentially, the verification of the jwt happens just above this and should provide the err before the or condition is necessary. 
//! It doesn't hurt to have it there, but the err should happen beforehand. 
//! That said, in the bonus chapter provided after this series, I change this logic for refresh token rotation here: 
//! https://youtu.be/s-4k5TcGKHg