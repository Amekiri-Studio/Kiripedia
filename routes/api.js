var express = require("express");
const config = require("../config/config");
const {sqlConnect} = require("../database/mysql_connection");
var router = express.Router();
var user = require('../database/user');
const { sendMail } = require("../utils/email");
const { getNewVCodeForEmail, verifyVCodeForEmail } = require("../utils/verify/code");
const { getEmailTemp } = require('../utils/emailtemp');
var email_config = require("../config/email");
const { getToken, verifyToken } = require("../utils/verify/token");
const { hash_pwd } = require("../utils/password_hash");

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
        if(val === code.toUpperCase()) {
            user.checkInfoIsLegal(username, email, () => {
                res.json({
                    code:-1,
                    message:'Username does exists'
                })
            }, () => {
                res.json({
                    code:-1,
                    message:'Email does exists'
                })
            }, () => {
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
            });
        }
        else {
            res.json({
                code:-1,
                message:'Verification code error'
            });
        }
    })
    
})

// Function user login and return a token
router.post('/user/login', function (req, res) {
    let token = req.cookies.token;
    if(!token) {
        let username = req.body.username;
        let password = req.body.password;
        user.userLogin(username, password, function(b, r) {
            if (b) {
                token = getToken(r[0].userid,r[0].username,r[0].password);
                res.cookie("token", token, {
                    domain:config.cookie_domain,
                    maxAge:config.cookie_max_age
                });
                res.json({
                    code:0,
                    message:'Login successfully',
                    data:{
                        uid:r[0].userid,
                        username:r[0].username,
                        token:token
                     }
                });
            }
            else {
                res.json({
                    code:-1,
                    message:'Username or password incorrect'
                });
            }
        });
    }
    else {
        res.json({
            code:-1,
            message:'You are logged in'
        });
    }
})

router.get("/user/login_status", function(req, res) {
    let token = req.cookies.token;
    if (!token) {
        token = req.query.token;
        if (!token) {
            res.json({
                code:-1,
                message:'User not login or not token provide'
            });
        }
        let info = verifyToken(token, config.token_secret);
        user.checkUserLoginInvalid(info.username, info.password, (b, r) => {
            console.log(b);
            if (b) {
                res.json(info);
            }
            else {
                res.json({
                    code:-1,
                    message:'token invaild'
                });
            }
        });
        
    }
    else {
        info = verifyToken(token, config.token_secret);
        res.json(info);
    }
})

router.get("/user/query/username", function (req, res) {
    let username = req.query.value;
    user.queryExistsUsername(username, r => {
        res.json(r);
    });
})

router.get("/user/query/email", function (req, res) {
    let email = req.query.value;
    user.queryExistsEmail(email,r => {
        res.json(r);
    });
})

router.get("/user/logout", function(req, res) {
    res.clearCookie('token');
    res.json({
        code:0,
        message:'Log out successfully, please remove token on local storage'
    });
})

router.post('/email/verify/code', function (req, res) {
    let isLogin = false;
    var email;
    if (!isLogin) {
        email = req.body.email;
        let code = getNewVCodeForEmail(email);
        sendMail(email,email_config.subject,getEmailTemp(code), (e, i) => {
            res.json(i);
        });
    }
})

module.exports = router;