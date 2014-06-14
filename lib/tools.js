function logger() {
    console.log.apply(null, arguments);
}

module.exports = {
    "logger" : logger
};
