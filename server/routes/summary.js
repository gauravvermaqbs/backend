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

router.post("/summary", async function(req, res){
  try{
    const {paragraph} = req.body
    // const prompt = `Please generate key sentences for the following paragraph:\n${paragraph}`;
    // console.log(prompt)
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Summarize this for a second-grade student:\n\n${paragraph}`, //Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined. Jupiter is one of the brightest objects visible to the naked eye in the night sky, and has been known to ancient civilizations since before recorded history. It is named after the Roman god Jupiter.[19] When viewed from Earth, Jupiter can be bright enough for its reflected light to cast visible shadows,[20] and is on average the third-brightest natural object in the night sky after the Moon and Venus.",
      temperature: 0.7,
      max_tokens: 128,
      n: 5, 
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    })
    console.log(completion.data.choices[0].text.trim().split('\n'))
    const summary = completion.data.choices[0].text.trim().split('\n');
    res.json({status:1, data:summary });

  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'An error occurred while generating key sentences' });
  }
})

router.post("/rephrase", async function(req, res){
  try{
    const {text} = req.body
    console.log(text)
    // console.log(tex)
    // const prompt = `Please generate key sentences for the following paragraph:\n${paragraph}`;
    // console.log(prompt)
    // console.log(tex[i])
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Rephrase the following text: ${text}`, //Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined. Jupiter is one of the brightest objects visible to the naked eye in the night sky, and has been known to ancient civilizations since before recorded history. It is named after the Roman god Jupiter.[19] When viewed from Earth, Jupiter can be bright enough for its reflected light to cast visible shadows,[20] and is on average the third-brightest natural object in the night sky after the Moon and Venus.",
      temperature: 0.7,
      max_tokens: 256, 
      top_p: 1.0,
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    }) 
   
    // console.log(completion.data.choices[0].text)
    // console.log(completion.data.choices[0].text.trim().split('\n'))
    const summary = completion.data.choices[0].text.replace(/\n\n/g, " ");
    console.log(summary)
    res.json({status:1, data:summary });
   }catch(err){
    console.error(err.response.data);
    res.status(500).json({ error: 'An error occurred while rephrasing' });
  }
})
  

module.exports = router