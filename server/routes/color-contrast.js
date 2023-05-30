const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { Vibrant } = require("node-vibrant");
const colorThief = require("colorthief");
const path = require("path");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const Contrast = require("wcag-contrast");
const ColorDiff = require("color-diff");
const axios = require("axios");
const FormData = require("form-data");
const colorChecker = require("../colorchecker/color-checker");

const upload = multer();

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

const api_key = process.env.api_key;
const api_secret = process.env.api_secret;

router.post("/color-contrast", upload.single("image"), async (req, res) => {
  const formData = new FormData();
  formData.append("image", req.file.buffer, {
    filename: req.file.originalname,
  });
  // const Authorization= 'Basic ' + Buffer.from(api_key + ':' + api_secret).toString('base64')
  const endpoint =
    "https://api.imagga.com/v2/colors?overall_count=20&deterministic=1";
  // const extract_object_colors='0'

  let response = await axios({
    method: "post",
    url: endpoint,
    headers: {
      Authorization:
        "Basic " + Buffer.from(api_key + ":" + api_secret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    data: formData,
    // extract_overall_colors: false,
  });
  let colors = response.data.result.colors.image_colors;
  console.log(colors);
  colors = colors.filter((color) => color.percent >= 3);
  let contrast_report = [];
  for (let i = 0; i < colors.length; i++) {
    for (let j = 0; j < colors.length; j++) {
      if (i !== j) {
        let backcolorRGB = [colors[i].r, colors[i].g, colors[i].b];
        let foregroundColorsRGB = [colors[j].r, colors[j].g, colors[j].b];
        const contrastRatio = colorChecker.getContrastRatio(
          backcolorRGB,
          foregroundColorsRGB
        );
        // console.log("contrast ratio", contrastRatio);
        const resultWithExistingFontSize = colorChecker.verifyContrastRatio(
          contrastRatio,
          14
        );

        const resultWithLargeFontSize = colorChecker.verifyContrastRatio(
          contrastRatio,
          18
        );
        let report = {
          background_color: colors[i].html_code,
          foreground_color: colors[j].html_code,
          contrast_ratio: contrastRatio,
          normal_text: resultWithExistingFontSize,
          LargeText: resultWithLargeFontSize,
        };
        // console.log(report);
        pushIfNotExists(contrast_report, report);
      }
    }
  }
  res.send(contrast_report);
});

function pushIfNotExists(array, object) {
  if (!array.some((item) => item.contrast_ratio === object.contrast_ratio)) {
    array.push(object);
  }
}

module.exports = router;
