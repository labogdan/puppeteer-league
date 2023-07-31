const fs = require("fs");

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

exports.findWithSelectors = (parent, selector) => {
  let foundElements = [];
  let outerElements = document.querySelectorAll(parent);

  for (let i = 0; i < outerElements.length; i++) {
      let innerElements = outerElements[i].querySelectorAll(selector);
      for (let j = 0; j < innerElements.length; j++) {
          foundElements.push(innerElements[j]);
      }
  }

  return foundElements;
}

exports.find = (parent, selector) => {
  let foundElements = [];
  let outerElements = parent;

    console.log(parent);
    console.log(outerElements.length);
    
  
    if (outerElements.length) {
      for (let i = 0; i < outerElements.length; i++) {
        let innerElements = outerElements[i].querySelectorAll(selector);
        console.log(innerElements);
        for (let j = 0; j < innerElements.length; j++) {
            foundElements.push(innerElements[j]);
        }
      }    
    } else {
      let innerElements = outerElements.querySelectorAll(selector);
      console.log(innerElements);
      for (let j = 0; j < innerElements.length; j++) {
        foundElements.push(innerElements[j]);
      }
    }
    
  return foundElements;
}

exports.readData = async (INPUT_FILE) => {
  let csvRecords = [];
  const readStream = fs.readFileSync(INPUT_FILE, {
    encoding: 'utf8',
  });
  
  csvRecords.push(
    readStream.split(/\r?\n/).map((line) => {
        return line.split(',');
    })
  );
  return csvRecords;
}

// iterate through an array selecting each value at random until the array is empty
// return the selected values in an array
exports.selectRandomValuesFromArray = (arr, num) => {
  let retVal = [];
  let arrCopy = arr.slice();
  for (let i = 0; i < num; i++) {
    let index = Math.floor(Math.random() * arrCopy.length);
    retVal.push(arrCopy[index]);
    arrCopy.splice(index, 1);
  }
  return retVal;
}

exports.dontSelectRandomValuesFromArray = (arr, num) => {
  return arr;
}

exports.removeWhitespaceAndNewlines = (input) => {
  return input.replace(/\s/g, "");
}



module.exports = exports;