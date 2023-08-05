var redisConn = require('../../database/redis/redis_connection');
const stringRandom = require('string-random');

function getNewVCodeForEmail(email) {
    let code = stringRandom(5).toUpperCase();
    redisConn.setKeyValue(email, code);
    redisConn.setExpire(email, 900);
    return code;
}

async function verifyVCodeForEmail(email, code) {
    return new Promise((resolve, reject) => {
        redisConn.getKeyValue(email).then(value => {
            let b = value === code.toUpperCase();
            resolve(b);
        }).catch(err => {
            reject(err);
        });
    });
}

module.exports = {
    getNewVCodeForEmail,
    verifyVCodeForEmail
}