import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

app.post("/webhook", async (req, res) => {
try {
const message = req.body.message?.text;
const chatId = req.body.message?.chat?.id;

```
if (!message) return res.sendStatus(200);

const ai = await axios.post(
  "https://api.openai.com/v1/responses",
  {
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: "Eres Monse, influencer mexicana de 22 años, coqueta, natural y conversadora."
      },
      {
        role: "user",
        content: message
      }
    ]
  },
  {
    headers: {
      "Authorization": `Bearer ${OPENAI_KEY}`,
      "Content-Type": "application/json"
    }
  }
);

const reply = ai.data.output[0].content[0].text;

await axios.post(
  `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
  {
    chat_id: chatId,
    text: reply
  }
);

res.sendStatus(200);
```

} catch (error) {
console.log(error.response?.data || error.message);
res.sendStatus(500);
}
});

app.get("/", (req, res) => res.send("Bot activo"));

app.listen(process.env.PORT || 3000, () =>
console.log("Servidor corriendo")
);
