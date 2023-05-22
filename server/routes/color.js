const express = require("express");
const router = express.Router();
const multer = require("multer");
const dotenv = require("dotenv");
const colorChecker = require("../colorchecker/color-checker");
const fs = require("fs");
dotenv.config();
const FormData = require("form-data");
const axios = require("axios");
const { response } = require("express");
const Jimp = require("jimp");
const upload = multer();
const api_key = process.env.api_key;
const api_secret = process.env.api_secret;
router.post("/color", upload.single("image"), async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
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
    data: formData, "extract_overall_colors": false,
  })
    .then((response) => {
      const result = response.data.result.colors;
      console.log("Result from axios call",result);
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
      console.log("Background color after matching with image color",backgroundColor);

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

      console.log("foreground color after matching with image color",foregroundColor);
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
          }
        else {
        // if (!found) {
          console.log(found)
          const bgcolor = backgroundColor.map(
            ({ b, g, r }) => ({ b, g, r })
          );
          // console.log(bgcolor);
          const frcolor = foregroundColor.map(
            ({ b, g, r }) => ({ b, g, r })
          );

          // console.log(frcolor);
          // for (let i = 0; i < bgcolor.length; i++) {
            // for (let j = 0; j < frcolor.length; j++) {
              console.log(bgcolor[i])
              console.log(frcolor[j])
              const contrastRatio = colorChecker.getContrastRatio(
                bgcolor[i],
                frcolor[j]
              );
              console.log(contrastRatio);
              const resultWithExistingFontSize =
                colorChecker.verifyContrastRatio(contrastRatio, 14);

              const resultWithLargeFontSize = colorChecker.verifyContrastRatio(
                contrastRatio,
                18
              );
              const frrgbToHex = colorChecker.rgbToHex(bgcolor[i]);
              const bgrgbToHex = colorChecker.rgbToHex(frcolor[j]);
              console.log(frrgbToHex);
              console.log(bgrgbToHex);
              const results = {
                background_color:bgcolor[i],
                foreground_color:frcolor[j],
                contrast_ratio:contrastRatio,
                normal_text:resultWithExistingFontSize,
                LargeText: resultWithLargeFontSize,
                background_color_code:bgrgbToHex,
                foreground_color_code:frrgbToHex
              }
              console.log("contrast ratio",results)
             contrast_report.push(results)
            //  i--

            // }
            // }
          }
        }
      }

     
        const mergedObject = {
        backgroundColor,foregroundColor,imgcolor,
        contrast_report: contrast_report,
      };
      // console.log("final result",mergedObject )
      res.send(
        mergedObject
      )
  
    })
    .catch((error) => {
      console.log(`err1`, error);
      res.send(error);
    });
});

module.exports = router;
