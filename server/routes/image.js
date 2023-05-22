const express = require("express");
const router = express.Router();
const tinify = require("tinify");
const fs = require("fs");
const upload = require("../multer/app.multer");
const url = `api.tinify.com`;
const fullurl = `${url}/shrink`;
const FormData = require("form-data");
const dotenv = require("dotenv");
dotenv.config();
const formData = new FormData();

tinify.key = process.env.tinify_api_key;
// const output = "./compressedFile";
const compressImage = (buffer) => {
  return new Promise((resolve, reject) => {
    tinify.fromBuffer(buffer).toBuffer((err, resultData) => {
      if (err) {
        reject(err);
      } else {
        resolve(resultData);
      }
    });
  });
};
const convertImage = (buffer, c) => {
    // console.log("chh", c)
    if(c=="image/JPEG"){
    return new Promise((resolve, reject) => {
      tinify.fromBuffer(buffer).convert({
         "type": "image/jpeg", 
      }).toBuffer((err, resultData) => {
        if (err) {
          reject(err);
        } else {
          resolve(resultData);
        }
      });
      
    });
  }if(c=="image/png"){
    return new Promise((resolve, reject) => {
        tinify.fromBuffer(buffer).convert({
           "type": "image/png"
        }).toBuffer((err, resultData) => {
          if (err) {
            reject(err);
          } else {
            resolve(resultData);
          }
        });
        
      });
  }if(c=="image/jpg"){
    return new Promise((resolve, reject) => {
        tinify.fromBuffer(buffer).convert({
           "type": "image/jpg"
        }).toBuffer((err, resultData) => {
          if (err) {
            reject(err);
          } else {
            resolve(resultData);
          }
        });       
      });
  }
}

const resizeImage = (buffer, h, w, m) => {
    const height = parseInt(h)
    const width = parseInt(w)
    const method = m
    return new Promise((resolve, reject) => {
      tinify.fromBuffer(buffer).resize({height, width, method
      }).toBuffer((err, resultData) => {
        if (err) {
          reject(err);
        } else {
          resolve(resultData);
        }
      });
    });
  };

router.post(
  "/compressImage",
  upload.single("image"),
  async function (req, res) {
    const image = req.file;
    // const size = '207565';
    console.log(req.file);
    // const formData = new FormData();
    // formData.append('image', req.file.buffer);
    // formData.append('size', size);
    compressImage(req.file.buffer)
      .then((result) => {
        res.set("Content-Type", "image/png");
        res.send(result);
      })
      .catch((err) => {
        console.log(`err`, err);
        res.status(500).send(err);
      });
  }
);

router.post(
    "/compressImageByUrl",
    async function (req, res) {
      const imageUrl = req.body;
      console.log(req.body);
      compressImage(req.body)
        .then((result) => {
            console.log(result)
          res.set("Content-Type", "image/png");
          res.send(result);
        })
        .catch((err) => {
          console.log(`err`, err);
          res.status(500).send(err);
        });
    }
  );

  router.post(
    "/resizeImage",
    upload.single("image"),
    async function (req, res) {
      const image = req.file;
      // const size = '207565';
    //   const size = req.body.resize
      console.log(req.file);
    const {height, width,fit}=req.body
    console.log(req.body.height)
      resizeImage(req.file.buffer, height, width, fit)
        .then((result) => {
          res.set("Content-Type", "image/png");
          res.send(result);
        })
        .catch((err) => {
          console.log(`err`, err);
          res.status(500).send(err);
        });
    }
  );

  router.post(
    "/convertImage",
    upload.single("image"),
    async function (req, res) {
      const image = req.file;
      // const size = '207565';
      console.log(req.body.convert);

      convertImage(req.file.buffer, req.body.convert)
        .then((result) => {
            console.log(result)
        // const y =`image/${path.extname(req.file.originalname).toLowerCase()}`
          res.set("Content-Type", "image");
          res.send(result);
        })
        .catch((err) => {
          console.log(`err`, err);
          res.status(500).send(err);
        });
    }
  );

module.exports = router;
