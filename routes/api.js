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
    res.send(config.website_logo);
})

router.get("/language",function (req,res){
    res.json({
        message:'api invalid temporary'
    });
})

router.post('/email/verify/code', function (req, res) {
    let email = req.body.email;
    
    email = req.body.email;
    let code = getNewVCodeForEmail(email);
    sendMail(email,email_config.subject,getEmailTemp(code), (e, i) => {
        res.json(i);
    });
})

module.exports = router;