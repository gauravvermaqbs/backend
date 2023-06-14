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
    // prompt:`You are a school teacher and you have to create assessment for kids, keep the difficulty level medium. You have to generate ${no_of_questions} ${questionFormat} questions from the text in the same format as give below in Json_format_example object which has an questions key and has an value array, put all questions in the array. Json_format_example and text is given below:
    // \nText: ${text} \nJson_format_example:${formatType}`,
    max_tokens: 1500,
    temperature: temperature,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  res.send(response.data.choices[0].text);
});

module.exports = router