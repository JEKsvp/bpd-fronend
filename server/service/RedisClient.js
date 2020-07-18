const redis = require("redis");
const RedisClient = redis.createClient(
    {
        host: 'localhost',
        port: '6379'
    }
);

RedisClient.on("error", function(err) {
    console.error("REDIS ERROR", err)
});


const getAsync = function (sessionId) {
    return new Promise(async (resolve, reject) =>
        RedisClient.get(sessionId, function (err, res) {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    )
}

const setAsync = function (sessionId, tokenContainer) {
    return new Promise(async (resolve, reject) =>
        RedisClient.set(sessionId, tokenContainer, function (err, res) {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    )
}

const delAsync = function (sessionId) {
    return new Promise(async (resolve, reject) =>
        RedisClient.del(sessionId, function (err, res) {
            if (err) {
                reject(err)
            } else {
                resolve(res)
            }
        })
    )
}

module.exports = RedisClient
module.exports.getAsync = getAsync
module.exports.setAsync = setAsync
module.exports.delAsync = delAsync