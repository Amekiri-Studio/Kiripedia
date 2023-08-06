const config = require("../config/email");
const nodemailer = require('nodemailer');

async function sendMail(to, subject, html) {
    return new Promise((resolve,reject) => {
        var transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
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
            if (error) {
                console.log(error);
                return reject(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
            resolve(info);
        });
    })
}

function cutEmail(email) {
    return email.substring(email.indexOf('@'), email.length);
}
function hideEmail(email) {
    var res = '';
    var emailUsername = email.substring(0, email.indexOf('@'));
    if (emailUsername.length < 6) {
        res = email.substring(0, 1) + '****' + email.substring(email.indexOf('@'), email.length);
    }
    else {
        res = email.substring(0, 2) + '****' + emailUsername.substring(emailUsername.length - 2, emailUsername.length) + email.substring(email.indexOf('@'), email.length);
    }

    return res;
}

module.exports = {
    sendMail,
    cutEmail,
    hideEmail
}