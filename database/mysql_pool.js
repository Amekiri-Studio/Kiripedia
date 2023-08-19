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

async function query(connection, sql, params) {
    return new Promise((resolve, reject) => {
        if (!params) {
            connection.query(sql, (err, results, fields) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        }
        else {
            connection.query(sql, params, (err, results, fields) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        }
    });
}

async function beginTransaction(connection) {
    return new Promise((resolve, reject) => {
        connection.beginTransaction((err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
}

async function commitTransaction(connection) {
    return new Promise((resolve, reject) => {
        connection.commit(async (err, info) => {
            if (err) {
                rollbackTransaction().then(() => {
                    return reject(err);
                }).catch(err2 => {
                    return reject(`${err},${err2}`);
                });
                
            }
            resolve(info);
        });
    });
}

async function rollbackTransaction(connection) {
    return new Promise((resolve, reject) => {
        connection.rollback(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    });
}

function connectionRelease(option = {}, connection) {
    if (!option.connection) {
        connection.release();
    }
    else if (option.release) {
        connection.release();
    }
}

module.exports = { getConnection, query, beginTransaction, commitTransaction, rollbackTransaction, connectionRelease };