Module['locateFile'] = function(path, scriptDirectory) {
    // /\.\.\/[^\/]*\/?/
    return scriptDirectory + '../' + path
}