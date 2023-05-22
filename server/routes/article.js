const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const upload = require("../multer/app.multer");
const Replicate = require("replicate");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const { Configuration, OpenAIApi } = require("openai");
const { error } = require("console");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const sentence = async function extractKeySentences(prompt) {
  console.log("word", prompt);
  const model = "text-davinci-002";
  const prompts = prompt;
  try {
    const response = await openai.createCompletion({
      model: model,
      prompt: prompts,
      max_tokens: 1000,
      n: 1,
    });
    const generatedText = response.data.choices[0].text;
    return generatedText;
  } catch (err) {
    console.log(err);
    throw new error(err);
  }
};

router.post("/poem", async function (req, res) {
  console.log(req.body.prompt);
  // const { word } = req.body.topic;
  sentence(req.body.prompt)
    .then((resp) => {
      console.log(resp);
      res.json({ status: 1, data: resp });
    })
    .catch((err) => {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while generating essay" });
    });
});

router.post("/article", async function (req, res) {
  const { topic } = req.body;
  try {
    await openai
      .createCompletion({
        model: "text-davinci-003",
        prompt: `write an essay about${topic}:`,
        temperature: 0.3,
        max_tokens: 4000,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      })
      .then((respo) => {
        // const CircularJSON = require('circular-json');
        console.log(respo.data.choices[0].text);
        res.send({ status: 1, data: respo.data.choices[0].text });
      });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

router.post("/spell-auto-correction", async function (req, res) {
  const { sentence } = req.body;
  const correctedSentence=[]
  console.log(req.body)
  try {
    await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Correct sentence into to standard English:${sentence}\n\nCorrected sentence:`,
        temperature: 0,
        max_tokens: 60,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      })
      .then((respo) => {
        // const CircularJSON = require('circular-json');
        // const correctedSentence ={correctedSentence:respo.data.choices[0].text,}
        console.log(respo.data.choices[0].text);
      //  const resut= correctedSentence.push(respo.data.choices[0].text.replace(/\n\n/g, " "))
      res.send({correctedSentence: respo.data.choices[0].text })
        // res.sendStatus(200).json(resut)
      });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});


module.exports = router;
