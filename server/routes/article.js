const express = require("express");
const router = express.Router();
const multer = require('multer')
const path = require('path')
const fs = require("fs")
// const wav = require('wav');
// const natural = require('natural');
const upload = require("../multer/app.multer")
// const {NlpManager}  = require('node-nlp');
const Replicate = require("replicate")
const axios = require("axios")
const dotenv = require('dotenv');
dotenv.config()

const { Configuration, OpenAIApi } = require("openai");
const { error } = require("console");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const sentence = async function extractKeySentences(word) {
    console.log("word", word)
    const model = "text-davinci-002";
    const prompts = `Write an essay on ${word}`;
    try {
      const response = await openai.createCompletion({
        model: model,
        prompt: prompts,
        max_tokens: 2000,
        n: 1,
  
      })
      const generatedText = response.data.choices[0].text;
      return generatedText
    } catch (err) {
      console.log(err)
      throw new error(err)
  
    }
  
  }


router.post("/essay", async function (req, res) {
    console.log(req.body.topic)
    const {word} = req.body.topic
    sentence(req.body.topic).then((resp) => {
      console.log(resp)
      res.json({status:1, data:resp});
    }).catch((err) => {
      console.log(err)
      res.status(500).json({ error: 'An error occurred while generating essay' });
    })
  })
  
  router.post("/article", async function (req, res) {
    const { topic } = req.body;
    try {
      await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `write an essay about${topic}:`,
        temperature: 0.3,
        max_tokens: 4000,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }).then((respo)=>{
        // const CircularJSON = require('circular-json');
        console.log(respo.data.choices[0].text)
        res.send({status:1, data:respo.data.choices[0].text});
      });
    } catch (error) {
      console.error(error);
      res.sendStatus(500);
    }
  });

  module.exports = router