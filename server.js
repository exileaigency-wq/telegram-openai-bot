import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

/* ---------- TEST RAILWAY ---------- */
app.get("/", (req, res) => {
res.status(200).send("ok");
});

/* ---------- WEBHOOK ---------- */
app.post("/webhook", async (req, res) => {
try {
const msg = req.body?.message;
if (!msg) return res.sendStatus(200);

```
const chatId = msg.chat.id;
const text = msg.text || "";

console.log("MENSAJE:", text);

let reply = "ando ocupada 🙈";

if (OPENAI_KEY && text) {
  try {
    const ai = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres Monse, influencer mexicana de 22 años, coqueta, natural y relajada." },
          { role: "user", content: text }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    reply = ai.data.choices[0].message.content;
  } catch (err) {
    console.log("ERROR OPENAI:", err.response?.data || err.message);
  }
}

await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
  chat_id: chatId,
  text: reply
});

return res.sendStatus(200);
```

} catch (err) {
console.log("ERROR GENERAL:", err);
return res.sendStatus(200);
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("RUNNING", PORT));
