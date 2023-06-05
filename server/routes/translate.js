const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const router = express.Router();
const dotenv = require("dotenv");
const translate = require("translate-google");
dotenv.config();

router.post("/translate", async (req, res) => {
  const { message, language } = req.body;
  // console.log(message,language)
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);
  // try {
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Translate this into ${language}: ${message}`,
    max_tokens: 1000,
    temperature: 0.3,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });
  res.send(response.data.choices[0].text);
  // } catch (err) {
  //   console.error(err);
  // }
});

router.post("/translate-google", async (req, res) => {
  const { message, language } = req.body;
  try {
    const translation = await translate(message, {
      from: "auto",
      to: language,
    });
    let regex = /&( nbsp|amp|quot|lt|gt);/g;
    let result = translation.replace(regex, "");
    res.json(result);
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "An error occurred while translating." });
  }
});

module.exports = router;
