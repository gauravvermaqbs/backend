const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = require("../multer/app.multer");
const { Configuration, OpenAIApi } = require("openai");
const csv = require('csv-parser');


const Replicate = require("replicate");
const axios = require("axios");
const dotenv = require("dotenv");
const { image } = require("@tensorflow/tfjs-node");
dotenv.config();
const cloudinary = require("cloudinary").v2;
// const upload = require("../multer/app.multer")

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

router.post(
  "/prediction/upload",
  upload.single("image"),
  async function (req, res) {
    console.log("chh");
    const { imageUrl } = req.file;
    console.log(req.file.buffer);
    // const image = fs.readFileSync(req.file.path);
    const base64 = Buffer.from(req.file.buffer).toString("base64");
    const url = `data:image/jpeg;base64,${base64}`;

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    });
    const output = await replicate
      .run(
        "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
        {
          input: {
            image: url,
          },
        }
      )
      .then((respo) => {
        console.log(respo);
        res.status(200).json({ message: respo });
      })
      .catch((err) => {
        console.log(`err1`, err);
        res.status(200).json({ message: err });
      });
  }
);

router.post("/prediction", async function (req, res) {
  console.log("chh");
  const { image } = req.body;
  console.log(req.body);
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });
  const output = await replicate
    .run(
      "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
      {
        input: {
          image: image,
        },
      }
    )
    .then((respo) => {
      console.log(respo);
      res.status(200).json({ message: respo });
    })
    .catch((err) => {
      console.log(`err2`, err);
      res.status(400).json({ message: err });
    });
  // console.log(output)
});

router.post("/text-to-image", async function (req, res) {
  const { prompt } = req.body;
  console.log(req.body);
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });

  await replicate
    .run(
      "borisdayma/dalle-mini:2e3975b1692cd6aecac28616dba364cc9f1e30c610c6efd62dbe9b9c7d1d03ea",
      {
        input: {
          prompt: prompt,
        },
      }
    )
    .then((resp) => {
      console.log(resp);
      // res.set('Content-Type', 'audio/wav');
      res.send(resp);
    })
    .catch((err) => {
      console.log(err);
    });
});

const tags = (image) => {
  console.log("image", image);
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload(image, { categorization: "google_tagging", auto_tagging: 0.6 })
      .then((resp) => {
        const tags = resp.info.categorization.google_tagging.data;
        console.log(tags);
        return resolve({
          data: tags,
        });
      })
      .catch((err) => {
        consol.log(`err1`, err);
        reject(err);
      });
  });
};

router.post(
  "/imageTag/upload",
  upload.single("image"),
  async function (req, res) {
    const { image } = req.file;
    console.log(req.file);
    const base64 = Buffer.from(req.file.buffer).toString("base64");
    const url = `data:image/jpeg;base64,${base64}`;
    tags(url)
      .then((resp) => {
        console.log(resp);
        return res.send({
          status: 1,
          message: "success",
          data: resp.data,
        });
      })
      .catch((err) => {
        console.log(`err2`, err);
        return res.send({
          status: -1,
          message: err,
        });
      });
  }
);

router.post("/imageTag", async function (req, res) {
  const { image } = req.body;
  console.log(req.body);
  tags(req.body.image)
    .then((resp) => {
      console.log(resp);
      return res.send({
        status: 1,
        message: "success",
        data: resp.data,
      });
      // res.sendStatus(200).json({status: 1, message: "success", data: resp.data})
    })
    .catch((err) => {
      console.log(`err3`, err);
      return res.send({
        status: -1,
        message: err,
      });
    });
});

router.post(
  "/generate-description",
  upload.single("image"),
  async (req, res) => {
    try {
      // Get the path of the uploaded image file
      const imagePath = req.file.path;

      // Process the image using sharp
      const processedImage = await sharp(imagePath)
        .resize(224, 224) // Resize the image if needed
        .toBuffer();

      // Load the pre-trained COCO-SSD model
      const model = await cocoSsd.load();

      // Perform object detection on the processed image
      const predictions = await model.detect(processedImage);

      // Extract object labels from the predictions
      const labels = predictions.map((prediction) => prediction.class);

      // Create the image description
      const description = `The image contains: ${labels.join(", ")}`;

      // Send the description as the API response
      res.json({ description });
    } catch (error) {
      console.error("Error generating description:", error);
      res.status(500).json({
        error: "An error occurred while generating the image description",
      });
    }
  }
);
router.post("/shortDesc", async (req, res) => {
  const { text } = req.body;
  // console.log(arr)
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  // try {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate short descripton in maximum 20 words from text: ${text}`,
    max_tokens: 1000,
    temperature: 0,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  res.send(response.data.choices[0].text);
  // } catch (err) {
  //   console.error(err);
  // }
});


router.post("/longDesc", async (req, res) => {
  const { text } = req.body;
  // console.log(arr)
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  // try {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate long descripton of 120 words from text: ${text}`,
    max_tokens: 1000,
    temperature: 0,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  res.send(response.data.choices[0].text);
  // } catch (err) {
  //   console.error(err);
  // }
});


router.post("/description", async (req, res) => {
  const results = [];

  fs.createReadStream("info.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      const jsonResult = {};

      for (let i = 0; i < results.length; i++) {
        const row = results[i];

        for (const key in row) {
          if (!jsonResult[key]) {
            jsonResult[key] = [];
          }

          jsonResult[key].push(row[key]);
        }
      }

      for(let i=0; i<jsonResult.image.length; i++){
        if(req.body.image.path===jsonResult.image[i]){
          // if(jsonResult.Description[i]!=="")
          return res.send(jsonResult.Description[i])
        }
      }
      return res.send("error");
      // console.log(jsonResult)
    });
});

router.post("/savedAlt", async (req, res) => {
  const results = [];

  fs.createReadStream("info.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => {
      const jsonResult = {};

      for (let i = 0; i < results.length; i++) {
        const row = results[i];

        for (const key in row) {
          if (!jsonResult[key]) {
            jsonResult[key] = []; 
          }

          jsonResult[key].push(row[key]);
        }
      }

      for(let i=0; i<jsonResult.image.length; i++){
        if(req.body.image.path===jsonResult.image[i]){
          // if(jsonResult.AltText[i]!=="")
          setTimeout(() => {

            return res.send(jsonResult.AltText[i])
          },3000)
        }
      }
      // return res.send("error");
      // console.log(jsonResult)
    });
});

module.exports = router;
