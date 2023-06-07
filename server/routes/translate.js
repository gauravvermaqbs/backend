const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const router = express.Router();
const dotenv = require("dotenv");
const api = process.env.GOOGLE_API;
const googleTranslate = require("google-translate")(api);
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
  googleTranslate.translate(message, language, function (err, translation) {
    res.send(translation.translatedText);
  });
});

module.exports = router;
