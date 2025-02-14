const express = require('express');
//const app = express();
const router = express.Router();
const controllerRegister = require('../controllers/controllerRegister');  

router.route('/')      //! Group Routing
  .post(controllerRegister.handleNewUser);

//router.post('/', controllerRegister.handleNewUser);

module.exports = router;
