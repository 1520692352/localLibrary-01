var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //重定向到这，默认发送 HTTP 状态代码“302 Found”。可以根据需要更改返回的状态代码、设置绝对或相对路径。
  res.redirect('/catalog' );
});

module.exports = router;
