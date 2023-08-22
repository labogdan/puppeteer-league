const fs = require("fs");
const path = require("path");

exports.checkFileExists = (req, res) => {
  console.log('checking file exists');
  const filename = req.query.filename;
  console.log(filename);

  if (!filename) {
    return res.status(400).json({ error: 'Filename is required.' });
  }

  const filePath = path.join(__dirname, '/data/output/', filename);
  console.log(filePath);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.log(err);
      res.json({ exists: false });
    } else {
      res.json({ exists: true });
    }
  });
};

exports.downloadFile = (req, res) => {
  const filePath = path.join(__dirname, '/data/output/', 'playlouisianasoccer-urls.csv');
  res.download(filePath, 'playlouisianasoccer-urls.csv');
};

module.exports = exports;