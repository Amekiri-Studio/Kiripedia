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

async function queryEncyclopediaByKeyword(keyword, lang) {
    return new Promise((resolve,reject) => {
        mysql.sqlConnect();

        let querySql = "select * from encyclopedia as e," +
         "encyclopedia_content as ec," + 
         "language as l " +
         "where l.language_id=ec.language and l.language_abbr=? and (ec.title like ? or ec.describe like ? or ec.content like ?)";

        const params = [lang, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`];

        mysql.connection.query(querySql, params, (err, results, field) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
         });
    });
}

module.exports = {
    queryEncyclopediaById,
    queryEncyclopediaByKeyword
}