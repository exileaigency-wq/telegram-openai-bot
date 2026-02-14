import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// Health check para Railway
app.get("/", (req, res) => {
res.status(200).send("Bot activo");
});

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

app.post("/webhook", async (req, res) => {
try {
const msg = req.body?.message;
if (!msg || !msg.chat) return res.sendStatus(200);

```
const chatId = msg.chat.id;
const message = msg.text || "";

let reply = "Ahorita ando ocupada 🙈, escríbeme en un ratito";

// Intentar respuesta IA
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
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );

  reply = ai.data?.output?.[0]?.content?.[0]?.text || reply;
} catch (e) {
  console.log("OpenAI sin saldo o error");
}

// Enviar respuesta a Telegram
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

// Puerto dinámico de Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
console.log("Servidor listo en puerto " + PORT);
});

