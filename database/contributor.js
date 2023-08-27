var mysql = require('./mysql_pool');

async function getContributor(eid, lang, option = {})  {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = `
            SELECT * FROM
            encyclopedia_contribution AS econtr
            INNER JOIN encyclopedia AS e ON e.eid=ecountr.eid
            INNER JOIN encyclopedia_content AS ec ON ecountr.eid=ec.eid
            WHERE e.eid = ?
            AND ec.language = (SELECT language_id FROM language WHERE language_abbr = ?)
        `;

        const params = [eid, lang];

        let result = await mysql.query(connection, querySql, params);

        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    getContributor
}