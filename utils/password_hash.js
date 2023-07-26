var crypto = require('crypto');
function hash_pwd(name,password) {
    var hash = crypto.createHash('sha512', name);
    hash.update(password);
    return hash.digest('hex');
}

function verifyPwd(name, password, _hash) {
    var hash = crypto.createHash('sha512', name);
    hash.update(password);
    return _hash === hash.digest('hex');
}

module.exports = {
    hash_pwd,
    verifyPwd
}