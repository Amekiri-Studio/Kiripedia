const test = require('./database/user');

test.getUserGroup(12).then(result => {
    console.log(result);
});