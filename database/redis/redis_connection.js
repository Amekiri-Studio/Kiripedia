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

function getKeyValue(key, callack) {
    client.get(key, (err, result) => {
        if (err) {
            console.error("Error retrieving data:", err);
        } else {
            callack(result);
        }
    });
}

module.exports = {
    connectRedis,
    setKeyValue,
    getKeyValue
}