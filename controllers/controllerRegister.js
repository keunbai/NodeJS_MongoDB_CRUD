//* User.js 
// [{
//   'username': 'keunbai',
//   'passwd': '$2b$10$3xcqL5jOEWJqy.BACkRrXOJOSnn/uDKgqhQqfaHPtSPc5cLQxMepS',
//   'roles': {'User': 2001},
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
//*   - 사용자 등록 (Sign-up)
//*   - Model 파일 업데이트 -> JSON file 응답 API
/*
const userDB = require('../model/users.json');

const path = require('path');
const fsPromises = require('fs').promises;
const bcrypt = require('bcrypt');

//! For register route
const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    return res.status(400).json({'message': 'Username and password are required'});
  }

  // Check for duplicate usernames in the db
  const duplicate = userDB.find(person => person.username === user);
  if (duplicate) {
    return res.sendStatus(409);   // conflict
  }
  
  // Register new user to userDB
  try {
    // encrypt the password
    const pwdHashed = await bcrypt.hash(pwd, 10);  // salting

    // store the new user
    // (simulation of json server or user table in db)
    const newUser = {
      username: user,
      passwd: pwdHashed,
      roles: {    //! user role 생성 (default)    
        user: 2001
      }      
    };

    await fsPromises.writeFile(      // Model DB 파일 업데이트
      path.join(__dirname, '..', 'model', 'users.json'), 
      JSON.stringify([...userDB, newUser])      
    );

    // 응답
    res.status(201).json({'success': `New user ${user} created!`})  // Created
  } catch (err) {
    res.status(500).json({'message': `Hey, ${err.message}`});   // server error
  }
};
*/


//! Controller 2
//*   - 사용자 등록 (Sign-up)
//*   - 메모리 업데이트 -> Model 파일 업데이트 -> JSON file 응답 API
/*
const userDB = {
  users: require('../model/users.json'),
  setUsers: function (data) { 
    this.users = data; 
  }
};

const path = require('path');
const fsPromises = require('fs').promises;
const bcrypt = require('bcrypt');

//! For register route
const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;   
  if (!user || !pwd) {
    return res.status(400).json({'message': 'Username and password are required'});
  }

  // Check for duplicate usernames in the db
  const duplicate = userDB.users.find(person => person.username === user);
  if (duplicate) {
    return res.sendStatus(409);   // conflict
  }
  
  // Register new user to userDB
  try {
    // encrypt the password
    const pwdHashed = await bcrypt.hash(pwd, 10);  // salting

    // store the new user
    // (simulation of json server or user table in db)
    //   <- POST request     
    const newUser = {
      username: user,
      passwd: pwdHashed,
      roles: {    //! user role 생성 (default)    
        user: 2001
      }
    };

    userDB.setUsers([...userDB.users, newUser]);  // 데이터 메모리 업데이트
    console.log(userDB.users);
    
    await fsPromises.writeFile(                   // Model DB 파일 업데이트
      path.join(__dirname, '..', 'model', 'users.json'), 
      JSON.stringify(userDB.users)      
    );

    // 응답
    res.status(201).json({'success': `New user ${user} created!`})  // Created
  } catch (err) {
    res.status(500).json({'message': `Hey, ${err.message}`});   // server error
  }
};
*/


//! Controller 3
//*   - 사용자 등록 (Sign-up)
//!   - MongoDB 업데이트

const User = require('../model/User');   //! MongoDB model
const bcrypt = require('bcrypt');

//! For register route
const handleNewUser = async (req, res) => {
  const { user, pwd } = req.body;   
  if (!user || !pwd) {
    return res.status(400).json({'message': 'Username and password are required'});
  }

  // Check for duplicate usernames in the MongoDB
  //   - Mongoose method
  //     Ref) https://mongoosejs.com/docs/api/model.html#Model.findOne()
  const duplicate = await User.findOne({username: user}).exec();  
  if (duplicate) {
    return res.sendStatus(409);   // conflict
  }
  
  // Register new user to MongoDB
  //   - Mongoose method
  try {
    // encrypt the password
    const pwdHashed = await bcrypt.hash(pwd, 10);  // salting

    // store the new user
    //   <- POST request     
    // ※ Mongoose method 이용한 new user 생성 몇가지 방법 有
    const result = await User.create({
      username: user,
      passwd: pwdHashed,
      // roles: {    //! Mongoose schema 에서 default로 지정    
      //   user: 2001
      // }
    });
    console.log(`result(controllerRegister.js): ${result}`);

    // 응답
    res.status(201).json({'success': `New user ${user} created!`})  // Created
  } catch (err) {
    res.status(500).json({'message': `Hey, ${err.message}`});   // server error
  }
};


module.exports = {
  handleNewUser
};

//module.exports = handleNewUser;   // 여기선 비추


