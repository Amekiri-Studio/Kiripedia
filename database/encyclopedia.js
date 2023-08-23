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

        let addContributeSql = `
            INSERT INTO encyclopedia_contribution(eid,ecid,userid,language) 
            VALUES(?, ?, ?, (SELECT language_id FROM language WHERE language_abbr = ?))
        `;

        let params = [];
        if (!eid) {
            const eParams = [cat];
            const eResults = await mysql.query(connection, addESql, eParams);
            eid = eResults.insertId;
        }

        params = [eid, title, describe, userid, userid, content, lang];
        const results = await mysql.query(connection, addSql, params);

        let contruParams = [eid, results.insertId, userid, lang];

        await mysql.query(connection, addContributeSql, contruParams);

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

async function alterPost(eid, title, describe, content, userid, lang, option = {}) {
    let connection;

    try {
        connection = option.connection || await mysql.getConnection();

        await mysql.beginTransaction(connection);

        let updateSql = `
            UPDATE encyclopedia_content
            SET title = ?,
            \`describe\` = ?,
            lasteditorid = ?,
            content = ?
            WHERE eid = ?
            AND language = (SELECT language_id FROM language WHERE language_abbr = ?)
        `;

        let addContributeSql = `
            INSERT INTO encyclopedia_contribution(eid,ecid,userid,language) 
            VALUES(?, ?, ?, (SELECT language_id FROM language WHERE language_abbr = ?))
        `;

        let querySql = `
            SELECT e_content_id FROM encyclopedia_content as ec
            INNER JOIN language AS l ON l.language_id = ec.language
            WHERE language_abbr = ?
            AND ec.eid = ?
        `;

        let params = [title, describe, userid, content, eid, lang];
        let ecidParams = [lang, eid];
        
        const result = await mysql.query(connection, updateSql, params);
        let ecid = await mysql.query(connection, querySql, ecidParams);

        let contriParams = [eid, ecid[0].e_content_id, userid, lang];

        await mysql.query(connection, addContributeSql, contriParams);

        await mysql.commitTransaction(connection);

        mysql.connectionRelease(option, connection);

        return result;
    } catch (error) {
        if (connection) {
            await mysql.rollbackTransaction(connection);
        }
        throw error;
    }
}

async function removePost(eid, lang, option = {}) {
    let connection;
    try {
        connection = option.connection || await mysql.getConnection();
        let deleteSql, params = [];
        if (!lang) {
            deleteSql = `
                DELETE FROM encyclopedia,encyclopedia_content
                WHERE eid=?
            `;
            params = [eid];
        }
        else {
            deleteSql = `
                DELETE FROM encyclopedia_content
                WHERE eid=? AND language=(SELECT language_id FROM language WHERE language_abbr=?)
            `;
            params = [eid, lang];
        }

        let result = await mysql.query(connection, deleteSql, params);
        mysql.connectionRelease(option, connection);
        return result;
    } catch (error) {
        throw error;
    }
}

async function checkPostPremission(eid, lang, option = {}) {
    let connection;
    try {
        connection = option.connection || await mysql.getConnection();
        let querySql, params = [];

        if (!lang) {
            querySql = `
                SELECT permission FROM encyclopedia
                WHERE eid=?
            `;
            params = [eid];
        }
        else {
            querySql = `
                SELECT permission FROM encyclopedia_content
                WHERE eid=?
                AND language=(SELECT * FROM language WHERE language_abbr=?)
            `;
            params = [eid, lang];
        }

        let result = await mysql.query(connection, querySql, params);
        mysql.connectionRelease(option, connection);
        return result[0].permission;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    queryEncyclopediaById,
    queryEncyclopediaCount,
    queryEncyclopediaByKeywordWithRange,
    addPost,
    queryExistsPostOnLanguage,
    alterPost,
    removePost,
    checkPostPremission
}