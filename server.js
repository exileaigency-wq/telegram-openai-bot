import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_KEY = process.env.OPENAI_KEY;

// health check
app.get("/", (req, res) => res.send("ok"));

// webhook
app.post("/webhook", async (req, res) => {

  try {

    const msg = req.body?.message;
    if (!msg || !msg.chat) {
      return res.sendStatus(200);
    }

    const chatId = msg.chat.id;
    const text = msg.text || "";

    let reply = "Holaa 👀";

    // intentar usar openai
    if (OPENAI_KEY) {
      try {
        const ai = await axios.post(
          "https://api.openai.com/v1/responses",
          {
            model: "gpt-4.1-mini",
            input: `Eres Monse, influencer mexicana coqueta de 22 años. Responde corto: ${text}`
          },
          {
            headers: {
              Authorization: `Bearer ${OPENAI_KEY}`,
              "Content-Type": "application/json"
            },
            timeout: 8000
          }
        );

        reply = ai.data?.output?.[0]?.content?.[0]?.text || reply;

      } catch (err) {
        console.log("OpenAI error -> usando respuesta local");
      }
    }

    await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: reply
      }
    );

    return res.sendStatus(200);

  } catch (err) {
    console.log("WEBHOOK CRASH:", err.message);
    return res.sendStatus(200);
  }

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("RUNNING"));
