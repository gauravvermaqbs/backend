const express = require("express");
const router = express.Router();
const multer = require('multer')


const cloudinary = require('cloudinary').v2;
const upload = require("../multer/app.multer")

const dotenv = require('dotenv');
dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});


const tags = (image)=>{
  console.log("image", image)
  return new Promise((resolve, reject)=>{
    cloudinary.uploader.upload(image, { categorization: 'google_tagging', auto_tagging:0.6 }).then((resp)=>{
      const tags = resp.info.categorization.google_tagging.data;
      console.log(tags)
      return resolve({
        data:tags
      })
    }).catch((err)=>{
      reject(err)
    })
  })
}

router.post("/imageTag/upload", upload.single('image'), async function(req, res){
  
  const {image} = req.file
  console.log(req.file)
  tags(req.file.path).then((resp)=>{
    console.log(resp)
    return res.send({
      status: 1, message: "success", data: resp.data
    })

  }).catch((err)=>{

  })
  
}
)

router.post("/imageTag", async function(req, res){
  
  const {image} = req.body
  console.log(req.body)
  tags(req.body.image).then((resp)=>{
    console.log(resp)
    return res.send({
      status: 1, message: "success", data: resp.data
    })
    // res.sendStatus(200).json({status: 1, message: "success", data: resp.data})

  }).catch((err)=>{

  })
  
}
)


module.exports=router