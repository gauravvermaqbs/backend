const multer = require('multer')
const path = require('path')

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "upload");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        file.fieldname + "-" + Date.now() + path.extname(file.originalname)
      );
    },
  });

const uploadAudioVideo = multer({
  storage: storage,
  limits: { fileSize: 20000000000},
  fileFilter: function (_req, file, cb) {
    filter(file, cb);
  }
}); 


  const filter = function checkFileType(file, cb) {
    const filetypes = /m4a|flac|mp3|mp4|wav|mpeg|webm|mkv/;
    console.log("file", file)
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(`Error: Not supported ${file.fieldname} file!`);
        
    }
  }

  // const upload = multer({
  //   storage:storage,
  //   fileFilter: function (_req, file, cb) {
  //     filter(file, cb);
  // }
  // })

//   const multer = require('multer')
// const path = require('path')


const uploads = multer({
  storage: multer.memoryStorage({}),
  limits: { fileSize: 20000000},
  fileFilter: function (_req, file, cb) {
    filters(file, cb);
  }
}); 

  const filters = function checkFileType(file, cb) {
    const filetypes = /mp4|webm|mkv/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: video in mp4, webm, mkv format Only!');
        
    }
  }

  // const upload = multer({
  //   storage:storage,
  //   fileFilter: function (_req, file, cb) {
  //     filter(file, cb);
  // }
  // })

  module.exports = uploadAudioVideo;

