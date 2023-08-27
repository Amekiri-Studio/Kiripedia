const test = require('./database/contributor');

test.getContributor(4, 'zh-cn').then(result => {
    console.log(result);
});