var express = require("express");
const {website_logo, website_name} = require("../config/config");
var router = express.Router();

router.get('/',function (req,res) {

})

router.get("/logo",function (req,res) {
    res.send(website_logo);
})

module.exports = router;