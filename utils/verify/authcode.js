var redisConn = require('../../database/redis/redis_connection');
const stringRandom = require('string-random');

function getNewAuthCode(username) {
    let code = stringRandom(64).toLowerCase();
    redisConn.setKeyValue(username, code);
    redisConn.setExpire(username, 900);
    return code;
}

function verifyAuthCode(username, authcode, callback) {
    redisConn.getKeyValue(username, val => {
        let b = val === authcode.toLowerCase();
        callback(b);
    });
}

function clearAuthCode(username) {
    redisConn.delKeyValue(username);
}

module.exports = {
    getNewAuthCode,
    verifyAuthCode,
    clearAuthCode
}