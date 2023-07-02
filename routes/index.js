var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
// robots.txt
router.get('/robots.txt',function (req,res){

})

module.exports = router;
