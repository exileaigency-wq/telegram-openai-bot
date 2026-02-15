import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("ok");
});

app.post("/webhook", async (req, res) => {

  // Telegram SIEMPRE debe recibir 200 rápido
  res.sendStatus(200);

  try {
    const msg = req.body?.message;
    if (!msg) return;

    const chatId = msg.chat.id;
    const text = msg.text || "hola";

    let reply = "hola 👋";

    // ====== OpenAI ======
    try {
      const ai = await axios.post(
        "https://api.openai.com/v1/responses",
        {
          model: "gpt-4.1-mini",
          input: [
            { role: "system", content: "Eres Monse, influencer mexicana de 22 años, coqueta y natural." },
            { role: "user", content: text }
          ]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      reply = ai.data?.output?.[0]?.content?.[0]?.text || reply;

    } catch (e) {
      console.log("OpenAI fallo");
    }

    // ====== Telegram reply ======
    await axios.post(
      `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
      {
        chat_id: chatId,
        text: reply
      }
    );

  } catch (err) {
    console.log("Webhook error:", err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("running"));
