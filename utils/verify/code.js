var redisConn = require('../../database/redis/redis_connection');
const stringRandom = require('string-random');

function getNewVCodeForEmail(email) {
    let code = stringRandom(5).toUpperCase();
    redisConn.setKeyValue(email, code);
    redisConn.setExpire(email, 900);
    return code;
}

function verifyVCodeForEmail(email, code, callback) {
    redisConn.getKeyValue(email, val => {
        let b = code.toUpperCase() === val.toUpperCase();
        if (b) {
            redisConn.delKeyValue(email);
        }
        callback(b);
    });
}

module.exports = {
    getNewVCodeForEmail,
    verifyVCodeForEmail
}