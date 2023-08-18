var mysql = require('./mysql_pool');

async function queryEncyclopediaById(id, lang, _connection) {
    return new Promise(async (resolve, reject) => {
        let connection = _connection;
        if (!connection) {
            connection = await mysql.getConnection();
        }

        let querySql = `
            SELECT * FROM
            encyclopedia as e 
            INNER JOIN encyclopedia_content AS ec ON e.eid = ec.eid
            INNER JOIN language AS l ON l.language_id = ec.language
            WHERE l.language_abbr = ?
            AND e.eid = ?
        `;

        let params = [lang, id];

        connection.query(querySql, params, (err, results, field) => {
            if (err) {
                return reject(err);
            }
            connection.release();
            resolve(results);
        });
    });
}

async function queryEncyclopediaCount(lang, keyword ,_connection) {
    return new Promise(async (resolve, reject) => {
        let connection = _connection;
        if (!connection) {
            connection = await mysql.getConnection();
        }

        const querySql = `
            SELECT count(*) FROM encyclopedia AS e
            INNER JOIN encyclopedia_content AS ec ON e.eid = ec.eid
            INNER JOIN language AS l ON l.language_id = ec.language
            WHERE l.language_abbr = ?
            AND (ec.title LIKE ? OR ec.describe LIKE ? OR ec.content LIKE ?)
        `;

        let params = [lang, keyword, keyword, keyword];

        connection.query(querySql, params, (err, results, fields) => {
            if (err) {
                reject(err);
            }
            connection.release();
            resolve(results);
        });
    });
}

async function queryEncyclopediaByKeywordWithRange(keyword, lang, start, limit, _connection) {
    try {
        return new Promise(async (resolve, reject) => {
            let connection = _connection;
            if (!connection) {
                connection = await mysql.getConnection();
            }
  
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
  
            connection.query(querySql, params, (err, results, fields) => {
                if (err) {
                    return reject(err);
                };
  
                resolve(results);
            });
      });
    } catch (error) {
        throw error;
    }
}

async function addPost(eid, title, cat, describe, content, userid, lang) {
    return new Promise(async (resolve, reject) => {
        let connection = _connection;
        if (!connection) {
            connection = await mysql.getConnection();
        }

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
            connection.query(addESql, eParams, (err, results, fields) => {
                if (err) {
                    return reject(err);
                }
                let params = [results.insertId ,title, describe, userid, userid, content, lang];
                connection.query(addSql, params, (err, results, fields) => {
                    if (err) {
                        return reject(err);
                    }

                    connection.release();
                    resolve(results);
                });
            });
        }
        else {
            let params = [eid, title, describe, userid, userid, content, lang];
            connection.query(addSql, params, (err, results, fields) => {
                if (err) {
                    return reject(err);
                }

                connection.release();
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
    queryEncyclopediaCount,
    queryEncyclopediaByKeywordWithRange,
    addPost,
    queryExistsPostOnLanguage
}