const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config()

router.post("/textValidation", async (req, res) => {
    const { content, prompt } = req.body;
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const correct_response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${prompt} ${content} `,
      max_tokens: 2048,
      temperature: 1,
    });
    res.send(correct_response.data.choices[0].text);
  });

  module.exports = router