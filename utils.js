exports.wait = (val) => {
    return new Promise(resolve => setTimeout(resolve, val));
};

module.exports = exports;