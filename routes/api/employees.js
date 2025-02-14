//const path = require('path');

const express = require('express');
//const app = express();
const router = express.Router();
const controllerEmployees = require('../../controllers/controllerEmployees');  
//const verifyJWT = require('../../middleware/verifyJWT'); 
const ROLES_LIST = require('../../config/roles_list'); 
const verifyRoles = require('../../middleware/verifyRoles');  

router.route('/')      // Group Routing
  //.get(verifyJWT,controllerEmployees.getAllEmployees)   // 개별 JWT 검증
  .get(controllerEmployees.getAllEmployees)   //! 모든 로그인 user 가능
  .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),controllerEmployees.createNewEmployee)  
  .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor),controllerEmployees.updateEmployee)  
  .delete(verifyRoles(ROLES_LIST.Admin),controllerEmployees.deleteEmployee);

router.route('/:id')   // Dynamic Routing
  .get(controllerEmployees.getEmployee);   //! 모든 로그인 user 가능      

module.exports = router;