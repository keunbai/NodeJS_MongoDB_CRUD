const express = require('express');
//const app = express();
const router = express.Router();
const controllerAuth = require('../controllers/controllerAuth');  

router.route('/')      //! Group Routing
  .post(controllerAuth.handleLogin);

//router.post('/', controllerAuth.handleLogin);

module.exports = router;
