const redis = require('redis')
const config = require('../../config/redis');
var redisClient;

var isConnect = false;

function connectRedis() {
    redisClient = redis.createClient({
        host: config.host,
        port: config.port,
        password: config.password
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

function getKeyValue(key, callback) {
    redisClient.get(key, (err, v) => {
        console.log(err,v);
        // callback(err, result);
    });
}

module.exports = {
    connectRedis,
    setKeyValue,
    getKeyValue,
    setExpire
}