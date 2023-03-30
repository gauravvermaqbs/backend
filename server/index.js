const express = require("express");
const cors = require("cors");
const { Configuration, OpenAIApi } = require("openai");
const app = express();

app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.post("/translate", async (req, res) => {
  const { message, language,api_key } = req.body;
  const configuration = new Configuration({
    apiKey: api_key,
  });
  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `Translate this into ${language}: ${message}`,
    max_tokens: 2048,
    temperature: 1,
  });
  res.send(JSON.stringify(response.data));
  // console.log(response.data)
});

app.listen(PORT, () => {
  console.log(`server running on ${PORT}`);
});
