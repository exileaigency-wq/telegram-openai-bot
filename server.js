import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

app.get("/", (req, res) => res.send("Bot activo"));

app.post("/webhook", async (req, res) => {
const msg = req.body?.message;
if (!msg || !msg.chat) return res.sendStatus(200);

const chatId = msg.chat.id;
const text = msg.text || "Hola";

let reply = "Hola 😊";

if (OPENAI_KEY) {
try {
const response = await axios.post(
"https://api.openai.com/v1/responses",
{
model: "gpt-4.1-mini",
input: text
},
{
headers: {
Authorization: `Bearer ${OPENAI_KEY}`,
"Content-Type": "application/json"
}
}
);

```
  reply = response.data?.output?.[0]?.content?.[0]?.text || reply;
} catch {}
```

}

await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
chat_id: chatId,
text: reply
});

res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Servidor listo"));
