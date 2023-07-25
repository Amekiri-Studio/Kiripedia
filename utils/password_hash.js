function hash_pwd(name,password) {
    var hash = crypto.createHash('sha512', name);
    return hash.digest(password);
}