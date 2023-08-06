function processUserAvatarPath(fullpath) {
    let path_groups = fullpath.split("/");
    let result = `/${path_groups[path_groups.length - 2]}/${path_groups[path_groups.length - 1]}`;
    return result;
}

// need processed path
function getUidOnPath(process_path) {
    let path_groups = process_path.split("/");
    let result = parseInt(path_groups[1]);
    return result;
}

module.exports = {
    processUserAvatarPath,getUidOnPath
}