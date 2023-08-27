const test = require('./database/contributor');

test.getContributor(1, 'zh-cn').then(result => {
    console.log(result);
});