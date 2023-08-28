var express = require("express");
var router = express.Router();
var contributor = require('../../database/contributor');

router.get("/", function(req, res) {
    return res.status(403).json({
        message:'no right to access'
    });
});

router.get('/post/get', async function(req, res) {
    let eid = req.query.eid;
    let lang = req.query.lang;
    
    if (!lang) {
        lang = getBrowserFirstLanguage(req);
    }

    eid = parseInt(eid);
    try {
        const result = await contributor.getContributor(eid, lang);
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

router.get('/testapi', async function (req, res) {
    let uid = req.query.uid;
    let eid = req.query.eid;
    uid = parseInt(uid);
    eid = parseInt(eid);

    try {
        let contru_list = await contributor.getContributor(eid, 'zh-cn');
        res.json({
            result: await contributor.checkContribution(contru_list, uid)
        });
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