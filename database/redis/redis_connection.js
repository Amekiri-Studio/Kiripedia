const redis = require('redis')
const config = require('../../config/redis');
var redisClient;

var isConnect = false;

function connectRedis() {
    redisClient = redis.createClient({
        url: `redis://default:${config.password}@${config.host}:${config.port}`
    });

    redisClient.on("connect", () => {
        console.log("Connected to Redis");
        isConnect = true;
    });

    redisClient.on('err', err => {
        console.log('redis client error: ', err);
    })

    redisClient.connect();
}

function setKeyValue(key, value) {
    redisClient.set(key, value);
}

function setExpire(key, time) {
    redisClient.expire(key, time);
}

async function getKeyValue(key) {
    return new Promise((resolve, reject) => {
        redisClient.get(key).then(val => {
            resolve(val);
        }).catch(err => {
            reject(err)
        });
    });
}

function delKeyValue(key) {
    redisClient.del(key);
}

module.exports = {
    connectRedis,
    setKeyValue,
    getKeyValue,
    delKeyValue,
    setExpire
}