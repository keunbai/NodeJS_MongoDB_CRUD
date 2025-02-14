const express = require('express');
//const app = express();
const router = express.Router();
const controllerRefreshToken = require('../controllers/controllerRefreshToken');  

router.route('/')      //! Group Routing
  .get(controllerRefreshToken.handleRefreshToken);    // No userDB update -> GET request

//router.get('/', controllerRefreshToken.handleRefreshToken);

module.exports = router;
