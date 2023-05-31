const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const router = express.Router();
const { default: axios } = require("axios");
const dotenv = require("dotenv");
const { get } = require("https");
dotenv.config();

router.post("/visionMath", async (req, res) => {
  const { url } = req.body;
  const response = await axios.post(
    "https://api.mathpix.com/v3/text",
    {
      src: url,
      formats: ["text", "data", "html"],
      data_options: {
        include_asciimath: true,
        include_latex: true,
        include_mathml: true,
      },
    },
    {
      headers: {
        app_id: process.env.VISIONMATH_API_ID,
        app_key: process.env.VISIONMATH_API_KEY,
      },
    }
  );
  res.send(response.data);
});

router.post("/latexToText", async (req, res) => {
  const { mathml } = req.body;
  let response = await axios.get(
    `https://www.wiris.net/demo/editor/mathml2accessible?mml=${mathml}`
  );
  res.send(response.data);
});

// router.post("/visionMath/pdf", async (req, res) => {
//   const { url } = req.body;
//   const response = await axios.post(
//     "https://api.mathpix.com/v3/pdf",
//     {
//       url: url,
//       conversion_formats: { docx: true, "tex.zip": true },
//     },
//     {
//       headers: {
//         app_id: process.env.VISIONMATH_API_ID,
//         app_key: process.env.VISIONMATH_API_KEY,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   res.send(response.data);
// });

module.exports = router;
