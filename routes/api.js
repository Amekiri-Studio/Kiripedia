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
const { verifyAuthCode, getNewAuthCode, clearAuthCode } = require("../utils/verify/authcode");

// Root api path
router.get('/',function (req,res) {
    res.status(403);
    res.json({
        message:'no right to access'
    });
})

router.get("/logo",function (req,res) {
    res.send(config.website_logo);
})

router.get("/language",function (req,res){
    res.json({
        message:'api invalid temporary'
    });
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
        let info = verifyToken(token, config.token_secret);
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

router.delete("/user/remove", function(req, res) {
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;
    let code = req.body.code;
    token = tokenCheck(token, req);
    if (token === null) {
        messageShowNoToken(res);
        return;
    }

    let info = verifyToken(token, config.token_secret);

    user.checkUserLoginInvalid(info.username, info.password, (b, r) => {
        if (b) {
            let userInfo = r[0];
            let userEmail = userInfo.email;
            let userid = userInfo.userid;
            if (!code) {
                res.json({
                    code:-1,
                    message:'no verification code provide'
                });
                return;
            }
            verifyVCodeForEmail(userEmail, code, b => {
                if (b) {
                    user.removeUser(userid, result => {
                        res.json({
                            code:0,
                            message:'user remove successfully'
                        });
                    });
                }
                else {
                    res.json({
                        code:-1,
                        message:'Verification code error'
                    });
                }
            })
        }
        else {
            res.json({
                code:-1,
                message:'token invalid'
            });
        }
    });
});

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
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;
    
    token = tokenCheck(token, req);
    if (token === null) {
        messageShowNoToken(res);
        return;
    }
    let info = verifyToken(token, config.token_secret);
    user.checkUserLoginInvalid(info.username, info.password,(b, r) => {
        if (b) {
            let authcode = req.body.authcode;
            let email = req.body.email;
            let code = req.body.code;
            verifyAuthCode(info.username, authcode, b => {
                if (b) {
                    verifyVCodeForEmail(email, code, b => {
                        if (b) {
                            user.queryExistsEmail(email, r => {
                                if (JSON.stringify(r) === "[]" || JSON.stringify(r) === "{}") {
                                    clearAuthCode(info.username);
                                    user.alterUserInfo(info.uid, 'email', email, result => {
                                        res.json({
                                            code:0,
                                            message:'email alter successfully',
                                            data:{
                                                email:email
                                            }
                                        })
                                    });
                                }
                                else {
                                    res.json({
                                        code:-1,
                                        message:'email does exists'
                                    });
                                }
                            });
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
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;
    token = tokenCheck(token, req);
    if (token === null) {
        messageShowNoToken(res);
        return;
    }
    let info = verifyToken(token, config.token_secret);
    let authcode = req.body.authcode;
    let newPassword = req.body.password;
    user.checkUserLoginInvalid(info.username, info.password, (b, r) => {
        if (b) {
            verifyAuthCode(info.username, authcode, b => {
                if (b) {
                    user.alterUserInfo(info.uid, 'password', newPassword, result => {
                        res.json({
                            code:0,
                            message:'alter password successfully'
                        });
                    }, {
                        username:info.username
                    });
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

router.post("/user/alter/nickname", function (req, res) {
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;

    token = tokenCheck(token, req);
    if (token === null) {
        messageShowNoToken(res);
        return;
    }
    let info = verifyToken(token, config.token_secret);
    let nickname = req.body.nickname;
    user.checkUserLoginInvalid(info.username, info.password, (b, r) => {
        if (b) {
            user.alterUserInfo(info.uid, 'nickname', nickname, result => {
                res.json({
                    code:0,
                    message:'alter nickname successfully'
                });
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

router.post("/user/password/reset", function (req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let authcode = req.body.authcode;
    let password = req.body.password;
    if (!username) {
        if (!username && !email) {
            res.json({
                code:-1,
                message:'no username or email provide'
            });
            return;
        }
        user.queryExistsEmail(email, result => {
            if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
                res.json({
                    code:-1,
                    message:'email does not exists'
                });
                return;
            }
            else {
                verifyAuthCodeAndAlterPassword(result[0].userid, result[0].username, authcode, password, res);
            }
        });
    }
    else {
        user.queryExistsUsername(username, result => {
            if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
                res.json({
                    code:-1,
                    message:'username does not exists'
                });
                return;
            }
            else {
                verifyAuthCodeAndAlterPassword(result[0].userid, result[0].username, authcode, password, res);
            }
        });
    }
})

router.post("/user/verify/code", function (req, res) {
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;
    let code = req.body.code;

    token = tokenCheck(token, req);
    if (token === null) {
        res.json({
            code:-1,
            message:"user not login or not token provided"
        });
        return;
    }

    let info = verifyToken(token, config.token_secret);

    user.checkUserLoginInvalid(info.username, info.password, (b, r) => {
        if (b) {
            let userInfo = r[0];
            let userEmail = userInfo.email;
            verifyVCodeForEmail(userEmail, code, b => {
                if (b) {
                    let authcode = getNewAuthCode(userInfo.username);
                    res.json({
                        code:0,
                        message:'verify code successfully',
                        data:{
                            username:userInfo.username,
                            authcode:authcode
                        }
                    });
                }
                else{
                    res.json({
                        code:-1,
                        message:'verification code incorrect'
                    });
                }
            })
        }
        else {
            res.json({
                code:-1,
                message:'token invalid'
            })
        }
    });
})

router.post("/user/verify/code/username", function(req, res) {
    let username = req.body.username;
    let code = req.body.code;
    user.queryExistsUsername(username, result => {
        if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
            res.json({
                code:-1,
                message:'user does not exists'
            });
        }
        else {
            let email = result[0].email;
            let username = result[0].username;
            verifyVCodeForEmail(email, code, b => {
                if (b) {
                    let authcode = getNewAuthCode(username);
                    res.json({
                        code:0,
                        message:'verify code successfully',
                        data:{
                            username:username,
                            authcode:authcode
                        }
                    });
                }
                else {
                    res.json({
                        code:-1,
                        message:'verification code incorrect'
                    });
                }
            });
        }
    });
});

router.post("/user/verify/code/email", function(req, res) {
    let email = req.body.email;
    let code = req.body.code;

    if (!email) {
        res.json({
            code:-1,
            message:'no email provide'
        });
        return;
    }

    user.queryExistsEmail(email, result => {
        if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
            res.json({
                code:-1,
                message:'email does not exists'
            });
        }
        else {
            if (!code) {
                res.json({
                    code:-1,
                    message:'no verification code provide'
                });
                return;
            }
            verifyVCodeForEmail(email, code, b => {
                if (b) {
                    let authcode = getNewAuthCode(result[0].username);
                    res.json({
                        code:0,
                        message:'verify code successfully',
                        data:{
                            email:email,
                            authcode:authcode
                        }
                    });
                }
                else {
                    res.json({
                        code:-1,
                        message:'verification code incorrect'
                    });
                }
            });
        }
    });
});

router.get("/user/info", function (req, res) {
    let uid = req.query.uid;
    res.json({message:'api invalid temporary'});
})

router.get("/user/logout", function(req, res) {
    res.clearCookie('token');
    res.json({
        code:0,
        message:'Log out successfully, please remove token on local storage'
    });
})

router.post('/email/verify/code', function (req, res) {
    let email = req.body.email;
    let token = req.cookies.token;

    if (!email) {
        if (!token) {
            token = req.body.token;
            if (!token) {
                res.json({
                    code:-1,
                    message:'no email provide and no token provide'
                });
                return
            }
        }
    }
    else {
        email = req.body.email;
        let code = getNewVCodeForEmail(email);
        sendMail(email,email_config.subject,getEmailTemp(code), (e, i) => {
            res.json(i);
        });
    }
})

function tokenCheck(token, req) {
    if (!token) {
        token = req.body.token;
        if (!token) {
            return null;
        }
        else {
            return token;
        }
    }
    else {
        return token;
    }
}

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

function messageShowNoToken(res) {
    res.json({
        code:-1,
        message:"user not login or not token provided"
    });
}

function verifyAuthCodeAndAlterPassword(uid ,username, authcode, password, res) {
    verifyAuthCode(username, authcode, b => {
        if (b) {
            user.alterUserInfo(uid, 'password', password, result => {
                clearAuthCode(username);
                res.json({
                    code:0,
                    message:'reset password successfully'
                });
            }, {
                username:username
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

module.exports = router;