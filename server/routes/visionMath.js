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

router.post("/altTextDescription", async (req,res) => {
  const {altText}=req.body;
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Generate detailed description: ${altText}`,
    max_tokens: 100,
    temperature: 0.3,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  res.send(response.data.choices[0].text);
})

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
