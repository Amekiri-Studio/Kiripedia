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
    verifyVCodeForEmail(email, val => {
        if(val === code) {
            user.createUser(username,nickname,password,email,groups,(result) => {
                res.json({
                    code:0,
                    message:'User create successfully',
                    data: {
                        username:username,
                        nickname:nickname,
                        email:email,
                        group:groups
                    }
                });
            })
        }
        else {
            res.json({
                code:-1,
                message:'Verification code error'
            });
        }
    })
    
})

router.post('/user/login', function (req, res) {

})

router.post('/email/verify/code', function (req, res) {
    let isLogin = false;
    var email;
    if (!isLogin) {
        email = req.body.email;
        let code = getNewVCodeForEmail(email);
        sendMail(email,"Kiripedia 验证码",getEmailTemp(code), (e, i) => {
            res.json(i);
        });
    }
})

module.exports = router;