const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config()

router.post("/gradeAnswer", async (req, res) => {
    const { question, answer } = req.body;
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      // prompt: `Give correct grades in percentage on the basis of answer:${answer} for the question:${question}`,
      prompt: `Grade the answer from 0 upto 5 based on its accuracy: \n\nQuestion:${question} \nAnswer:${answer} \n\nGrading:`,
      // prompt:`Please rate exact accuracy of the following answer on a scale of 0 to 5, where 0 represents the lowest score and 5 represents the highest score and give response in number only:
      // Question: ${question}
      // Answer: ${answer}`,
      max_tokens: 60,
      temperature: 0,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    res.send(response.data.choices[0].text);
  });

  module.exports = router