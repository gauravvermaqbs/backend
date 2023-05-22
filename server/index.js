const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");
const { urlencoded } = require("express");
const app = express();
const path = require("path");
const { default: axios } = require("axios");
const sgMail = require("@sendgrid/mail");

app.use(express.json());
app.use(cors());
app.use(urlencoded({ extended: true }));

const PORT = process.env.PORT || 9000;
app.set("port", PORT);

app.use(express.static(path.join(__dirname, "public")));
app.get("/hello", function (req, res) {
  res.send("hello");
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/", require("./routes/app.routes"));

app.post("/translate", async (req, res) => {
  const { message, language, api_key } = req.body;
  const configuration = new Configuration({
    apiKey: api_key,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Translate this into ${language}: ${message}`,
    max_tokens: 2048,
    temperature: 0.7,
  });
  res.send(response.data.choices[0].text);
});

app.post("/textValidation", async (req, res) => {
  const { content, api_key, prompt } = req.body;
  const configuration = new Configuration({
    apiKey: api_key,
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

app.post("/assessmentCreator", async (req, res) => {
  const { text, api_key, formatType,questionFormat,temperature } = req.body;
  const configuration = new Configuration({
    apiKey: api_key,
  });
  
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    // prompt: `Step 1: Create mcq assessments from the article: ${text}. Step 2: Write generated mcq assessments in ${formatType}.`,
    prompt: `Create all posible ${questionFormat} and answers from ${text} in ${formatType}.`,
    max_tokens: 2048,
    temperature: temperature,
    top_p:1.0,
    frequency_penalty:0,
    presence_penalty:0
  });
  res.send(response.data.choices[0].text);
});

app.post("/visionMath", async (req, res) => {
  const { url } = req.body;
  const response = await axios.post(
    "https://api.mathpix.com/v3/text",
    {
      src: url,
      formats: ["text", "data", "html"],
      data_options: {
        include_asciimath: true,
        include_latex: true,
        include_mathml: true,
      },
    },
    {
      headers: {
        app_id: "siby_sebastian_magicsw_com_d863e7",
        app_key:
          "6660944e6ec28e584cc4d4d9747e7c6ec4e9b5f3a5450b0c27de1371fc059981",
      },
    }
  );
  res.send(response.data);
});

app.post("/latexToText", async (req, res) => {
  const { latex, api_key } = req.body;
  const configuration = new Configuration({
    apiKey: api_key,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Convert Latex in words : ${latex}`,
    max_tokens: 2048,
    temperature: 1,
  });
  res.send(response.data.choices[0].text);
});

app.post("/convertToQuestion", async (req, res) => {
  const { html, api_key } = req.body;
  const configuration = new Configuration({
    apiKey: api_key,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Convert html code into normal text: ${html}`,
    max_tokens: 2048,
    temperature: 1,
  });
  // console.log(response.data.choices[0].text)
  res.send(response.data.choices[0].text);
});

app.post("/gradeAnswer", async (req, res) => {
  const { question, answer, api_key } = req.body;
  const configuration = new Configuration({
    apiKey: api_key,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    // prompt: `Give correct grades in percentage on the basis of answer:${answer} for the question:${question}`,
    prompt: `Grade the answer from 0 to 5 based on its accuracy: \n\nQuestion:${question} \nAnswer:${answer} \n\nGrading:`,
    // prompt:`Please rate exact accuracy of the following answer on a scale of 0 to 5, where 0 represents the lowest score and 5 represents the highest score and give response in number only:
    // Question: ${question}
    // Answer: ${answer}`,
    max_tokens: 60,
    temperature: 0,
    top_p:1.0,
    frequency_penalty:0,
    presence_penalty:0
  });
  res.send(response.data.choices[0].text);
});

app.post("/sendOtp", async (req, res) => {
  const { email, otp } = req.body;
  // console.log(email,otp)
  sgMail.setApiKey(
    "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"
  );
  const msg = {
    to: email,
    from: "noreply@qbslearning.com",
    subject: "OTP Verification",
    html: `<h1>Welcome to Content Pilot</h1>
    <p>Your OTP is : <span><strong>${otp}</strong></span></p>`,
    // text: `Your OTP is ${otp}`,
  };
  try {
    await sgMail.send(msg);
    console.log("OTP email sent successfully");
  } catch (error) {
    console.error(error);
  }
});

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
