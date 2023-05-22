const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config()

router.post("/assessmentCreator", async (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
  const { text, formatType, questionFormat, temperature } = req.body;
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    // prompt: `Step 1: Create mcq assessments from the article: ${text}. Step 2: Write generated mcq assessments in ${formatType}.`,
    prompt: `Create all posible ${questionFormat} and answers from ${text} in ${formatType}.`,
    max_tokens: 2048,
    temperature: temperature,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  res.send(response.data.choices[0].text);
});

module.exports = router