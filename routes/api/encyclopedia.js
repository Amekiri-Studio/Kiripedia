var express = require("express");
var router = express.Router();
var encyclopedia = require("../../database/encyclopedia");

router.get("/", function (req, res) {
    
})

router.get("/get", async function (req, res) {
    let lang = req.query.lang;
    let eid = req.query.id;
    if (!lang) {
        lang = getBrowserFirstLanguage(req);
    }

    try {
        let result = await encyclopedia.queryEncyclopediaById(eid,lang);
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
        let count = await encyclopedia.queryEncyclopediaCount();
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
    let lasteditorid = req.body.lasteditorid;

    try {
        
    } catch (error) {
        return errorReturn(error, res);
    }
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

module.exports = router;