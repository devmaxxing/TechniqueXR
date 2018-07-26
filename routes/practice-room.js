var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('practice-room', { roomName: req.query.room });
});

module.exports = router;
