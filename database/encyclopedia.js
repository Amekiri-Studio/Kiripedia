var mysql = require('./mysql_pool');

async function queryEncyclopediaById(id, lang, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = `
            SELECT * FROM
            encyclopedia as e 
            INNER JOIN encyclopedia_content AS ec ON e.eid = ec.eid
            INNER JOIN language AS l ON l.language_id = ec.language
            WHERE l.language_abbr = ?
            AND e.eid = ?
        `;

        const params = [lang, id];

        const results = await mysql.query(connection, querySql, params);

        mysql.connectionRelease(option, connection);

        return results;
    } catch (error) {
        throw error;
    }
}

async function queryEncyclopediaCount(lang, keyword, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = `
            SELECT count(*) FROM encyclopedia AS e
            INNER JOIN encyclopedia_content AS ec ON e.eid = ec.eid
            INNER JOIN language AS l ON l.language_id = ec.language
            WHERE l.language_abbr = ?
            AND (ec.title LIKE ? OR ec.describe LIKE ? OR ec.content LIKE ?)
        `;

        const params = [lang, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`];

        const results = await mysql.query(connection, querySql, params);

        mysql.connectionRelease(option, connection);

        return results;
    } catch (error) {
        throw error;
    }
}

async function queryEncyclopediaByKeywordWithRange(keyword, lang, start, limit, option = {}) {
    try {
        const connection = option.connection || await mysql.getConnection();

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

        const results = await mysql.query(connection, querySql, params);

        mysql.connectionRelease(option, connection);

        return results;
    } catch (error) {
        throw error;
    }
}

async function addPost(eid, title, cat, describe, content, userid, lang, option = {}) {
    let connection;

    try {
        connection = option.connection || await mysql.getConnection();

        await mysql.beginTransaction(connection);

        let addESql = `
            INSERT INTO encyclopedia(category, permission) 
            VALUES(?, 1)
        `;

        let addSql = `
            INSERT INTO encyclopedia_content(eid, title, \`describe\`, createrid, lasteditorid, content, language, permission) 
            VALUES(?, ?, ?, ?, ?, ?, (SELECT language_id FROM language WHERE language_abbr = ?), 1)
        `;

        let params = [];
        if (!eid) {
            const eParams = [cat];
            const eResults = await mysql.query(connection, addESql, eParams);
            eid = eResults.insertId;
        }

        params = [eid, title, describe, userid, userid, content, lang];
        const results = await mysql.query(connection, addSql, params);

        await mysql.commitTransaction(connection);

        mysql.connectionRelease(option, connection);

        return results;
    } catch (error) {
        if (connection) {
            await mysql.rollbackTransaction(connection);
        }
        throw error;
    }
}

async function queryExistsPostOnLanguage(eid, lang, option = {}) {
    let connection = option.connection || await mysql.getConnection();

    let data = await queryEncyclopediaById(eid, lang,{connection, release:option.release});

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