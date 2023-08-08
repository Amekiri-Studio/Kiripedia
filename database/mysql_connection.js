var mysql;
var config = require("../config/config");

if (config.mysql_type === 2) {
    mysql = require("mysql2");
}
else {
    mysql = require("mysql");
}
var myconfig = require("../config/mysql");
var connection = mysql.createConnection({
    host:   myconfig.host,
    user:   myconfig.user,
    password: myconfig.password,
    database: myconfig.database
})
var isConnection = false;

function sqlConnect() {
    if (!isConnection) {
        connection.connect((err) => {
            if (err) {
                console.log(err.message);
            }
            else {
                console.log("Connected to mysql");
                isConnection = true;
            }
        });
    }
    else {
        if (connection){

        }
        else {
            connection.connect((err) => {
                if (err) {
                    console.log(err.message);
                }
                else {
                    console.log("Connected to mysql");
                    isConnection = true;
                }
            });
        }
    }
}

function getConnectionStatus() {
    return isConnection;
}

module.exports = {sqlConnect,connection,getConnectionStatus}