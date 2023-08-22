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

async function userLogin(username, password, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = "SELECT * FROM user WHERE username=? AND password=?";
        const params = [username, hash_pwd(username, password)];

        const result = await mysql.query(connection, querySql, params);

        mysql.connectionRelease(option, connection);

        return result.length > 0
            ? { status: true, result }
            : { status: false };
    } catch (error) {
        throw error;
    }
}

async function checkUserLoginInvalid(username, password_hash, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = "SELECT * FROM user WHERE username=? AND password=?";
        const params = [username, password_hash];

        const result = await mysql.query(connection, querySql, params);

        mysql.connectionRelease(option, connection);

        return result.length === 0
            ? { isValid: false }
            : { isValid: true, result };
    } catch (error) {
        throw error;
    }
}

async function alterUserInfo(uid, type, content, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();
        let updateSql;

        if (type === 'email') {
            updateSql = "UPDATE user SET email=? WHERE userid=?";
        } else if (type === 'password') {
            updateSql = "UPDATE user SET password=? WHERE userid=?";
            content = hash_pwd(option.username, content);
        } else if (type === 'nickname') {
            updateSql = "UPDATE user SET nickname=? WHERE userid=?";
        } else if (type === 'avatar') {
            updateSql = "UPDATE user SET avatar=? WHERE userid=?";
        }

        let params = [content, uid];

        const result = await mysql.query(connection, updateSql, params);

        mysql.connectionRelease(option, connection);

        return result;
    } catch (error) {
        throw error;
    }
}


async function queryUserId(userid, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = "SELECT * FROM user WHERE userid=?";
        const params = [userid];

        const result = await mysql.query(connection, querySql, params);

        mysql.connectionRelease(option, connection);

        return result;
    } catch (error) {
        throw error;
    }
}

async function removeUser(userid, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const updateSql = `
            UPDATE user 
            SET email='USER REMOVED', 
            avatar='USER REMOVED', 
            password='USER REMOVED', 
            user_status=-1 
            WHERE userid=?
        `;
        const params = [userid];

        const result = await mysql.query(connection, updateSql, params);

        mysql.connectionRelease(option, connection);

        return result;
    } catch (error) {
        throw error;
    }
}

async function getUserGroup(uid, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = `
            SELECT u.userid,ug.user_group_id,ug.user_group_name,ug.permission FROM user AS u
            INNER JOIN user_groups AS ug ON u.user_belong_groups = ug.user_group_id
            WHERE u.userid = ?
        `;

        const params = [uid];

        const result = await mysql.query(connection, querySql, params);

        mysql.connectionRelease(option, connection);

        return result;
    } catch (error) {
        throw error;
    }
}

async function checkUserLoginInvalidAndCheckPermission(username, password_hash, need_permission, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        let userObject = await checkUserLoginInvalid(username, password_hash, {connection, release:false});

        if (!userObject.isValid) {
            return {isValid: false, message:'token invalid'};
        }

        let userInfo = userObject.result[0];

        if (userInfo.status === -2) {
            return {isValid: false, message:'account is banned'};
        }

        let userGroups = await getUserGroup(userInfo.userid, {connection, release:false});

        if (userGroups[0].permission < need_permission) {
            return {isValid: false, message:'no permission on your user group'};
        }

        connection.release();

        return {isValid:true, message:'success', userInfo: userInfo, group: userGroups[0]};
    } catch (error) {
        throw error;
    }
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
    removeUser,
    getUserGroup,
    checkUserLoginInvalidAndCheckPermission
}