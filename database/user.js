var mysql = require('./mysql_pool');
var { hash_pwd } = require("../utils/password_hash");

async function createUser(username, nickname, password, email, group, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const addSql = 'INSERT INTO user(username, nickname, password, email, user_belong_groups, user_status) VALUES (?, ?, ?, ?, ?, ?)';
        const params = [username, nickname, hash_pwd(username, password), email, group, 0];

        const results = await mysql.query(connection, addSql, params);

        mysql.connectionRelease(option, connection);

        return results;
    } catch (error) {
        throw error;
    }
}

async function queryExistsUsername(username, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = "SELECT * FROM user WHERE username=?";
        const params = [username];

        const results = await mysql.query(connection, querySql, params);

        mysql.connectionRelease(option, connection);

        if (results.length === 0) {
            return false; // 用户名不存在
        } else {
            return true; // 用户名存在
        }
    } catch (error) {
        throw error;
    }
}

async function getUserInfoByUsername(username, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = "SELECT * FROM user WHERE username=?";
        const params = [username];

        const results = await mysql.query(connection, querySql, params);

        mysql.connectionRelease(option, connection);

        return results;
    } catch (error) {
        throw error;
    }
}


async function queryExistsEmail(email, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = "SELECT * FROM user WHERE email=?";
        const params = [email];

        const results = await mysql.query(connection, querySql, params);

        mysql.connectionRelease(option, connection);

        return results.length > 0;
    } catch (error) {
        throw error;
    }
}

async function getUserInfoByEmail(email, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = "SELECT * FROM user WHERE email=?";
        const params = [email];

        const results = await mysql.query(connection, querySql, params);

        mysql.connectionRelease(option, connection);

        return results;
    } catch (error) {
        throw error;
    }
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
    userLogin,
    checkUserLoginInvalid,
    alterUserInfo,
    queryUserId,
    removeUser
}