const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config()

router.post("/assessmentCreator", async (req, res) => {
  const { text, formatType, questionFormat,no_of_questions, temperature } = req.body;
  console.log(formatType, questionFormat,no_of_questions, temperature);
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    // prompt: `Step 1: Create mcq assessments from the article: ${text}. Step 2: Write generated mcq assessments in ${formatType}.`,
    prompt: `Create ${no_of_questions} best ${questionFormat} and answers from ${text} in ${formatType}.`,
    // prompt:`You are a teacher with 10 years of experience, Generate 5 MCQs quickly in json format with questions as root object having fields in array as question, answers, correct_answer_index : ${text}`,
    max_tokens: 1500,
    temperature: temperature,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  res.send(response.data.choices[0].text);
});

module.exports = router