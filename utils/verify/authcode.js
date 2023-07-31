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
        let b = val.toLowerCase() === authcode.toLowerCase();
        if (b) {
            redisConn.delKeyValue(username);
        }
        callback(b);
    });
}

module.exports = {
    getNewAuthCode,
    verifyAuthCode
}