import axios from 'axios';
import config from '../../config.cjs';

const gpt = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "gpt") {
    if (!text) {
      await m.reply("🤖 *Hello!*\nAsk me something to begin!");
      return;
    }

    try {
      const prompt = text;

      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'meta-llama/llama-3-8b-instruct',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            Authorization: `Bearer ${config.GROQ_API_KEY}`, // Place your Groq API key in config.cjs
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      const replyText = res.data?.choices?.[0]?.message?.content?.trim();
      if (!replyText) {
        return await m.reply("⚠️ The model did not return a valid response.");
      }

      const stylizedText = `💡 *Question:* ${prompt}\n\n🧠 *Answer:*\n${replyText}\n\n🤖 _Powered by LLaMA-3 via Groq API_`;

      await sock.sendMessage(m.from, {
        text: stylizedText,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363290715861418@newsletter"
          }
        }
      }, { quoted: m });

    } catch (err) {
      const errorMessage =
        err.response?.data?.error?.message ||
        JSON.stringify(err.response?.data) ||
        err.message ||
        "Unknown error";

      console.error("❌ GPT Error:", errorMessage);

      await m.reply(`🚫 *GPT Request Failed!*\n\n💥 *Reason:* ${errorMessage}`);
    }
  }
};

export default gpt;
