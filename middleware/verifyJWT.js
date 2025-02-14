//! JWT 토큰(accessToken) 검증 custom middleware 

const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
  //! accessToken 확보

  const authHeader = req.headers.authorization || req.headers.Authorization;
  //const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.sendStatus(401);   // Unauthorized
  }
  //console.log('authHeader', authHeader);   // Bearer token

  const accessToken = authHeader.split(' ')[1];
  //console.log('accessToken', accessToken);

  /*
  const { authorization } = req.headers;
  if (!authorization?.startsWith('Bearer ')) {
    return res.sendStatus(401);   // Unauthorized
  }
  //console.log('authorization', authorization);   // 'Bearer token'

  const accessToken = authorization.split(' ')[1];     // 'Bearer' 제외 'token' 만 발췌
  //console.log('accessToken', accessToken);  
  */

  //! accessToken 검증
  jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET,   
    (err, decoded) => {  // accessToken 으로부터 decoded 된 token 정보 확보
      if (err) {
        return res.sendStatus(403);  // invalid token -> Forbidden
      }

      //console.log('decoded', decoded)
      req.user = decoded.userInfo.username;   // 발급된 accessToken 참조  //? why needs?
      req.roles = decoded.userInfo.roles;

      //next();                        
    }
  );

  next();
};


module.exports = verifyJWT;

