const express = require("express");
const router = express.Router();
const multer = require("multer");
const dotenv = require("dotenv");
const colorChecker = require("../colorchecker/color-checker");
const fs = require("fs");
const Clarifai = require("clarifai");
dotenv.config();
const FormData = require("form-data");
const axios = require("axios");
const { response } = require("express");
const Jimp = require("jimp");
const upload = multer();
const KMeans = require("node-kmeans");
const Color = require("color");
const { resolve } = require("path");
const cloudinary = require("cloudinary").v2;
// const dotenv=require('dotenv');

// dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
// const uploads = require("../cloudinary/cloudinary")
const api_key = process.env.api_key;
const api_secret = process.env.api_secret;
const app = new Clarifai.App({
  apiKey: "394ffbd298d74b1583d8f242a23967ac",
});
router.post("/color", upload.single("image"), async function (req, res) {
  console.log(req.file);
  const formData = new FormData();
  formData.append("image", req.file.buffer, {
    filename: req.file.originalname,
  });
  // const Authorization= 'Basic ' + Buffer.from(api_key + ':' + api_secret).toString('base64')
  const endpoint = "https://api.imagga.com/v2/colors";
  // const extract_object_colors='0'

  await axios({
    method: "post",
    url: endpoint,
    headers: {
      Authorization:
        "Basic " + Buffer.from(api_key + ":" + api_secret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: formData,
    extract_overall_colors: false,
  })
    .then((response) => {
      const result = response.data.result.colors;
      console.log("Result from axios call", result);
      const contrast_report = [];
      // const result = []
      const backgroundColor = response.data.result.colors.background_colors;
      const foregroundColor = response.data.result.colors.foreground_colors;
      const imgcolor = response.data.result.colors.image_colors;
      for (let i = 0; i < backgroundColor.length; i++) {
        let found = false;
        for (let j = 0; j < imgcolor.length; j++) {
          if (
            JSON.stringify(backgroundColor[i].closest_palette_color) ===
            JSON.stringify(imgcolor[j].closest_palette_color)
          ) {
            found = true;
            break;
          }
        }
        if (!found) {
          backgroundColor.splice(i, 1);
          i--;
        }
      }
      console.log(
        "Background color after matching with image color",
        backgroundColor
      );

      for (let i = 0; i < foregroundColor.length; i++) {
        let found = false;
        for (let j = 0; j < imgcolor.length; j++) {
          if (
            JSON.stringify(foregroundColor[i].closest_palette_color) ===
            JSON.stringify(imgcolor[j].closest_palette_color)
          ) {
            found = true;
            break;
          }
        }
        if (!found) {
          foregroundColor.splice(i, 1);
          i--;
        }
      }

      console.log(
        "foreground color after matching with image color",
        foregroundColor
      );
      // console.log("bb", foregroundColor);
      // console.log("fr", backgroundColor);
      for (let i = 0; i < backgroundColor.length; i++) {
        let found = false;
        for (let j = 0; j < foregroundColor.length; j++) {
          if (
            JSON.stringify(backgroundColor[i].closest_palette_color) ===
            JSON.stringify(foregroundColor[j].closest_palette_color)
          ) {
            found = true;
            break;
          } else {
            // if (!found) {
            console.log(found);
            const bgcolor = backgroundColor.map(({ b, g, r }) => ({ b, g, r }));
            // console.log(bgcolor);
            const frcolor = foregroundColor.map(({ b, g, r }) => ({ b, g, r }));

            // console.log(frcolor);
            // for (let i = 0; i < bgcolor.length; i++) {
            // for (let j = 0; j < frcolor.length; j++) {
            console.log(bgcolor[i]);
            console.log(frcolor[j]);
            const contrastRatio = colorChecker.getContrastRatio(
              bgcolor[i],
              frcolor[j]
            );
            console.log(contrastRatio);
            const resultWithExistingFontSize = colorChecker.verifyContrastRatio(
              contrastRatio,
              14
            );

            const resultWithLargeFontSize = colorChecker.verifyContrastRatio(
              contrastRatio,
              18
            );
            const frrgbToHex = colorChecker.rgbToHex(bgcolor[i]);
            const bgrgbToHex = colorChecker.rgbToHex(frcolor[j]);
            console.log(frrgbToHex);
            console.log(bgrgbToHex);
            const results = {
              background_color: bgcolor[i],
              foreground_color: frcolor[j],
              contrast_ratio: contrastRatio,
              normal_text: resultWithExistingFontSize,
              LargeText: resultWithLargeFontSize,
              background_color_code: bgrgbToHex,
              foreground_color_code: frrgbToHex,
            };
            console.log("contrast ratio", results);
            contrast_report.push(results);
            //  i--

            // }
            // }
          }
        }
      }

      const mergedObject = {
        backgroundColor,
        foregroundColor,
        imgcolor,
        contrast_report: contrast_report,
      };
      // console.log("final result",mergedObject )
      res.send(mergedObject);
    })
    .catch((error) => {
      console.log(`err1`, error);
      res.send(error);
    });
});

const uploads = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload(file)
      .then((result) => {
        console.log("success");
        // console.log(result);
        resolve(result);
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

const extractColors = async (imageURL) => {
  console.log(imageURL);
  try {
    // Call the Clarifai API to predict colors
    const response = await app.models.predict(Clarifai.COLOR_MODEL, imageURL);

    // Extract the colors from the API response
    const colors = response.outputs[0].data.colors;

    // Return the extracted colors
    return colors;
  } catch (error) {
    console.error("Error extracting colors:", error);
    throw error;
  }
};

// router.post(
//   "/color-analysis",
//   upload.single("image"),
//   async function (req, res) {
//     console.log(req.file);
//     const base64 = Buffer.from(req.file.buffer).toString("base64");
//     const url = `data:image/jpeg;base64,${base64}`;
//     const response = await uploads(url)
//     console.log(response)
//     uploads(url)
//       .then((res) => {
//         console.log("aa",res);
//         const img = res.secure_url;
//         extractColors(img)
//           .then((colors) => {
//             console.log("Extracted Colors:", colors);
//             const rawHexArray = colors.map(color => color.raw_hex);
//             console.log(rawHexArray)
//             const colorarray=[]
//             for(let i=0; i<rawHexArray.length;i++){
//             const hexcolor = colorChecker.hexToRgb(rawHexArray[i])
//             console.log("hmm",hexcolor)
//             colorarray.push(hexcolor)
//             }
//             console.log(colorarray)
//             if(colorarray.length==2){
//               console.log("hii")
//             const numForegroundColors = 2;
//             KMeans.clusterize(colorarray, { k: numForegroundColors }, (err, res) => {
//               if (err) {
//                 // console.error('Error:', err);
//                 return;
//               }

//               const backgroundCluster = res.pop(); // Last cluster is assumed to be background

//               const backgroundColor = backgroundCluster.centroid;
//               console.log('Background color:', backgroundColor);

//               const foregroundColors = res.map(cluster => cluster.centroid);
//               console.log('Foreground colors:', foregroundColors);
//               for(let i=0;i<backgroundColor.length;i++){
//                 for(let j =0;j<foregroundColors.length;j++){
//                   const contrastRatio = colorChecker.getContrastRatio(
//                     backgroundColor[i],
//                     foregroundColors[j]
//                   );
//                   console.log(contrastRatio);
//                   const resultWithExistingFontSize = colorChecker.verifyContrastRatio(
//                     contrastRatio,
//                     14
//                   );

//                   const resultWithLargeFontSize = colorChecker.verifyContrastRatio(
//                     contrastRatio,
//                     18
//                   );

//                 }
//               }
//             });
//             }
//             if(colorarray.length==3){
//               const numForegroundColors = 3;
//               KMeans.clusterize(colorarray, { k: numForegroundColors }, (err, res) => {
//                 if (err) {
//                   // console.error('Error:', err);
//                   return;
//                 }

//                 const backgroundCluster = res.pop(); // Last cluster is assumed to be background

//                 const backgroundColor = backgroundCluster.centroid;
//                 console.log('Background color:', backgroundColor);

//                 const foregroundColors = res.map(cluster => cluster.centroid);
//                 console.log('Foreground colors:', foregroundColors);
//                 for(let i=0;i<backgroundColor.length;i++){
//                   for(let j =0;j<foregroundColors.length;j++){
//                     const contrastRatio = colorChecker.getContrastRatio(
//                       backgroundColor[i],
//                       foregroundColors[j]
//                     );
//                     console.log(contrastRatio);
//                     const resultWithExistingFontSize = colorChecker.verifyContrastRatio(
//                       contrastRatio,
//                       14
//                     );

//                     const resultWithLargeFontSize = colorChecker.verifyContrastRatio(
//                       contrastRatio,
//                       18
//                     );

//                   }
//                 }
//               });
//             }else{
//               console.log(colorarray.length)
//               const numForegroundColors = 4;
//               KMeans.clusterize(colorarray, { k: numForegroundColors }, (err, res) => {
//                 if (err) {
//                   // console.error('Error:', err);
//                   return;
//                 }

//                 const backgroundCluster = res.pop(); // Last cluster is assumed to be background
//                 const backcolor=[]
//                 const backgroundColor = backgroundCluster.centroid;

//                 backcolor.push(backgroundColor)
//                 console.log('Background :', backcolor);

//                 const foregroundColors = res.map(cluster => cluster.centroid);
//                 console.log('Foreground colors:', foregroundColors);
//                 console.log("Background color length",backcolor.length )

//                 for(let i=0;i<backcolor.length;i++){
//                   const bgrgbToHex=colorChecker.rgbToHex(backcolor[i])

//                   for(let j =0;j<foregroundColors.length;j++){
//                     const contrastRatio = colorChecker.getContrastRatio(
//                       backcolor[i],
//                       foregroundColors[j]
//                     );
//                     // console.log(contrastRatio);
//                     const resultWithExistingFontSize = colorChecker.verifyContrastRatio(
//                       contrastRatio,
//                       14
//                     );

//                     const resultWithLargeFontSize = colorChecker.verifyContrastRatio(
//                       contrastRatio,
//                       18
//                     );

//                     const frrgbToHex=colorChecker.rgbToHex(foregroundColors[j])
//                     // console.log(bgrgbToHex)
//                     // console.log(frrgbToHex)
//                     const results = {
//                       background_color: backcolor[i],
//                       foreground_color: foregroundColors[j],
//                       contrast_ratio: contrastRatio,
//                       normal_text: resultWithExistingFontSize,
//                       LargeText: resultWithLargeFontSize,
//                       background_color_code: bgrgbToHex,
//                       foreground_color_code: frrgbToHex,
//                     };
//                     return results
//                   //  res.send(results)

//                   }
//                 }
//               });
//             }
//             res.send(results)

//           })
//           .catch((error) => {
//             // console.error("Error:", error);
//             res.send(error)
//           })
//           // .finally(
//           //   cloudinary.uploader.destroy(res.public_id)
//           //   .then(()=>{
//           //     console.log("deleted")
//           //   })
//           // )
//           // console.log(res.public_id)
//       })
//       .catch((err) => {
//         res.send(err)

//       })
//   }
// );
const kmeans = async (colorarray) => {
  return new Promise((resolve, reject) => {
    try {
      const contrast_report = [];
      if (colorarray.length == 2) {
        const numForegroundColors = 2;
        // const numForegroundColors = 4;
        KMeans.clusterize(
          colorarray,
          { k: numForegroundColors },
          (err, res) => {
            if (err) {
              // console.error('Error:', err);
              return;
            }
            const backgroundCluster = res.pop(); // Last cluster is assumed to be background
            const backgroundColor = backgroundCluster.centroid;
            const backcolor = [];
            backcolor.push(backgroundColor);
            console.log("background color", backcolor);
            const foregroundColors = res.map((cluster) => cluster.centroid);
            console.log("Foreground colors:", foregroundColors);
            // console.log("Background :", backcolor);
            for (let i = 0; i < backcolor.length; i++) {
              const bgrgbToHex = colorChecker.rgbToHex(backcolor[i]);
              for (let j = 0; j < foregroundColors.length; j++) {
                const contrastRatio = colorChecker.getContrastRatio(
                  backcolor[i],
                  foregroundColors[j]
                );
                console.log("contrast ratio", contrastRatio);
                const resultWithExistingFontSize =
                  colorChecker.verifyContrastRatio(contrastRatio, 14);

                const resultWithLargeFontSize =
                  colorChecker.verifyContrastRatio(contrastRatio, 18);

                const frrgbToHex = colorChecker.rgbToHex(foregroundColors[j]);
                // console.log(bgrgbToHex)
                // console.log(frrgbToHex)
                const results = {
                  background_color: backcolor[i],
                  foreground_color: foregroundColors[j],
                  contrast_ratio: contrastRatio,
                  normal_text: resultWithExistingFontSize,
                  LargeText: resultWithLargeFontSize,
                  background_color_code: bgrgbToHex,
                  foreground_color_code: frrgbToHex,
                };
                contrast_report.push(results);
                // console.log(results)
                resolve(contrast_report);
                console.log({ contrast_report });
              }
              // resolve(results)
            }
          }
        );
      }
      if (colorarray.length == 3) {
        const numForegroundColors = 2;
        // const numForegroundColors = 4;
        KMeans.clusterize(
          colorarray,
          { k: numForegroundColors },
          (err, res) => {
            if (err) {
              // console.error('Error:', err);
              return;
            }
            const backgroundCluster = res.pop(); // Last cluster is assumed to be background
            const backgroundColor = backgroundCluster.centroid;
            const backcolor = [];
            backcolor.push(backgroundColor);
            console.log("background color", backcolor);
            const foregroundColors = res.map((cluster) => cluster.centroid);
            console.log("Foreground colors:", foregroundColors);
            // console.log("background color :", backcolor);
            for (let i = 0; i < backcolor.length; i++) {
              const bgrgbToHex = colorChecker.rgbToHex(backcolor[i]);
              for (let j = 0; j < foregroundColors.length; j++) {
                const contrastRatio = colorChecker.getContrastRatio(
                  backcolor[i],
                  foregroundColors[j]
                );
                console.log("contrast ratio", contrastRatio);
                const resultWithExistingFontSize =
                  colorChecker.verifyContrastRatio(contrastRatio, 14);

                const resultWithLargeFontSize =
                  colorChecker.verifyContrastRatio(contrastRatio, 18);

                const frrgbToHex = colorChecker.rgbToHex(foregroundColors[j]);
                // console.log(bgrgbToHex)
                // console.log(frrgbToHex)
                const results = {
                  background_color: backcolor[i],
                  foreground_color: foregroundColors[j],
                  contrast_ratio: contrastRatio,
                  normal_text: resultWithExistingFontSize,
                  LargeText: resultWithLargeFontSize,
                  background_color_code: bgrgbToHex,
                  foreground_color_code: frrgbToHex,
                };
                contrast_report.push(results);
                // console.log(results)
                resolve(contrast_report);
                console.log({ contrast_report });
              }
              // resolve(results)
            }
          }
        );
      } if (colorarray.length >= 4) {
        const numForegroundColors = 5;
        KMeans.clusterize(
          colorarray,
          { k: numForegroundColors },
          (err, res) => {
            if (err) {
              return;
            }
            const backgroundCluster = res.pop(); // Last cluster is assumed to be background
            const backgroundColor = backgroundCluster.centroid;
            const backcolor = [];
            backcolor.push(backgroundColor);
            console.log("background color", backcolor);
            const foregroundColors = res.map((cluster) => cluster.centroid);
            console.log("Foreground colors:", foregroundColors);
            for (let i = 0; i < backcolor.length; i++) {
              const bgrgbToHex = colorChecker.rgbToHex(backcolor[i]);
              for (let j = 0; j < foregroundColors.length; j++) {
                const contrastRatio = colorChecker.getContrastRatio(
                  backcolor[i],
                  foregroundColors[j]
                );
                console.log("contrast ratio", contrastRatio);
                const resultWithExistingFontSize =
                  colorChecker.verifyContrastRatio(contrastRatio, 14);
                const resultWithLargeFontSize =
                  colorChecker.verifyContrastRatio(contrastRatio, 18);
                const frrgbToHex = colorChecker.rgbToHex(foregroundColors[j]);
                const results = {
                  background_color: backcolor[i],
                  foreground_color: foregroundColors[j],
                  contrast_ratio: contrastRatio,
                  normal_text: resultWithExistingFontSize,
                  LargeText: resultWithLargeFontSize,
                  background_color_code: bgrgbToHex,
                  foreground_color_code: frrgbToHex,
                };
                contrast_report.push(results);
                resolve(contrast_report);
              }
              // resolve(results)
            }
          }
        );
      }
    } catch (err) {
      console.log(err);
    }
  });
};
router.post(
  "/color-analysis",
  upload.single("image"),
  async function (req, res) {
    console.log(req.file);
    const base64 = Buffer.from(req.file.buffer).toString("base64");
    const url = `data:image/jpeg;base64,${base64}`;
    const response = await uploads(url);
    try{
    // const response = await uploads(url);
    const img = response.secure_url;
    const extractedColor = await extractColors(img);
    const rawHexArray = extractedColor.map((color) => color.raw_hex);
    console.log(rawHexArray);
    const colorarray = [];
    for (let i = 0; i < rawHexArray.length; i++) {
      const hexcolor = colorChecker.hexToRgb(rawHexArray[i]);
      colorarray.push(hexcolor);
    }
    const kmeansCluster = await kmeans(colorarray);
    console.log("image", img)
    res.send(kmeansCluster);
  }catch(error){ 
    console.log(error);
    console.log("aa",response)
  } finally{
    cloudinary.uploader.destroy(response.public_id)
    .then(()=>{
      console.log("deleted")
    })
  }
  
})

module.exports = router;