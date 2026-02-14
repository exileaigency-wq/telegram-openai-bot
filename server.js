import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// RESPUESTA INMEDIATA PARA RAILWAY (health check)
app.get("/", (req, res) => {
res.status(200).send("Bot activo");
});

const msg = req.body?.message;
if (!msg || !msg.chat) return res.sendStatus(200);

const chatId = msg.chat.id;
const message = msg.text || "";

app.post("/webhook", async (req, res) => {
try {
const message = req.body.message?.text;
const chatId = req.body.message?.chat?.id;

```
if (!message) return res.sendStatus(200);

let reply = "Ahorita ando ocupada 🙈, escríbeme en un ratito";

try {
  const ai = await axios.post(
    "https://api.openai.com/v1/responses",
    {
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: "Eres Monse, influencer mexicana de 22 años, coqueta, natural y conversadora." },
        { role: "user", content: message }
      ]
    },
    {
      headers: { Authorization: `Bearer ${OPENAI_KEY}` }
    }
  );

  reply = ai.data?.output?.[0]?.content?.[0]?.text || reply;
} catch (e) {
  console.log("OpenAI sin saldo o error");
}

await axios.post(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
  chat_id: chatId,
  text: reply
});

res.sendStatus(200);
```

} catch (err) {
console.log("Webhook error:", err.message);
res.sendStatus(200);
}
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
console.log("Servidor listo en puerto " + PORT);
});
