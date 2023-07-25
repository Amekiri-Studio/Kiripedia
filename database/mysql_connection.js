var mysql = require("mysql");
var config = require("../config/mysql");
var connection = mysql.createConnection({
    host:   config.host,
    user:   config.user,
    password: config.password,
    database: config.database
})
var isConnection = false;

function sqlConnect() {
    if (!isConnection) {
        connection.connect();
        isConnection = true;
    }
}

module.exports = {sqlConnect}