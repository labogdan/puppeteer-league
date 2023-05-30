exports.wait = (val) => {
    return new Promise(resolve => setTimeout(resolve, val));
};

exports.getParameterByName = (name, url) => {
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    let results;
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    console.log(decodeURIComponent(results[2].replace(/\+/g, ' ')));
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

module.exports = exports;