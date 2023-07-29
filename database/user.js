var mysql = require('./mysql_connection');
var { hash_pwd } = require("../utils/password_hash");

function createUser(username,nickname,password,email,group,callback) {
    mysql.sqlConnect();

    let addSql = 'INSERT INTO user(username,nickname,password,email,user_belong_groups,user_status) VALUES(?,?,?,?,?,?)';
    let params = [username,nickname,hash_pwd(username,password),email,group,0];

    mysql.connection.query(addSql,params,(err ,results, fields) => {
        if (err) {
            console.log(err.message);
            return;
        }
        callback(results);
    });
}

function queryExistsUsername(username, callback) {
    mysql.sqlConnect();

    let querySql = "SELECT * FROM user where username=?";
    let params = [username];

    mysql.connection.query(querySql,params,(err, results, fields) => {
        if (err) {
            console.log(err.message);
            return;
        }
        callback(results);
    });
}

function queryExistsEmail(email, callback) {
    mysql.sqlConnect();

    let querySql = "SELECT * FROM user where email=?";
    let params = [email];

    mysql.connection.query(querySql,params,(err, results, fields) => {
        if (err) {
            console.log(err.message);
            return;
        }
        callback(results);
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

module.exports = {
    createUser,
    queryExistsUsername,
    queryExistsEmail,
    checkInfoIsLegal
}