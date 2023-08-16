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
            }mysql.sqlConnect();
  
            resolve(results);
        });
      });
    } catch (error) {
        throw error;
    }
}

async function addPost(eid, title, cat, describe, content, userid, lang) {
    return new Promise((resolve, reject) => {
        mysql.sqlConnect();

        let addESql = `
            INSERT INTO encyclopedia(category,permission) 
            VALUES(?,1)
        `;

        let addSql = `
            INSERT INTO encyclopedia_content(eid,title,\`describe\`,createrid,lasteditorid,content,language,permission) 
            VALUES(?,?,?,?,?,?,(SELECT language_id FROM language where language_abbr=?),1)
        `;

        if (!eid) {
            let eParams = [cat];
            mysql.connection.query(addESql, eParams, (err, results, fields) => {
                if (err) {
                    return reject(err);
                }
                let params = [results.insertId ,title, describe, userid, userid, content, lang];
                mysql.connection.query(addSql, params, (err, results, fields) => {
                    if (err) {
                        return reject(err);
                    }

                    resolve(results);
                });
            });
        }
        else {
            let params = [eid, title, describe, userid, userid, content, lang];
            mysql.connection.query(addSql, params, (err, results, fields) => {
                if (err) {
                    return reject(err);
                }

                resolve(results);
            });
        }
        
    });
}

async function queryExistsPostOnLanguage(eid, lang) {
    let data = await queryEncyclopediaById(eid, lang);

    try {
        if (JSON.stringify(data) === "[]" || JSON.stringify(data) === "{}") {
            return false;
        }
        return true;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    queryEncyclopediaById,
    queryEncyclopediaByKeyword,
    queryEncyclopediaCount,
    queryEncyclopediaByKeywordWithRange,
    addPost,
    queryExistsPostOnLanguage
}