var mysql = require('./mysql_pool');

async function getContributor(eid, lang, option = {})  {
    try {
        const connection = option.connection || await mysql.getConnection();

        const querySql = `
            SELECT * FROM
            encyclopedia_contribution AS econtr
            INNER JOIN encyclopedia AS e ON e.eid=econtr.eid
            INNER JOIN encyclopedia_content AS ec ON econtr.ecid=ec.e_content_id
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

function checkContribution(contru_list, userid) {
    let data_length = contru_list.length;
    let count = 0;
    for (let i = 0;i < data_length;i++) {
        if (contru_list[i].userid === userid) {
            count++;
        }
    }

    if (data_length === count) {
        if (contru_list[0].permission === 1) {
            return true;
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }
}

module.exports = {
    getContributor,
    checkContribution
}