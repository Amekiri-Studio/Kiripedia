var mysql = require('./mysql_connection');

async function queryEncyclopediaById(id, lang) {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();

        let querySql = "select * from encyclopedia as e," +
         "encyclopedia_content as ec," + 
         "language as l " +
         "where l.language_id=ec.language and l.language_abbr=? and e.eid=?";

        let params = [lang, id];

        mysql.connection.query(querySql, params, (err, results, field) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
}

module.exports = {
    queryEncyclopediaById
}