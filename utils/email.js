const config = require("../config/email");
const nodemailer = require('nodemailer');

function sendMail(to, subject, html, callback) {
    var transporter = nodemailer.createTransport({
        host: config.host,
        port: 465,
        secure: config.secure,
        auth: {
            user: config.user,
            pass: config.password
        }
    });
    var mailOptions = {
        from: config.from,
        to: to,
        subject: subject,
        html: html
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log(error);
        console.log('Message %s sent: %s', info.messageId, info.response);
        callback(error, info);
    });
}

module.exports = {
    sendMail
}