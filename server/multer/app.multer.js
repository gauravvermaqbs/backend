const multer = require('multer')
const path = require('path')

// var storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "upload");
//     },
//     filename: function (req, file, cb) {
//       cb(
//         null,
//         file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//       );
//     },
//   });

const upload = multer({
  storage: multer.memoryStorage({}),
  limits: { fileSize: 20000000},
  fileFilter: function (_req, file, cb) {
    filter(file, cb);
  }
}); 

  const filter = function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|webp|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
        
    }
  }

  // const upload = multer({
  //   storage:storage,
  //   fileFilter: function (_req, file, cb) {
  //     filter(file, cb);
  // }
  // })

  module.exports = upload;

