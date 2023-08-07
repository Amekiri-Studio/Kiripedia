const mysql = require(config.mysql_type === 2 ? 'mysql2' : 'mysql');
var myconfig = require("../config/mysql");

var pool = mysql.createPool({
    host:   myconfig.host,
    user:   myconfig.user,
    password: myconfig.password,
    database: myconfig.database
})

async function getConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Connected to mysql');
        return connection;
    } catch (err) {
        console.error(err.message);
        throw err;
    }
}

module.exports = { getConnection };