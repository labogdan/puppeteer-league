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
      console.log('doesnt exist')
      console.log(err);
      res.json({ exists: false });
    } else {
      console.log('exists')
      res.json({ exists: true });
    }
  });
};

exports.downloadFile = (req, res) => {
  console.log('download file');
  const filename = req.query.filename;
  console.log(filename);

  if (!filename) {
    return res.status(400).json({ error: 'Filename is required.' });
  }

  const filePath = path.join(__dirname, '/data/output/', filename);
  res.download(filePath);
};

exports.deleteFile = (req, res) => {
  console.log('delete file');
  const filename = req.query.filename;
  console.log(filename);

  if (!filename) {
    return res.status(400).json({ error: 'Filename is required.' });
  }

  const filePath = path.join(__dirname, '/data/output/', filename);
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ deleted: true });
    }
  });
}

module.exports = exports;