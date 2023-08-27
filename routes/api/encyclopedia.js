var express = require("express");
var router = express.Router();
var encyclopedia = require("../../database/encyclopedia");
const { verifyToken } = require("../../utils/verify/token");
var config = require("../../config/config");
var user = require("../../database/user");

router.get("/", function (req, res) {
    
})

router.get("/get", async function (req, res) {
    let lang = req.query.lang;
    let eid = req.query.id;
    if (!lang) {
        lang = getBrowserFirstLanguage(req);
    }

    try {
        let result = await encyclopedia.queryEncyclopediaById(parseInt(eid),lang);
        res.json({
            code:0,
            message:'query ok',
            data:{
                result
            }
        });
    } catch (error) {
        return errorReturn(error, res);
    }
})

router.get("/search", async function (req, res) {
    let lang = req.query.lang;
    let keyword = req.query.keyword;
    let start = req.query.start;
    let limit = req.query.limit;

    if (!lang) {
        lang = getBrowserFirstLanguage(req);
    }

    try {
        let count = await encyclopedia.queryEncyclopediaCount(lang, keyword);
        let result = await encyclopedia.queryEncyclopediaByKeywordWithRange(keyword, lang, parseInt(start), parseInt(limit));
        res.json({
            code:0,
            message:'query ok',
            data:{
                count:count[0]['count(*)'],
                result
            }
        });
    } catch (error) {
        return errorReturn(error, res);
    }
})

router.post("/create", async function (req, res) {
    let lang = req.body.lang;
    let eid = req.body.eid;
    let title = req.body.title;
    let content = req.body.content;
    let describe = req.body.describe;
    let category = req.body.category;
    let token = req.cookies.token;

    if (!lang) {
        lang = getBrowserFirstLanguage(req);
    }

    if (!token) {
        token = req.body.token;
        if (!token) {
            return messageShowNoToken(res);
        }
    }

    try {
        let tokenInfo = verifyToken(token, config.token_secret);
        let resultObject = await user.checkUserLoginInvalidAndCheckPermission(tokenInfo.username, tokenInfo.password, 1);

        if (!resultObject.isValid) {
            return res.json({
                code:-1,
                message:resultObject.message
            });
        }

        if (eid) {
            let isExists = await encyclopedia.queryExistsPostOnLanguage(eid, lang);
            if (isExists) {
                return res.json({
                    code:-1,
                    message:'Cannot add post because post does exists'
                });
            }
        }

        let insertResult = await encyclopedia.addPost(eid, title, category, describe, content, tokenInfo.uid, lang);

        res.json({
            code:0,
            message:'post create successfully',
            data:{
                title:title,
                describe:describe,
                category:category
            }
        });

    } catch (error) {
        return errorReturn(error, res);
    }
})

router.post('/alter', async function (req, res) {
    let lang = req.body.lang;
    let eid = req.body.id;
    let title = req.body.title;
    let content = req.body.content;
    let describe = req.body.describe;
    let token = req.cookies.token;

    if (!lang) {
        lang = getBrowserFirstLanguage(req);
    }

    if (!token) {
        token = req.body.token;
        if (!token) {
            return messageShowNoToken(res);
        }
    }

    try {
        let tokenInfo = verifyToken(token, config.token_secret);
        let permission = encyclopedia.checkPostPremission(eid);
        let resultObject;

        if (permission == 1) {
            resultObject = await user.checkUserLoginInvalidAndCheckPermission(tokenInfo.username, tokenInfo.password, 1);
        }
        
        else {
            resultObject = await user.checkUserLoginInvalidAndCheckPermission(tokenInfo.username, tokenInfo.password, 2);
        }

        if (!resultObject.isValid) {
            return res.json({
                code:-1,
                message:resultObject.message
            });
        }

        let updateResult = await encyclopedia.alterPost(eid, title, describe, content, tokenInfo.uid, lang);

        res.json({
            code:0,
            message:'alter successfully',
            data:{
                updateResult
            }
        });
    } catch (error) {
        return errorReturn(error, res);
    }
})

router.post("/remove", async function (req, res) {
    let eid = req.body.id;
    let lang = req.body.lang;
})

function getBrowserFirstLanguage(req) {
    // 获取 Accept-Language 头部内容
    const acceptLanguageHeader = req.get('Accept-Language');

    // 将 Accept-Language 头部内容解析为语言标签数组
    const languages = acceptLanguageHeader.split(',');

    // 提取第一个语言标签作为用户首选语言
    const userPreferredLanguage = languages[0];

    // 返回用户首选语言
    return userPreferredLanguage;
}

function errorReturn(err ,res) {
    console.log(err);
    return res.status(500).json({
        code:500,
        message:'error occupied',
        data:err
    });
}

function messageShowNoToken(res) {
    return res.json({
        code:-1,
        message:"user not login or not token provided"
    });
}

module.exports = router;