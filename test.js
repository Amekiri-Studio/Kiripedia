const test = require('./database/encyclopedia');

test.checkPostPremission(1).then( (result) => {
    console.log(result);
});