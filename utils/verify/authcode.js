var redisConn = require('../../database/redis/redis_connection');
const stringRandom = require('string-random');

function getNewAuthCode(username) {
    let code = stringRandom(64).toLowerCase();
    redisConn.setKeyValue(username, code);
    redisConn.setExpire(username, 900);
    return code;
}

async function verifyAuthCode(username, authcode) {
    return new Promise((resolve, reject) => {
        redisConn.getKeyValue(username).then(value => {
            let b = value === authcode.toLowerCase();
            resolve(b);
        }).catch(err => {
            reject(err);
        });
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