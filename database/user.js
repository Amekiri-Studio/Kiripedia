var mysql = require('mysql_connection');

function createUser(username,password,email,group,callback) {
    if (!mysql.getConnectionStatus()) {
        mysql.sqlConnect();
    }
    let addSql = 'INSERT INTO user(username,password,email,user_belong_groups) VALUES(?,?,?,?)';
    let params = [username,hash_pwd(username,password),email,group];

    mysql.connection.query(addSql,params,(err ,results, fields) => {
        if (err) {
            console.log(err.message);
            return;
        }
        callback(results);
    });
}

module.exports = {
    createUser
}