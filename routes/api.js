var express = require("express");
const config = require("../config/config");
var router = express.Router();
const { sendMail } = require("../utils/email");
const { getNewVCodeForEmail, verifyVCodeForEmail } = require("../utils/verify/code");
const { getEmailTemp } = require('../utils/emailtemp');
var email_config = require("../config/email");

// Root api path
router.get('/',function (req,res) {
    res.status(403);
    res.json({
        message:'no right to access'
    });
})

router.get("/logo",function (req,res) {
    res.json({
        code:0,
        message:'query ok',
        data:{
            uri:config.website_logo
        }
    });
})

router.get("/language",function (req,res){
    // 获取 Accept-Language 头部内容
    const acceptLanguageHeader = req.get('Accept-Language');

    // 将 Accept-Language 头部内容解析为语言标签数组
    const languages = acceptLanguageHeader.split(',');

    // 提取第一个语言标签作为用户首选语言
    const userPreferredLanguage = languages[0];

    // 返回用户首选语言
    // res.send(`Your preferred language is: ${userPreferredLanguage}`);
    res.json({
        code:0,
        message:'Get local language successfully',
        data:{
            languages:languages,
            preferred:userPreferredLanguage
        }
    });
})

router.post('/email/verify/code', async function (req, res) {
    let email = req.body.email;
    
    email = req.body.email;
    let code = getNewVCodeForEmail(email);
    try {
        let result = await sendMail(email,email_config.subject,getEmailTemp(code));
        res.json(result);
    }
    catch (err) {
        res.json({
            code:-1,
            message:'error occupied',
            data:err
        });
    }
})

module.exports = router;