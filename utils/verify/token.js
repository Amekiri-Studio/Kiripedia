const jwt = require('jsonwebtoken');
const { token_secret } = require('../../config/config');

function getToken(uid ,username, password_hash) {
    let payload = {
        uid:uid, 
        username:username,
        password:password_hash
    };
    let token = jwt.sign(payload, token_secret);
    return token;
}

function verifyToken(token, secret) {
    return jwt.verify(token, secret);
}

module.exports = {
    getToken,
    verifyToken
}