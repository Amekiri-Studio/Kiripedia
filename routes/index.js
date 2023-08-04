var express = require('express');
const { robots_txt } = require('../config/config');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// robots.txt
router.get('/robots.txt',function (req,res){
  res.setHeader("Content-Type", "text/plain");
  res.send(robots_txt);
})

module.exports = router;
