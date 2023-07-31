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
const { verifyAuthCode } = require("../utils/verify/authcode");

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
    
    verifyVCodeForEmail(email, code, b => {
        if(b) {
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
    let username = req.body.username;
    let password = req.body.password;
    
    if(!token) {
        doLogin(username, password, req, res);
    }
    else {
        let info = verifyToken(info);
        user.checkUserLoginInvalid(info.username,info.password,(b, r) => {
            if (b) {
                res.json({
                    code:-1,
                    message:'You are logged in'
                });
            }
            else {
                doLogin(username,password,req,res);
            }
        })
        
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
        doTokenCheckAndResponseToken(info, req, res);
    }
    else {
        info = verifyToken(token, config.token_secret);
        doTokenCheckAndResponseToken(info, req, res);
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

router.post("/user/alter/email", function (req, res) {
    let token = req.cookies.token;
    
    if (!token) {
        token = req.body.token;
        if (!token) {
            res.json({
                code:-1,
                message:"user not login or not token provided"
            });
        }
    }
    let info = verifyToken(token, config.token_secret);
    user.checkUserLoginInvalid(info.username, info.password,(b, r) => {
        if (b) {
            let authcode = req.body.author;
            let email = req.body.email;
            let code = req.body.code;
            verifyAuthCode(info.username, authcode, b => {
                if (b) {
                    verifyVCodeForEmail(email, code, b => {
                        if (b) {

                        }
                        else {
                            res.json({
                                code:-1,
                                message:'new email verification code incorrect'
                            })
                        }
                    })
                }
                else {
                    res.json({
                        code:-1,
                        message:'authorization code incorrect'
                    });
                }
            });
        }
        else {
            res.json({
                code:-1,
                message:'token invalid'
            })
        }
    });
})

router.post("/user/alter/password", function (req, res) {
    
})

router.post("/user/verify/code", function (req, res) {
    let username = req.body.username;
    let email = req.body.email;
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

function doLogin(username, password, req, res) {
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

function doTokenCheckAndResponseToken(info, req, res) {
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

module.exports = router;