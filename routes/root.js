const path = require('path');

const express = require('express');
//const app = express();
const router = express.Router();


router.get('^/$|/index(.html)?', (_req, res) => {   // '^/$' - RegEx, starts & ends with '/' 
  res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
});


module.exports = router;