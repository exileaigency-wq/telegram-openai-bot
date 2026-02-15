import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

/* ---------- Health check (Railway) ---------- */
app.get("/", (req, res) => {
  res.status(200).send("OK");
});

/* ---------- Webhook ---------- */
app.post("/webhook", async (req, res) => {
  try {
    console.log("UPDATE:", JSON.stringify(req.body));

    const msg = req.body?.message;
    if (!msg) return res.sendStatus(200);

    const chatId = msg.chat.id;
    const text = msg.text || "";

    let reply = "hola 👀";

    /* ---------- OpenAI ---------- */
    if (OPENAI_KEY) {
      try {
        const ai = await axios.post(
          "https://api.openai.com/v1/responses",
          {
            model: "gpt-4.1-mini",
            input: [
              {
                role: "system",
                content:
                  "Eres Monse, influencer mexicana de 22 años, coqueta, natural y conversadora."
              },
              {
                role: "user",
                content: text
              }
            ]
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_KEY}`,
              "Content-Type": "application/json"
            }
          }
        );

        reply =
          ai.data?.output?.[0]?.content?.[0]?.text ||
          ai.data?.output_text ||
          reply;
      } catch (e) {
        console.log("OpenAI error:", e.response?.data || e.message);
      }
    }

    /* ---------- Telegram response ---------- */
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: reply
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.log("Webhook fatal error:", err);
    res.sendStatus(200);
  }
});

/* ---------- IMPORTANT: Railway port ---------- */
const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
