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

async function queryEncyclopediaCount() {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();

        const querySql = `SELECT count(*) FROM encyclopedia`;

        mysql.connection.query(querySql, (err, results, fields) => {
            if (err) {
                reject(err);
            }
            resolve(results);
        });
    });
}

async function queryEncyclopediaByKeywordWithRange(keyword, lang, start, limit) {
    try {
        return new Promise((resolve, reject) => {
            mysql.sqlConnect();
  
            const querySql = `
                SELECT *
                FROM encyclopedia AS e
                INNER JOIN encyclopedia_content AS ec ON e.eid = ec.eid
                INNER JOIN language AS l ON l.language_id = ec.language
                WHERE l.language_abbr = ?
                AND (ec.title LIKE ? OR ec.describe LIKE ? OR ec.content LIKE ?)
                ORDER BY
                    CASE
                    WHEN ec.title LIKE ? THEN 1
                    WHEN ec.describe LIKE ? THEN 2
                    WHEN ec.content LIKE ? THEN 3
                    ELSE 4
                END
                LIMIT ? OFFSET ?
            `;
  
            const params = [
                lang,
                `%${keyword}%`,
                `%${keyword}%`,
                `%${keyword}%`,
                `%${keyword}%`,
                `%${keyword}%`,
                `%${keyword}%`,
                limit,
                start,
            ];
  
            mysql.connection.query(querySql, params, (err, results, fields) => {
            if (err) {
                return reject(err);
            }
  
            resolve(results);
        });
      });
    } catch (error) {
        throw error;
    }
}

module.exports = {
    queryEncyclopediaById,
    queryEncyclopediaByKeyword,
    queryEncyclopediaCount,
    queryEncyclopediaByKeywordWithRange
}