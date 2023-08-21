var express = require("express");
const config = require("../../config/config");
var router = express.Router();
var user = require('../../database/user');
const { getNewVCodeForEmail, verifyVCodeForEmail } = require("../../utils/verify/code");
const { getEmailTemp } = require('../../utils/emailtemp');
const { getToken, verifyToken } = require("../../utils/verify/token");
const { verifyAuthCode, getNewAuthCode, clearAuthCode } = require("../../utils/verify/authcode");
const { sendMail, hideEmail } = require("../../utils/email");
var email_config = require("../../config/email");
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { processUserAvatarPath, getUidOnPath } = require("../../utils/imagepath/processpath");

const avatarStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        
        let uploadPath;

        let token = req.cookies.token;
        if (!token) {
            token = req.body.token;
            if (!token) {
                return cb(new Error('no token provide'));
            }
        }
        try {
            let info = verifyToken(token, config.token_secret);
            let resultObject = await user.checkUserLoginInvalid(info.username, info.password);
            if (!resultObject.isValid) {
                return cb(new Error("token invalid"));
            }
            uploadPath = path.join(config.image_path, info.uid.toString());
            console.log(uploadPath);
            await fs.promises.mkdir(uploadPath, { recursive: true });
            cb(null, uploadPath);
        } catch (error) {
            return cb(error);
        }
    },
    filename: function (req, file, cb) {
        // 使用当前日期和时间来作为文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
  });

const avatarUpload = multer({ storage: avatarStorage });

// Root api path
router.get('/',function (req,res) {
    res.status(403);
    res.json({
        message:'no right to access'
    });
})

// Function user operation
router.post('/add',async function (req,res){
    var username = req.body.username;
    var nickname = req.body.nickname;
    var password = req.body.password;
    var email = req.body.email;
    var groups = req.body.groups;
    var code = req.body.code;
    
    try {
        let isCodeCorrect = await verifyVCodeForEmail(email, code);
        if (!isCodeCorrect) {
            return res.json({
                code:-1,
                message:'Verification code error'
            });
        }

        let tempExistsValue = await user.queryExistsUsername(username);

        if (tempExistsValue) {
            return res.json({
                code:-1,
                message:'Username does exists'
            });
        }
    
        tempExistsValue = await user.queryExistsEmail(email);
    
        if (tempExistsValue) {
            return res.json({
                code:-1,
                message:'Email does exists'
            });
        }
    
        let result = await user.createUser(username, nickname, password, email, groups);

        res.json({
            code:0,
            message:'User create successfully',
            data: {
                uid:result.insertId,
                username:username,
                nickname:nickname,
                email:email,
                group:groups
            }
        });
    
    } catch (err) {
        return errorReturn(err, res);
    }
})

// Function user login and return a token
router.post('/login', async function (req, res) {
    let token = req.cookies.token;
    let username = req.body.username;
    let password = req.body.password;
    
    if(!token) {
        doLogin(username, password, req, res);
    }
    else {
        try {
            let info = verifyToken(token, config.token_secret);
            let resultObject = await user.checkUserLoginInvalid(info.username, info.password);
            if (resultObject.isValid) {
                return res.json({
                    code:-1,
                    message:'You are logged in'
                });
            }
            doLogin(username,password,req,res);
        } catch (err) {
            return errorReturn(err, res);
        }
    }
})

router.post("/remove", async function(req, res) {
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;
    let code = req.body.code;
    token = tokenCheck(token, req);
    if (token === null) {
        messageShowNoToken(res);
        return;
    }

    try {
        let info = verifyToken(token, config.token_secret);
        let resultObject = await user.checkUserLoginInvalid(info.username, info.password);

        if (!resultObject.isValid) {
            return res.json({
                code:-1,
                message:'token invalid'
            });
        }

        if (!code) {
            return res.json({
                code:-1,
                message:'no verification code provide'
            });
        }
        let email = resultObject.result[0].email;

        let codeCorrection = await verifyVCodeForEmail(email, code);

        if (!codeCorrection) {
            return res.json({
                code:-1,
                message:'Verification code error'
            });
        }

        let removeResult = await user.removeUser(resultObject.result[0].userid);
        res.json({
            code:0,
            message:'user remove successfully'
        });
    }
    catch (err) {
        return errorReturn(err, res);
    }
});

router.get("/login_status", function(req, res) {
    let token = req.cookies.token;
    if (!token) {
        token = req.query.token;
        if (!token) {
            return res.json({
                code:-1,
                message:'User not login or not token provide'
            });
        }
        doTokenCheckAndResponseToken(token, req, res);
    }
    else {
        doTokenCheckAndResponseToken(token, req, res);
    }
})

router.get("/query/username", async function (req, res) {
    let username = req.query.value;
    try {
        let isExists = await user.queryExistsUsername(username);
        res.json({
            code:0,
            result:isExists
        });
    }
    catch (err) {
        return errorReturn(err, res);
    }
})

router.get("/query/email", async function (req, res) {
    let email = req.query.value;
    try {
        let isExists = await user.queryExistsEmail(email);
        res.json({
            code:0,
            result:isExists
        });
    }
    catch (err) {
        return errorReturn(err, res);
    }
})

router.post("/email/alter", async function (req, res) {
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;
    
    token = tokenCheck(token, req);
    if (token === null) {
        return messageShowNoToken(res);
    }
    try {
        let info = verifyToken(token, config.token_secret);
        let resultObject = await user.checkUserLoginInvalid(info.username, info.password);

        if (!resultObject.isValid) {
            return res.json({
                code:-1,
                message:'token invalid'
            });
        }

        let authcode = req.body.authcode;
        let email = req.body.email;
        let code = req.body.code;
        let authcodeCorrection = await verifyAuthCode(info.username, authcode);
        if (!authcodeCorrection) {
            return res.json({
                code:-1,
                message:'authorization code incorrect'
            });
        }

        let emailVCodeCorrection = await verifyVCodeForEmail(email, code);

        if (!emailVCodeCorrection) {
            return res.json({
                code:-1,
                message:'email does exists'
            });
        }

        let emailExist = await user.queryExistsEmail(email);
        if (emailExist) {
            return res.json({
                code:-1,
                message:'email does exists'
            });
        }

        let emailAlterResult = user.alterUserInfo(info.uid, 'email', email);

        res.json({
            code:0,
            message:'email alter successfully',
            data:{
                email:email
            }
        })

    } catch (err) {
        return errorReturn(err, res);
    }
    
})

router.post("/password/alter", async function (req, res) {
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;
    token = tokenCheck(token, req);
    if (token === null) {
        return messageShowNoToken(res);
    }
    try {
        let info = verifyToken(token, config.token_secret);
        let authcode = req.body.authcode;
        let newPassword = req.body.password;

        let resultObject = await user.checkUserLoginInvalid(info.username, info.password);

        if (!resultObject.isValid) {
            return res.json({
                code:-1,
                message:'token invalid'
            })
        }

        let authcodeCorrection = await verifyAuthCode(info.username, authcode);

        if (!authcodeCorrection) {
            return res.json({
                code:-1,
                message:'authorization code incorrect'
            });
        }

        clearAuthCode(info.username);
        let alterPwdResult = await user.alterUserInfo(info.uid, 'password', newPassword, {
            username:info.username
        });

        res.json({
            code:0,
            message:'alter password successfully'
        });

    } catch (err) {
        return errorReturn(err, res);
    }
})

router.post("/nickname/alter", async function (req, res) {
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;

    token = tokenCheck(token, req);
    if (token === null) {
        messageShowNoToken(res);
        return;
    }
    try {
        let info = verifyToken(token, config.token_secret);
        let nickname = req.body.nickname;

        resultObject = await user.checkUserLoginInvalid(info.username, info.password);

        if (!resultObject.isValid) {
            return res.json({
                code:-1,
                message:'token invalid'
            })
        }

        let alterResult = await user.alterUserInfo(info.uid, 'nickname', nickname);

        res.json({
            code:0,
            message:'alter nickname successfully',
            data:{
                nickname:nickname
            }
        });
    }
    catch (err) {
        return errorReturn(err, res);
    }
})

router.post('/avatar/alter', async function (req, res) {
    let type = req.body.type;
    if (!type) {
        type = 'server';
    }

    try {
        if (type == 'server') {
            const fileUploadPromise = new Promise((resolve, reject) => {
                avatarUpload.single('image')(req, res, (err) => {
                    if (err) {
                        console.log(err.message);
                        reject(err); // 发生错误，拒绝 Promise 并传递错误
                    } else {
                        resolve(); // 完成上传，解决 Promise
                    }
                }
            )});
            
            await fileUploadPromise;
            
            if (!req.file) {
                return res.json({
                    code: -1,
                    message: 'no image provide'
                });
            }
            
            const path = req.file.path;
            const fileName = req.file.filename;
            const uri = processUserAvatarPath(path);
            console.log(uri);
            let uid = getUidOnPath(uri);
            console.log(uid);
            await user.alterUserInfo(uid, 'avatar', config.image_uri + uri);
            res.json({
                code: 0,
                message: 'upload successfully',
                data: {
                    imageuri: config.image_uri + uri
                }
            });
        }
        else if (type == 'client') {
            let token = req.cookies.token;
            if (!token) {
                token = req.body.token;
                if (!token) {
                    return messageShowNoToken(res);
                }
            }
            let image_path = req.body.image_path;
            let info = verifyToken(token, config.token_secret);

            let resultObject = await user.checkUserLoginInvalid(info.username, info.password);

            if (!resultObject.isValid) {
                return res.json({
                    code:-1,
                    message:'token invalid'
                });
            }

            await user.alterUserInfo(resultObject.result[0].userid, 'avatar', image_path);
            res.json({
                code: 0,
                message: 'alter successfully',
                data: {
                    imageuri: config.image_uri + uri
                }
            })
        }
        else {
            res.json({
                code:-1,
                message:'type error'
            });
        }
    } catch (err) {
        if (err.message.toLowerCase() === "no token provide") {
            return res.send({
                code:-1,
                message:err.message
            })
        }
        return errorReturn(err, res);
    }
})

router.post("/password/reset", async function (req, res) {
    let username = req.body.username;
    let email = req.body.email;
    let authcode = req.body.authcode;
    let password = req.body.password;

    try {
        if (!username) {
            if (!username && !email) {
                return res.json({
                    code:-1,
                    message:'no username or email provide'
                });
            }
            let userInfo = await user.getUserInfoByEmail(email);
            if (userInfo.length == 0) {
                return res.json({
                    code:-1,
                    message:'email does not exists'
                });
            }
            verifyAuthCodeAndAlterPassword(userInfo[0].userid, userInfo[0].username, authcode, password, res);
        }
        else {
            let userInfo = await user.getUserInfoByUsername(username);
            if (userInfo.length == 0) {
                return res.json({
                    code:-1,
                    message:'username does not exists'
                });
            }
            verifyAuthCodeAndAlterPassword(userInfo[0].userid, userInfo[0].username, authcode, password, res);
        }
    } catch (error) {
        return errorReturn(error, res);
    }
    
})

router.post("/verify/code", async function (req, res) {
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;
    let code = req.body.code;

    token = tokenCheck(token, req);
    if (token === null) {
        return res.json({
            code:-1,
            message:"user not login or not token provided"
        });
    }

    try {
        let info = verifyToken(token, config.token_secret);
        let resultObject = await user.checkUserLoginInvalid(info.username, info.password);
        if (!resultObject.isValid) {
            return res.json({
                code:-1,
                message:'token invalid'
            })
        }

        let userInfo = resultObject.result[0];
        let isCodeCorrect = verifyVCodeForEmail(userInfo.email, code);

        if (!isCodeCorrect) {
            return res.json({
                code:-1,
                message:'verification code incorrect'
            });
        }

        let authcode = getNewAuthCode(userInfo.username);
        res.json({
            code:0,
            message:'verify code successfully',
            data:{
                username:userInfo.username,
                authcode:authcode
            }
        });
    } catch (error) {
        errorReturn(error,res)
    }
    
})

router.post("/verify/code/get",async function (req, res) {
    let token = req.cookies.token;
    if (!token) {
        token = req.body.token;
        if (!token) {
            return messageShowNoToken(res);
        }
    }
    try {
        let info = verifyToken(token, config.token_secret);
        let resultObject = await user.checkUserLoginInvalid(info.username, info.password);

        if (!resultObject) {
            return res.json({
                code:-1,
                message:'token invalid'
            });
        }

        let email = resultObject.result[0].email;
        let code = getNewVCodeForEmail(email);
        await sendMail(email, email_config.subject, getEmailTemp(code));

        res.json({
            code:0,
            message:'email send successfully'
        });
    } catch (error) {
        return errorReturn(error, res);
    }
})

router.post("/verify/code/username", async function(req, res) {
    let username = req.body.username;
    let code = req.body.code;

    try {
        let usernameExist = await user.queryExistsUsername(username);

        if (!usernameExist) {
            return res.json({
                code:-1,
                message:'username does not exists'
            });
        }

        let result = await user.getUserInfoByUsername(username);
        let email = result[0].email;
        username = result[0].username;

        let codeCorrection = await verifyVCodeForEmail(email, code);

        if (!codeCorrection) {
            return res.json({
                code:-1,
                message:'verification code incorrect'
            });
        }

        let authcode = getNewAuthCode(username);
        res.json({
            code:0,
            message:'verify code successfully',
            data:{
                username:username,
                authcode:authcode
            }
        });
    } catch (error) {
        return errorReturn(error, res);
    }
});

router.post("/verify/code/email", async function(req, res) {
    let email = req.body.email;
    let code = req.body.code;

    if (!email) {
        return res.json({
            code:-1,
            message:'no email provide'
        });
    }

    try {
        let emailExist = await user.queryExistsEmail(email);

        if (!emailExist) {
            return res.json({
                code:-1,
                message:'email does not exists'
            });
        }

        if (!code) {
            return res.json({
                code:-1,
                message:'no verification code provide'
            });
        }

        let codeCorrection = await verifyVCodeForEmail(email, code);

        if (!codeCorrection) {
            return res.json({
                code:-1,
                message:'verification code incorrect'
            });
        }

        let result = await user.getUserInfoByEmail(email);
        let username = result[0].username;

        let authcode = getNewAuthCode(username);
        res.json({
            code:0,
            message:'verify code successfully',
            data:{
                email:email,
                authcode:authcode
            }
        });
    } catch (error) {
        return errorReturn(error, res);
    }
});

router.get("/info", async function (req, res) {
    let uid = req.query.uid;

    try {
        let userObject = await user.queryUserId(uid);

        if (JSON.stringify(userObject) === "[]" || JSON.stringify(userObject) === "{}") {
            return res.json({
                code:-1,
                message:'user does not exists'
            });
        }

        let userInfo = userObject[0];
        if (userInfo.user_status === -1) {
            res.json({
                code:-1,
                message:'user removed'
            });
            return;
        }
        res.json({
            code:0,
            message:'Get user info successfully',
            data:{
                uid:userInfo.userid,
                username:userInfo.username,
                nickname:userInfo.nickname,
                avatar:userInfo.avatar,
                email:hideEmail(userInfo.email)
            }
        });
    } catch(error) {
        return errorReturn(error, res);
    }
})

router.get("/logout", function(req, res) {
    res.clearCookie('token');
    res.json({
        code:0,
        message:'Log out successfully, please remove token on local storage'
    });
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

async function doLogin(username, password, req, res) {
    try {
        let resultObject = await user.userLogin(username, password);

        if (resultObject.status) {
            token = getToken(resultObject.result[0].userid,resultObject.result[0].username,resultObject.result[0].password);
            res.cookie("token", token, {
                domain:config.cookie_domain,
                maxAge:config.cookie_max_age
            });
            res.json({
                code:0,
                message:'Login successfully',
                data:{
                    uid:resultObject.result[0].userid,
                    username:resultObject.result[0].username,
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
    }
    catch (err) {
        return errorReturn(err, res);
    }
}

async function doTokenCheckAndResponseToken(token, req, res) {
    try {
        let info = verifyToken(token, config.token_secret);
        let resultObject = await user.checkUserLoginInvalid(info.username, info.password);
        if (!resultObject.isValid) {
            return res.json({
                code:-1,
                message:'token invaild'
            });
        }

        res.json({
            code:0,
            message:'get successfully',
            data:{
                uid:info.uid,
                username:info.username
            }
        });
    }
    catch (err) {
        return errorReturn(err, res);
    }
}

function messageShowNoToken(res) {
    return res.json({
        code:-1,
        message:"user not login or not token provided"
    });
}

async function verifyAuthCodeAndAlterPassword(uid ,username, authcode, password, res) {
    try {
        let correction = await verifyAuthCode(username, authcode);
        if (!correction) {
            return res.json({
                code:-1,
                message:'authorization code incotrrect'
            });
        }

        await user.alterUserInfo(uid, 'password', password, {username:username});
        clearAuthCode(username);
        res.json({
            code:0,
            message:'reset password successfully'
        });
    } catch (error) {
        return errorReturn(error, res);
    }
}

function errorReturn(err ,res) {
    console.log(err);
    return res.status(500).json({
        code:500,
        message:'error occupied',
        data:err
    });
}

module.exports = router;