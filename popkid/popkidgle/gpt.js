import axios from 'axios';
import config from '../../config.cjs';

const gpt = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const isCmd = body.startsWith(prefix);
  const cmd = isCmd ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = body.slice(prefix.length + cmd.length).trim();

  if (cmd === "gpt") {
    await sock.sendMessage(m.from, { react: { text: "🤖", key: m.key } });

    const start = new Date().getTime();
    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const uptime = `${hours}h ${minutes}m ${seconds}s`;

    if (!text) {
      return await sock.sendMessage(m.from, {
        text: `❓ *Please provide a question!*\nExample:\n*.gpt What is Artificial Intelligence?*`,
      }, { quoted: m });
    }

    try {
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'meta-llama/llama-4-scout-17b-16e-instruct',
          messages: [{ role: 'user', content: text }],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': 'Bearer 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',
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const end = new Date().getTime();
      const speed = ((end - start) / 1000).toFixed(2);
      const answer = response.data?.choices?.[0]?.message?.content?.trim();

      if (!answer) {
        return await sock.sendMessage(m.from, {
          text: `⚠️ I couldn't generate a valid response.`,
        }, { quoted: m });
      }

      await sock.sendMessage(m.from, {
        image: { url: 'https://i.ibb.co/NymxRZH/ai-icon.png' },
        caption:
`╭───────────────⭓
│ 🤖 𝘽𝙤𝙩: *Popkid-XD*
│ ⏱️ 𝙐𝙥𝙩𝙞𝙢𝙚: ${uptime}
│ ⚡ 𝙎𝙥𝙚𝙚𝙙: ${speed}s
│ 💬 𝙌𝙪𝙚𝙨𝙩𝙞𝙤𝙣: *${text}*
╰───────────────⭓

🧠 *Answer:*
${answer}

━━━━━━━━━━━━━━━━━━
🤖 *Powered by LLaMA 4 Scout via Groq*
━━━━━━━━━━━━━━━━━━`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "LLaMA GPT Response",
            body: "Ask anything using .gpt",
            thumbnailUrl: "https://i.ibb.co/NymxRZH/ai-icon.png",
            sourceUrl: "https://groq.com",
            mediaType: 1,
            renderLargerThumbnail: true
          },
          forwardedNewsletterMessageInfo: {
            newsletterName: "Popkid-Xmd",
            newsletterJid: "120363290715861418@newsletter"
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.error("GPT Error:", err.message);
      return await sock.sendMessage(m.from, {
        text: "🚫 Sorry, there was an error getting the GPT response. Please try again later.",
      }, { quoted: m });
    }
  }
};

export default gpt;
