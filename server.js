import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

/* HEALTHCHECK */
app.get("/", (req, res) => {
  res.send("Bot activo");
});

/* WEBHOOK TELEGRAM */
app.post("/webhook", async (req, res) => {
  try {
    const msg = req.body?.message;
    if (!msg || !msg.chat) return res.sendStatus(200);

    const chatId = msg.chat.id;
    const userText = msg.text || "";

    let reply = "Escríbeme otra vez 🙈";

    try {
      const ai = await axios.post(
        "https://api.openai.com/v1/responses",
        {
          model: "gpt-4.1-mini",
          input: [
            {
              role: "system",
              content:
                "Eres Monse, influencer mexicana de 22 años, coqueta, natural y conversadora.",
            },
            {
              role: "user",
              content: userText,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      /* 🔴 PARSEO SEGURO (LA CLAVE DEL 502) */
      reply =
        ai.data?.output_text ||
        ai.data?.output?.[0]?.content?.[0]?.text ||
        "jeje no supe que decir 😅";
    } catch (err) {
      console.log("OpenAI error:", err.response?.data || err.message);
      reply = "Ahorita ando ocupada 🙈";
    }

    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: reply,
      }
    );

    res.sendStatus(200);
  } catch (err) {
    console.log("Webhook fatal:", err.message);
    res.sendStatus(200);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
