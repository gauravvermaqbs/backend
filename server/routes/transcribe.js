const express = require("express");
const router = express.Router();
const multer = require('multer')
const path = require('path')
const fs = require("fs")
const uploadAudioVideo = require("../multers/app.multer")
const Replicate = require("replicate")
const axios = require("axios")
const FormData = require("form-data")
const dotenv = require('dotenv');
dotenv.config()

const { Configuration, OpenAIApi } = require("openai");
const { error } = require("console");
const { promises } = require("dns");
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});


const openai = new OpenAIApi(configuration);

router.post("/transcribe", uploadAudioVideo.single('audioClip'), async function (req, res) {
  const model = 'whisper-1'
  const response_format = 'srt'
  const includeTimestamps= "true"
  const transcript_mode= 'timestamped_words'
  
  console.log(req.file)
  // console.log(req.body)
  // console.log(`./upload/${req.file.fieldname}-${req.file.originalname}${path.extname(req.file.originalname)}`)
  console.log(`${req.file.filename}`)
  const audio = fs.createReadStream(`./upload/${req.file.filename}`);
  // const audio = req.file.buffer


  await openai.createTranscription(
    audio, model,transcript_mode,response_format).then((resp) => {
       console.log(resp.data)
      res.send(resp.data)
    }).catch((err) => {
      console.log("err", err)
      res.send(err)
    }).finally(()=>{
      fs.unlink(req.file.path, (err)=>{
        if (err) throw err
      })
    })

})

router.post("/video-transcription", uploadAudioVideo.single('video'), async function (req, res) {
  const model = 'whisper-1'
  const response_format = 'srt'
  const includeTimestamps= "true"
  const transcript_mode= 'timestamped_words'
  
  console.log(req.file)
  // console.log(req.body)
  // console.log(`./upload/${req.file.fieldname}-${req.file.originalname}${path.extname(req.file.originalname)}`)
  console.log(`${req.file.filename}`)
  const video = fs.createReadStream(`./upload/${req.file.filename}`);


  await openai.createTranscription(
    video, model,transcript_mode,response_format).then((resp) => {
      res.send(resp.data)
    }).catch((err) => {
      console.log("err", err)
      res.send(err)
    }).finally(()=>{
      fs.unlink(req.file.path, (err)=>{
        if (err) throw err
      })
    })

})
router.post("/video-transcription-json", uploadAudioVideo.single('video'), async function (req, res) {
  const model = 'whisper-1'
  
  console.log(req.file)
  console.log(`${req.file.filename}`)
  const audio = fs.createReadStream(`./upload/${req.file.filename}`);


  await openai.createTranscription(
    audio, model).then((resp) => {
      console.log("response", resp.data)
      res.send(resp.data)
    }).catch((err) => {
      console.log("err", err)
      res.send(err)
    }).finally(()=>{
      fs.unlink(req.file.path, (err)=>{
        if (err) throw err
      })
    })

})
router.post("/transcribe-json", uploadAudioVideo.single('audioClip'), async function (req, res) {
  res.header('Access-Control-Allow-Origin', '*');
  const model = 'whisper-1'
  
  console.log(req.file)
  console.log(`${req.file.filename}`)
  const audio = fs.createReadStream(`./upload/${req.file.filename}`);


  await openai.createTranscription(
    audio, model).then((resp) => {
      console.log("response", resp.data)
      res.send(resp.data)
    }).catch((err) => {
      console.log("err", err)
      res.send(err)
    }).finally(()=>{
      fs.unlink(req.file.path, (err)=>{
        if (err) throw err
      })
    })

})

router.post("/transcription_rep", uploadAudioVideo.single('audio'), async function (req, res) {
  const model = 'large-v1'
//   const word_timestamps=true
//   // console.log(word_timestamps)
//  const word_timestamp={
//     word_timestamps:true
//   }
//   console.log(word_timestamp)
  const audio = fs.readFileSync(req.file.path);
  const base64 = Buffer.from(audio).toString('base64');
  const url = `data:audio/mp3;base64,${base64}`;
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });
  const output = await replicate.run(
    "hnesk/whisper-wordtimestamps:4a60104c44dd709fc08a03dfeca6c6906257633dd03fd58663ec896a4eeba30e",
    {
      input: {
        audio: url,
        word_timestamps:true
      }
      
      
    }).then((resp)=>{
      // console.log(resp.segments)
      const words = resp.segments.map(word=>word.words);
      console.log(words)
      const wordsWithTimestamps = resp.segments.map(word => ({
        word: word.words,
        startTime: word.start,
        endTime: word.end
      }));
      console.log(resp.segments)
      res.send(wordsWithTimestamps)
    }).catch((err)=>{
      console.log(err)
    }).finally(()=>{
      fs.unlink(req.file.path, (err)=>{
        if (err) throw err
      })
    });

})
const url = "https://asr.api.speechmatics.com/v2/jobs/"


const jobStatus = async (job_id, headers,query) => {
  const checkUrl = `${url}${job_id}`;
  return new Promise((resolve, reject) => {
    let isConditionMet = false;

    const checkStatus = async () => {
      try {
        const response = await axios.get(checkUrl, {headers});
        if (response.data.job.status === 'done') {
          if(!query){
          axios
            .get(`${checkUrl}/transcript`, {headers})
            .then((resp) => {
              isConditionMet = true;
              console.log(resp.data.results);
              resolve(resp); // Resolve the promise with the response
            })
            .catch((err) => {
              console.log(err);
              reject(err); // Reject the promise if there's an error
            });
        }else{
          console.log(query)
          axios
          .get(`${checkUrl}/transcript?format=${query}`, {headers})
          .then((resp) => {
            isConditionMet = true;
            console.log(resp.data);
            resolve(resp); // Resolve the promise with the response
          })
          .catch((err) => {
            console.log(err);
            reject(err); // Reject the promise if there's an error
          });

        }
        } else {
          setTimeout(checkStatus, 1000); // Call checkStatus again after 5 seconds if the condition is not met
        }
      // }else{

      // }
      } catch (error) {
        console.error(error);
        reject(error); // Reject the promise if there's an error
      }
    };

    checkStatus(); // Start checking the status initially
  });
};

router.post("/speechMatics", uploadAudioVideo.single('audioClip'), async function (req, res) {
  const api_key = "iUKKF1etTJslDfQxrshSQLSFMjm7FxD9";
  console.log(process.env.speech_api_key)
  const config = {
    type: "transcription",
    transcription_config: {
      operating_point: "enhanced",
      language: "en"
    },
  };

  const formData = new FormData();
  formData.append("data_file", fs.createReadStream(req.file.path));
  formData.append("config", JSON.stringify(config));

  const headers = {
    Authorization: `Bearer ${api_key}`,
    ...formData.getHeaders()
  };

  try {
    const response = await axios.post(url, formData, { headers });
    const resp = await jobStatus(response.data.id, headers,req.query.format);
    if(req.query.format){
      console.log("Response",resp.data);
    res.send(resp.data);
    }else{ 
      console.log("Json Response",resp.data.results);
      const wordsWithTimestamps = resp.data.results.map(item => ({
        word: item.alternatives[0].content,
        startTime: item.start_time,
        endTime: item.end_time
      }));
      res.send(wordsWithTimestamps,);
    }
    // res.send(resp.data)
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  } finally{(
    fs.unlink(req.file.path, (err)=>{
      if(err){
        console.log(err);
      }
    })
  )}
});


module.exports = router

