var express = require("express");
const config = require("../config/config");
const {sqlConnect} = require("../database/mysql_connection");
var router = express.Router();
var user = require('../database/user');

router.get('/',function (req,res) {

})

router.get("/logo",function (req,res) {
    res.send(config.website_logo);
})

router.get("/language",function (req,res){

})

router.post('/user/add',function (req,res){
    var username = req.body.nickname;
    var password = req.body.password;
    var email = req.body.email;
    var groups = req.body.groups;
    var code = req.body.code;
    user.createUser(username,password,email,groups,(result) => {
        res.json(result);
    })
})

router.get("/mysqltest",function (req,res) {
    sqlConnect();
})

module.exports = router;