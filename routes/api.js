var express = require("express");
const config = require("../config/config");
var router = express.Router();
const { sendMail } = require("../utils/email");
const { getNewVCodeForEmail, verifyVCodeForEmail } = require("../utils/verify/code");
const { getEmailTemp } = require('../utils/emailtemp');
var email_config = require("../config/email");
var user = require("../database/user");

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

router.post('/email/verify/code/username', async function (req, res) {
    let username = req.body.username;

    try {
        let userInfo = await user.getUserInfoByUsername(username);

        if (JSON.stringify(userInfo) === "[]" || JSON.stringify(userInfo) === "{}") {
            return res.json({
                code:-1,
                message:'username not exists'
            });
        }

        let email = userInfo[0].email;
        let code = getNewVCodeForEmail(email);

        await sendMail(email, email_config.subject, getEmailTemp(code));

        res.json({
            code:0,
            message:'email send successfully'
        });
    }
    catch (err) {
        res.status(500).json({
            code:500,
            message:'error occupied',
            data:err.message
        });
    }
})

module.exports = router;