const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const app = express();
const cors = require("cors");
const bodyParser = require('body-parser')
const sgMail = require("@sendgrid/mail");
const dotenv = require('dotenv');
dotenv.config()

app.use(express.json());
// app.use(cors());
app.options('*', cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const PORT = process.env.PORT || 9000;
app.set("port", PORT);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.use("/", require('./routes/routes'));
app.use("/", require("./routes/transcribe"))
app.use("/", require("./routes/article"))
app.use("/", require("./routes/summary"))
app.use("/", require("./routes/keysentence"))
app.use("/", require("./routes/color"))
app.use("/", require("./routes/image"))

app.use("/", require("./routes/translate"))
app.use("/", require("./routes/textValidate"))
app.use("/", require("./routes/assessmentCreator"))
app.use("/", require("./routes/visionMath"))
app.use("/", require("./routes/smartGrade"))


app.post("/convertToQuestion", async (req, res) => {
  const { html } = req.body;
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
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
