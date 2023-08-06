var mysql = require('./mysql_connection');
var { hash_pwd } = require("../utils/password_hash");

async function createUser(username,nickname,password,email,group) {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();

        let addSql = 'INSERT INTO user(username,nickname,password,email,user_belong_groups,user_status) VALUES(?,?,?,?,?,?)';
        let params = [username,nickname,hash_pwd(username,password),email,group,0];
    
        mysql.connection.query(addSql,params,(err ,results, fields) => {
            if (err) {
                console.log(err.message);
                return reject(err);
            }
            resolve(results);
        });
    });
}

async function queryExistsUsername(username) {
    return new Promise((resolve,reject) => {
        mysql.sqlConnect();

        let querySql = "SELECT * FROM user where username=?";
        let params = [username];
    
        mysql.connection.query(querySql,params,(err, results, fields) => {
            if (err) {
                console.log(err.message);
                return reject(err);
            }
            if (JSON.stringify(results) === "[]" || JSON.stringify(results) === "{}") {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

async function getUserInfoByUsername(username) {
    return new Promise((resolve,reject) => {
        mysql.sqlConnect();

        let querySql = "SELECT * FROM user where username=?";
        let params = [username];
    
        mysql.connection.query(querySql,params,(err, results, fields) => {
            if (err) {
                console.log(err.message);
                return reject(err);
            }
            resolve(results);
        });
    });
}

async function queryExistsEmail(email) {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();

        let querySql = "SELECT * FROM user where email=?";
        let params = [email];
    
        mysql.connection.query(querySql,params,(err, results, fields) => {
            if (err) {
                console.log(err.message);
                return reject(err);
            }
            if (JSON.stringify(results) === "[]" || JSON.stringify(results) === "{}") {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}

async function getUserInfoByEmail(email) {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();

        let querySql = "SELECT * FROM user where email=?";
        let params = [email];
    
        mysql.connection.query(querySql,params,(err, results, fields) => {
            if (err) {
                console.log(err.message);
                return reject(err);
            }
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

async function userLogin(username, password, callback) {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();
    
        let querySql = "SELECT * FROM user where username=? and password=?"
        let params = [username, hash_pwd(username,password)];
    
        mysql.connection.query(querySql, params, (err, result, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
                resolve({status:false});
            }
            else {
                resolve({status:true, result});
            }
        });
    });
}

async function checkUserLoginInvalid(username, password_hash) {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();

        let querySql = "SELECT * FROM user where username=? and password=?"
        let params = [username, password_hash];

        mysql.connection.query(querySql, params, (err, result, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
                resolve({ isValid:false });
            }
            else {
                resolve({ isValid:true, result });
            }
        });
    });
}

async function checkUsernameAndEmailMatch(username, email) {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();

            let querySql = "SELECT * FROM user where username=? and email=?";
            let params = [username, email];

            mysql.connection.query(querySql, params, (err, result, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (JSON.stringify(result) === "[]" || JSON.stringify(result) === "{}") {
                resolve({match: false});
            }
            else {
                resolve({match: true, result});
            }
        })
    });
}

async function alterUserInfo(uid, type, content, option) {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();
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

        mysql.connection.query(updateSql, params, (err, result, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(result);
        });
    });
}

async function queryUserId(userid) {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();
        let querySql = "SELECT * FROM user where userid=?";
        let params = [userid];

        mysql.connection.query(querySql, params, (err, result, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(result);
        })
    });
}

async function removeUser(userid) {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();
        let updateSql = "UPDATE user SET nickname='USER REMOVED', email='USER REMOVED', avatar='USER REMOVED', password='USER REMOVED', user_status=-1 WHERE userid=?";
        let params = [userid];
    
        mysql.connection.query(updateSql, params, (err, result, fields) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
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
    checkUsernameAndEmailMatch,
    alterUserInfo,
    queryUserId,
    removeUser
}