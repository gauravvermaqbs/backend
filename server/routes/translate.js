const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config()
// console.log(process.env.OPENAI_API_KEY)

router.post("/translate", async (req, res) => {
    const { message, language } = req.body;
    // console.log(message,language)
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-curie-001",
      prompt: `Translate this into ${language}: ${message}`,
      max_tokens: 1000,
      temperature: 0.6,
    });
    res.send(response.data.choices[0].text);

  });

  module.exports = router
