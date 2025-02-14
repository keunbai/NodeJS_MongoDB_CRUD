const express = require('express');
//const app = express();
const router = express.Router();
const controllerLogout = require('../controllers/controllerLogout');  

router.route('/')      //! Group Routing
  .post(controllerLogout.handleLogout);    // userDB update -> POST request

//router.post('/', controllerLogout.handleLogout);

module.exports = router;