var mysql = require('./mysql_pool');
var { hash_pwd } = require("../utils/password_hash");

async function createUser(username,nickname,password,email,group,option) {
    return new Promise(async (resolve, reject) => {
        let connection;
        if (!option) {
            connection = await mysql.getConnection();
        }
        else if (!option.connection) {
            connection = await mysql.getConnection();
        }
        else {
            connection = option.connection;
        }

        let addSql = 'INSERT INTO user(username,nickname,password,email,user_belong_groups,user_status) VALUES(?,?,?,?,?,?)';
        let params = [username,nickname,hash_pwd(username,password),email,group,0];
    
        connection.query(addSql,params,(err ,results, fields) => {
            if (err) {
                console.log(err.message);
                return reject(err);
            }
            mysql.connectionRelease(option, connection);
            resolve(results);
        });
    });
}

async function queryExistsUsername(username, option) {
    return new Promise(async (resolve,reject) => {
        let connection;
        if (!option) {
            connection = await mysql.getConnection();
        }
        else if (!option.connection) {
            connection = await mysql.getConnection();
        }
        else {
            connection = option.connection;
        }

        let querySql = "SELECT * FROM user where username=?";
        let params = [username];
    
        connection.query(querySql,params,(err, results, fields) => {
            if (err) {
                console.log(err.message);
                return reject(err);
            }
            mysql.connectionRelease(option, connection);
            if (JSON.stringify(results) === "[]" || JSON.stringify(results) === "{}") {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

async function getUserInfoByUsername(username, option) {
    return new Promise(async (resolve,reject) => {
        let connection;
        if (!option) {
            connection = await mysql.getConnection();
        }
        else if (!option.connection) {
            connection = await mysql.getConnection();
        }
        else {
            connection = option.connection;
        }

        let querySql = "SELECT * FROM user where username=?";
        let params = [username];
    
        connection.query(querySql,params,(err, results, fields) => {
            if (err) {
                console.log(err.message);
                return reject(err);
            }
            mysql.connectionRelease(option, connection);
            resolve(results);
        });
    });
}

async function queryExistsEmail(email, option) {
    return new Promise(async (resolve, reject) => {
        let connection;
        if (!option) {
            connection = await mysql.getConnection();
        }
        else if (!option.connection) {
            connection = await mysql.getConnection();
        }
        else {
            connection = option.connection;
        }

        let querySql = "SELECT * FROM user where email=?";
        let params = [email];
    
        connection.query(querySql,params,(err, results, fields) => {
            if (err) {
                console.log(err.message);
                return reject(err);
            }
            mysql.connectionRelease(option, connection);
            if (JSON.stringify(results) === "[]" || JSON.stringify(results) === "{}") {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

async function getUserInfoByEmail(email, option) {
    return new Promise(async (resolve, reject) => {
        let connection;
        if (!option) {
            connection = await mysql.getConnection();
        }
        else if (!option.connection) {
            connection = await mysql.getConnection();
        }
        else {
            connection = option.connection;
        }

        let querySql = "SELECT * FROM user where email=?";
        let params = [email];
    
        connection.query(querySql,params,(err, results, fields) => {
            if (err) {
                console.log(err.message);
                return reject(err);
            }
            mysql.connectionRelease(option, connection);
            resolve(results);
        });
    });
}

function checkInfoIsLegal(username, email, uecallback, eecallback, callback) {
    queryExistsUsername(username, result => {
        if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
            queryExistsEmail(email, result => {
                if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
                    callback(result);
                }
                else {
                    eecallback();
                }
            });
        }
        else {
            uecallback();
        }
    });
}

async function userLogin(username, password, option) {
    return new Promise(async (resolve, reject) => {
        let connection;
        if (!option) {
            connection = await mysql.getConnection();
        }
        else if (!option.connection) {
            connection = await mysql.getConnection();
        }
        else {
            connection = option.connection;
        }
    
        let querySql = "SELECT * FROM user where username=? and password=?"
        let params = [username, hash_pwd(username,password)];
    
        connection.query(querySql, params, (err, result, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            mysql.connectionRelease(option, connection);
            if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
                resolve({status:false});
            }
            else {
                resolve({status:true, result});
            }
        });
    });
}

async function checkUserLoginInvalid(username, password_hash, option) {
    return new Promise(async (resolve, reject) => {
        let connection;
        if (!option) {
            connection = await mysql.getConnection();
        }
        else if (!option.connection) {
            connection = await mysql.getConnection();
        }
        else {
            connection = option.connection;
        }

        let querySql = "SELECT * FROM user where username=? and password=?"
        let params = [username, password_hash];

        connection.query(querySql, params, (err, result, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            mysql.connectionRelease(option, connection);
            if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
                resolve({ isValid:false });
            }
            else {
                resolve({ isValid:true, result });
            }
        });
    });
}

async function alterUserInfo(uid, type, content, option) {
    return new Promise(async (resolve, reject) => {
        let connection;
        if (!option) {
            connection = await mysql.getConnection();
        }
        else if (!option.connection) {
            connection = await mysql.getConnection();
        }
        else {
            connection = option.connection;
        }
        let updateSql;

        if (type === 'email') {
            updateSql = "update user set email=? where userid=?";
        }
        else if (type === 'password') {
            updateSql = "update user set password=? where userid=?";
        }
        else if (type === 'nickname') {
            updateSql = "update user set nickname=? where userid=?";
        }
        else if (type === 'avatar') {
            updateSql = "update user set avatar=? where userid=?";
        }

        let params;
        if (type === 'password') {
            params = [hash_pwd(option.username,content), uid];
        }
        else {
            params = [content, uid];
        }

        connection.query(updateSql, params, (err, result, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            mysql.connectionRelease(option, connection);
            resolve(result);
        });
    });
}

async function queryUserId(userid, option) {
    return new Promise(async (resolve, reject) => {
        let connection;
        if (!option) {
            connection = await mysql.getConnection();
        }
        else if (!option.connection) {
            connection = await mysql.getConnection();
        }
        else {
            connection = option.connection;
        }
        let querySql = "SELECT * FROM user where userid=?";
        let params = [userid];

        connection.query(querySql, params, (err, result, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            mysql.connectionRelease(option, connection);
            resolve(result);
        })
    });
}

async function removeUser(userid, option) {
    return new Promise(async (resolve, reject) => {
        let connection;
        if (!option) {
            connection = await mysql.getConnection();
        }
        else if (!option.connection) {
            connection = await mysql.getConnection();
        }
        else {
            connection = option.connection;
        }
        let updateSql = `
            UPDATE user 
            SET email='USER REMOVED', 
            avatar='USER REMOVED', 
            password='USER REMOVED', 
            user_status=-1 WHERE userid=?
        `;
        let params = [userid];
    
        connection.query(updateSql, params, (err, result, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            mysql.connectionRelease(option, connection);
            resolve(result);
        });
    });
}

module.exports = {
    createUser,
    queryExistsUsername,
    queryExistsEmail,
    getUserInfoByUsername,
    getUserInfoByEmail,
    checkInfoIsLegal,
    userLogin,
    checkUserLoginInvalid,
    alterUserInfo,
    queryUserId,
    removeUser
}