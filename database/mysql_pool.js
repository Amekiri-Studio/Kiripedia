var myconfig = require("../config/mysql");
var config = require("../config/config");

if (config.mysql_type === 2) {
    mysql = require("mysql2");
}
else {
    mysql = require("mysql");
}

var pool = mysql.createPool({
    host:   myconfig.host,
    user:   myconfig.user,
    password: myconfig.password,
    database: myconfig.database
})

async function getConnection() {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(connection);
        })
    })
}

function connectionRelease(option, connection) {
    if (!option) {
        connection.release();
    }
    else if (option.release) {
        connection.release();
    }
}

module.exports = { getConnection, connectionRelease };