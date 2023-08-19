const mysql = require('./database/mysql_pool');

async function test() {
    let connection = await mysql.getConnection();
    let querySql = `
            SELECT e_content_id FROM encyclopedia_content as ec
            INNER JOIN language AS l ON l.language_id = ec.language
            WHERE language_abbr = ?
            AND ec.eid = ?
        `;
    return await mysql.query(connection, querySql, ['zh-cn', 2]);
}

test().then(result => {
    console.log(result[0].e_content_id);
})