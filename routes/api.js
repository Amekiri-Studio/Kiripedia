var express = require("express");
const config = require("../config/config");
const {sqlConnect} = require("../database/mysql_connection");
var router = express.Router();
var user = require('../database/user');
const { sendMail } = require("../utils/email");
const { getNewVCodeForEmail, verifyVCodeForEmail } = require("../utils/verify/code");
const { getEmailTemp } = require('../utils/emailtemp');

// Root api path
router.get('/',function (req,res) {

})

router.get("/logo",function (req,res) {
    res.send(config.website_logo);
})

router.get("/language",function (req,res){

})

// Function user operation
router.post('/user/add',function (req,res){
    var username = req.body.username;
    var nickname = req.body.nickname;
    var password = req.body.password;
    var email = req.body.email;
    var groups = req.body.groups;
    var code = req.body.code;
    user.createUser(username,nickname,password,email,groups,(result) => {
        res.json(result);
    })
})

router.post('/email/verify', function (req, res) {

})

router.get("/mysqltest",function (req,res) {
    sqlConnect();
})

router.get("/emailtest", function(req,res) {
    sendMail("reiwa4@126.com","TEST",getEmailTemp('12345'),(e,i) => {
        console.log(e);
        console.log(i);
        res.send(i);
    });
})

router.get('/redistest', function(req,res) {
    getNewVCodeForEmail('test@test.com');
    verifyVCodeForEmail('abc', val => {
        res.send(val);
    });
})

module.exports = router;