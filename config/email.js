// Your email config

// smtp email host
const host = "smtp.ym.163.com";

// smtp email port
const port = 994;

// using SSL
const secure = true;

// Warning !!!
// Email is only for test
const user = "noreply@xn--ep5asb.com";
const password = "87654321";

const from = `YourCompanyName <${user}>`;

const subject = "Kiripedia 验证码";


module.exports = {
    host,
    port,
    secure,
    user,
    password,
    from,
    subject
}