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
const { processUserAvatarPath } = require("../../utils/imagepath/processpath");
const { password } = require("../../config/mysql");

const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        
        let uploadPath;

        let token = req.cookies.token;
        if (!token) {
            token = req.body.token;
            if (!token) {
                return cb(new Error('no token provide'));
            }
        }

        let info = verifyToken(token, config.token_secret);
        user.checkUserLoginInvalid(info.username, info.password, (b, r) => {
            if (b) {
                uploadPath = path.join(config.image_path, r[0].userid.toString());
                fs.mkdir(uploadPath, { recursive: true }, (err) => {
                    if (err) {
                        return cb(err);
                    }
                    cb(null, uploadPath);
                })
            }
            else {
                cb(new Error("token invalid"));
            }
        });
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
                username:username,
                nickname:nickname,
                email:email,
                group:groups
            }
        });
    
    } catch (err) {
        return res.json({
            code:-1,
            message:'error occupied',
            data:err
        });
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
            let resultObject = await user.checkInfoIsLegal(info.username, info.password);
            if (resultObject.isValid) {
                return res.json({
                    code:-1,
                    message:'You are logged in'
                });
            }
            doLogin(username,password,req,res);
        } catch (err) {
            return res.json({
                code:-1,
                message:'error occupied',
                data:err
            });
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
        return res.json({
            code:-1,
            message:'error occupied',
            data:err
        });
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
        return res.json({
            code:-1,
            message:'error occupied',
            data:err
        });
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
        return res.json({
            code:-1,
            message:'error occupied',
            data:err
        });
    }
})

router.post("/email/alter", async function (req, res) {
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;
    
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
        return res.json({
            code:-1,
            message:'error occupied',
            data:err
        });
    }
    
})

router.post("/password/alter", async function (req, res) {
    let swagger_scan_only = req.body.token;
    let token = req.cookies.token;
    token = tokenCheck(token, req);
    if (token === null) {
        messageShowNoToken(res);
        return;
    }
    try {
        let info = verifyToken(token, config.token_secret);
        let authcode = req.body.authcode;
        let newPassword = req.body.password;

        let resultObject = await user.checkUserLoginInvalid(info.username, info.password);

        if (!resultObject.inValid) {
            return res.json({
                code:-1,
                message:'token invalid'
            })
        }

        let authcodeCorrection = await verifyAuthCode(username, authcode);

        if (!authcodeCorrection) {
            return res.json({
                code:-1,
                message:'authorization code incorrect'
            });
        }

        let alterPwdResult = await user.alterUserInfo(info.uid, 'password', newPassword, {
            username:info.username
        });

        res.json({
            code:0,
            message:'alter password successfully'
        });

    } catch (err) {
        return res.json({
            code:-1,
            message:'error occupied',
            data:err
        });
    }
})

// router.post("/nickname/alter", function (req, res) {
//     let swagger_scan_only = req.body.token;
//     let token = req.cookies.token;

//     token = tokenCheck(token, req);
//     if (token === null) {
//         messageShowNoToken(res);
//         return;
//     }
//     let info = verifyToken(token, config.token_secret);
//     let nickname = req.body.nickname;
//     user.checkUserLoginInvalid(info.username, info.password, (b, r) => {
//         if (b) {
//             user.alterUserInfo(info.uid, 'nickname', nickname, result => {
//                 res.json({
//                     code:0,
//                     message:'alter nickname successfully'
//                 });
//             });
//         }
//         else {
//             res.json({
//                 code:-1,
//                 message:'token invalid'
//             })
//         }
//     });
// })

// router.post('/avatar/alter', function (req, res) {
//     let type = req.body.type;
//     if (!type) {
//         type = 'server';
//     }

//     if (type == 'server') {
//         avatarUpload.single('image')(req, res, (err) => {
//             if (err) {
//                 // 发生错误，返回错误响应
//                 return res.json({
//                     code:-1,
//                     message:err.message
//                 });
//             }

//             if (!req.file) {
//                 return res.json({
//                     code:-1,
//                     message:'no image provide'
//                 });
//             }
//             // 获取文件路径和文件名
//             const path = req.file.path;
//             const fileName = req.file.filename;
//             const uri = processUserAvatarPath(path);
        
//             res.json({
//                 code:0,
//                 message:'upload successfully',
//                 data:{
//                     imageuri:config.image_uri + uri
//                 }
//             });
//         });
//     }
//     else if (type == 'client') {

//     }
//     else {
//         res.json({
//             code:-1,
//             message:'type error'
//         });
//     }
// })

// router.post("/password/reset", function (req, res) {
//     let username = req.body.username;
//     let email = req.body.email;
//     let authcode = req.body.authcode;
//     let password = req.body.password;
//     if (!username) {
//         if (!username && !email) {
//             res.json({
//                 code:-1,
//                 message:'no username or email provide'
//             });
//             return;
//         }
//         user.queryExistsEmail(email, result => {
//             if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
//                 res.json({
//                     code:-1,
//                     message:'email does not exists'
//                 });
//                 return;
//             }
//             else {
//                 verifyAuthCodeAndAlterPassword(result[0].userid, result[0].username, authcode, password, res);
//             }
//         });
//     }
//     else {
//         user.queryExistsUsername(username, result => {
//             if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
//                 res.json({
//                     code:-1,
//                     message:'username does not exists'
//                 });
//                 return;
//             }
//             else {
//                 verifyAuthCodeAndAlterPassword(result[0].userid, result[0].username, authcode, password, res);
//             }
//         });
//     }
// })

// router.post("/verify/code", function (req, res) {
//     let swagger_scan_only = req.body.token;
//     let token = req.cookies.token;
//     let code = req.body.code;

//     token = tokenCheck(token, req);
//     if (token === null) {
//         res.json({
//             code:-1,
//             message:"user not login or not token provided"
//         });
//         return;
//     }

//     let info = verifyToken(token, config.token_secret);

//     user.checkUserLoginInvalid(info.username, info.password, (b, r) => {
//         if (b) {
//             let userInfo = r[0];
//             let userEmail = userInfo.email;
//             verifyVCodeForEmail(userEmail, code, b => {
//                 if (b) {
//                     let authcode = getNewAuthCode(userInfo.username);
//                     res.json({
//                         code:0,
//                         message:'verify code successfully',
//                         data:{
//                             username:userInfo.username,
//                             authcode:authcode
//                         }
//                     });
//                 }
//                 else{
//                     res.json({
//                         code:-1,
//                         message:'verification code incorrect'
//                     });
//                 }
//             })
//         }
//         else {
//             res.json({
//                 code:-1,
//                 message:'token invalid'
//             })
//         }
//     });
// })

// router.post("/verify/code/get", function (req, res) {
//     let token = req.cookies.token;
//     if (!token) {
//         token = req.body.token;
//         if (!token) {
//             messageShowNoToken(res);
//             return;
//         }
//     }
//     let info = verifyToken(token, config.token_secret);
//     user.checkUserLoginInvalid(info.username, info.password, (b, r) => {
//         if (b) {
//             let email = r[0].email;
//             let code = getNewVCodeForEmail(email);
//             sendMail(email,email_config.subject,getEmailTemp(code), (e, i) => {
//                 res.json({
//                     code:0,
//                     message:'email send successfully'
//                 });
//             });
//         }
//         else {
//             res.json({
//                 code:-1,
//                 message:'token invalid'
//             });
//         }
//     });
// })

// router.post("/verify/code/username", function(req, res) {
//     let username = req.body.username;
//     let code = req.body.code;
//     user.queryExistsUsername(username, result => {
//         if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
//             res.json({
//                 code:-1,
//                 message:'user does not exists'
//             });
//         }
//         else {
//             let email = result[0].email;
//             let username = result[0].username;
//             verifyVCodeForEmail(email, code, b => {
//                 if (b) {
//                     let authcode = getNewAuthCode(username);
//                     res.json({
//                         code:0,
//                         message:'verify code successfully',
//                         data:{
//                             username:username,
//                             authcode:authcode
//                         }
//                     });
//                 }
//                 else {
//                     res.json({
//                         code:-1,
//                         message:'verification code incorrect'
//                     });
//                 }
//             });
//         }
//     });
// });

// router.post("/verify/code/email", function(req, res) {
//     let email = req.body.email;
//     let code = req.body.code;

//     if (!email) {
//         res.json({
//             code:-1,
//             message:'no email provide'
//         });
//         return;
//     }

//     user.queryExistsEmail(email, result => {
//         if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
//             res.json({
//                 code:-1,
//                 message:'email does not exists'
//             });
//         }
//         else {
//             if (!code) {
//                 res.json({
//                     code:-1,
//                     message:'no verification code provide'
//                 });
//                 return;
//             }
//             verifyVCodeForEmail(email, code, b => {
//                 if (b) {
//                     let authcode = getNewAuthCode(result[0].username);
//                     res.json({
//                         code:0,
//                         message:'verify code successfully',
//                         data:{
//                             email:email,
//                             authcode:authcode
//                         }
//                     });
//                 }
//                 else {
//                     res.json({
//                         code:-1,
//                         message:'verification code incorrect'
//                     });
//                 }
//             });
//         }
//     });
// });

// router.get("/info", function (req, res) {
//     let uid = req.query.uid;
//     user.queryUserId(uid, result => {
//         if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
//             res.json({
//                 code:-1,
//                 message:'user does not exists'
//             });
//             return;
//         }
//         let userInfo = result[0];
//         if (userInfo.user_status === -1) {
//             res.json({
//                 code:-1,
//                 message:'user removed'
//             });
//             return;
//         }
//         res.json({
//             code:0,
//             message:'Get user info successfully',
//             data:{
//                 uid:userInfo.userid,
//                 username:userInfo.username,
//                 nickname:userInfo.nickname,
//                 avatar:userInfo.avatar,
//                 email:hideEmail(userInfo.email)
//             }
//         });
//     });
// })

// router.get("/logout", function(req, res) {
//     res.clearCookie('token');
//     res.json({
//         code:0,
//         message:'Log out successfully, please remove token on local storage'
//     });
// })

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
        return res.json({
            code:-1,
            message:'error occupied',
            data:err
        });
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

        res.json(info);
    }
    catch (err) {
        return res.json({
            code:-1,
            message:'error occupied',
            data:err
        });
    }
}

function messageShowNoToken(res) {
    res.json({
        code:-1,
        message:"user not login or not token provided"
    });
}

// function verifyAuthCodeAndAlterPassword(uid ,username, authcode, password, res) {
//     verifyAuthCode(username, authcode, b => {
//         if (b) {
//             user.alterUserInfo(uid, 'password', password, result => {
//                 clearAuthCode(username);
//                 res.json({
//                     code:0,
//                     message:'reset password successfully'
//                 });
//             }, {
//                 username:username
//             })
//         }
//         else {
//             res.json({
//                 code:-1,
//                 message:'authorization code incorrect'
//             });
//         }
//     });
// }

// function checkEmailOrUsernameExistsAndSendMessage(result, res) {
//     if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
//         res.json({
//             code:0,
//             result:false
//         });
//     }
//     else {
//         res.json({
//             code:0,
//             result:true
//         });
//     }
// }

module.exports = router;