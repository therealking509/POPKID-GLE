import config from '../../config.cjs';
import axios from 'axios';

const gpt = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "gpt") {
    try {
      if (!text) {
        return await m.reply("🤖 *Hi there!*\nPlease ask me a question.\n_Example: .gpt What is AI?_");
      }

      await m.react('🤖');

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'meta-llama/llama-3-8b-instruct',
          messages: [{ role: 'user', content: text }],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer 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`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const replyText = response.data?.choices?.[0]?.message?.content?.trim();

      if (!replyText) {
        return await m.reply("⚠️ GPT responded with an empty reply.");
      }

      const caption = `
╭───〔 🤖 *GPT Response* 〕───⬣
│ 📥 *Your Question:* 
│ ${text}
│ 
│ 📤 *Popkid Says:*
│ ${replyText}
╰─────────────⭓
🌐 _Model: LLaMA 3 via Groq_
`.trim();

      await sock.sendMessage(m.from, {
        image: { url: "https://telegra.ph/file/4a64bb0d650d46c319e60.jpg" }, // You can change the banner
        caption,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "Ask Popkid AI 🤖",
            body: "Powered by Groq • LLaMA 3",
            mediaType: 1,
            thumbnailUrl: "https://telegra.ph/file/4a64bb0d650d46c319e60.jpg",
            mediaUrl: "https://popkid.tech", // Optional site
            sourceUrl: "https://popkid.tech"
          },
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363290715861418@newsletter"
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.error("❌ GPT Error:", err.message);
      await m.reply(`🚫 *Error fetching GPT reply!*\n\n💥 *Reason:* ${err.message}`);
    }
  }
};

export default gpt;
