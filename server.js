import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

/* HEALTHCHECK (Railway) */
app.get("/", (req, res) => {
  res.status(200).send("Bot activo");
});

/* WEBHOOK TELEGRAM */
app.post("/webhook", async (req, res) => {
  // MUY IMPORTANTE: responder inmediatamente a Telegram
  res.sendStatus(200);

  try {
    const msg = req.body?.message;
    if (!msg) return;

    const chatId = msg.chat.id;
    const text = msg.text || "";

    let reply = "🙈 ando ocupada pero aquí ando jiji";

    // /start siempre responde aunque OpenAI falle
    if (text === "/start") {
      reply = "Holii soy Monse 💕 ¿cómo te llamas?";
    } else {

      try {
        const ai = await axios.post(
          "https://api.openai.com/v1/responses",
          {
            model: "gpt-4.1-mini",
            input: [
              {
                role: "system",
                content:
                  "Eres Monse, influencer mexicana de 22 años, coqueta, natural, divertida, hablas casual como chat real, mensajes cortos tipo WhatsApp."
              },
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

        reply =
          ai.data?.output?.[0]?.content?.[0]?.text ||
          reply;

      } catch (e) {
        console.log("Error OpenAI:", e.response?.data || e.message);
      }
    }

    // enviar respuesta a telegram
    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: reply
      }
    );

  } catch (err) {
    console.log("Webhook crash:", err.message);
  }
});

/* START SERVER */
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
