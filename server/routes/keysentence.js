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

router.post('/key-sentences', async (req, res) => {
    try{
      const {paragraph} = req.body
      const completion = await openai.createCompletion({
        model: "davinci",
        prompt: `Please generate key sentences for the following paragraph:\n${paragraph}`, //Jupiter is the fifth planet from the Sun and the largest in the Solar System. It is a gas giant with a mass one-thousandth that of the Sun, but two-and-a-half times that of all the other planets in the Solar System combined. Jupiter is one of the brightest objects visible to the naked eye in the night sky, and has been known to ancient civilizations since before recorded history. It is named after the Roman god Jupiter.[19] When viewed from Earth, Jupiter can be bright enough for its reflected light to cast visible shadows,[20] and is on average the third-brightest natural object in the night sky after the Moon and Venus.",
        max_tokens: 1024,
       n: 3, // Number of key sentences to generate
       stop: '\n\n', // Stop generating key sentences after a blank line
      
      })
      console.log(completion.data.choices[0].text.trim().split('\n'))
      const keySentences = completion.data.choices[0].text.trim().split('\n');
      res.json({ keySentences });
  
    }catch(err){
      console.error(err);
      res.status(500).json({ error: 'An error occurred while generating key sentences' });
    }
});
  
router.post('/key-sentencess', async (req, res) => {
  const openaiClient = new openai.OpenAIApi({ apiKey: process.env.OPENAI_API_KEY });
  const languageModel = new openai.LanguageModelApi(openaiClient);
  console.log(req.body)
  try{
    const { data } = await languageModel.summarize({
      model: 'text-davinci-002',
      text: req.body.paragraph,
      maxTokens: 64,
      doSample: true,
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });
    const keySentences = data.reduce((acc, cur) => {
      if (cur.text.includes('.')) {
        const sentences = cur.text.split('.').map(sentence => sentence.trim()).filter(sentence => sentence !== '');
  
        if (sentences.length > 0) {
          return [...acc, ...sentences];
        }
      }
  
      return acc;
    }, []);
  
    res.json({ keySentences });

  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'An error occurred while generating key sentences' });
  }
});


router.post('/key-sentence', (req, res) => {
  try {
    const { paragraph } = req.body;
    console.log(req.body)
    const sentences = paragraph.split(/[.?!]\s/g); // Split the paragraph into sentences
    console.log(sentences)
    const tfidf = new natural.TfIdf(); // Initialize a new TfIdf instance
    sentences.forEach((sentence) => tfidf.addDocument(sentence)); // Add each sentence to TfIdf
    const keySentences = [];
    tfidf.listTerms(0).forEach((term) => { // Get the top term in the paragraph
      sentences.forEach((sentence) => { // Loop through each sentence
        if (sentence.toLowerCase().includes(term.term.toLowerCase()) && !keySentences.includes(sentence)) {
          // If the sentence includes the term and is not already in keySentences, add it
          keySentences.push(sentence);
        }
      });
    });
    res.json({ keySentences });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while finding key sentences' });
  }
});

module.exports = router