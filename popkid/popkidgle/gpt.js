const axios = require('axios');
const config = require('../config.cjs');

const gpt = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const prompt = m.body.slice(prefix.length + cmd.length + 1);

  if (cmd === 'gpt') {
    const reactionEmojis = ['🤖', '💡', '🚀', '📚'];
    const textEmojis = ['🔍', '✨', '🧠', '📖'];

    const reactionEmoji = reactionEmojis[Math.floor(Math.random() * reactionEmojis.length)];
    let textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
    while (textEmoji === reactionEmoji) {
      textEmoji = textEmojis[Math.floor(Math.random() * textEmojis.length)];
    }

    await m.React(reactionEmoji);

    if (!prompt) {
      return await Matrix.sendMessage(m.from, {
        text: `${textEmoji} *Ask me anything!*\n\nExample:\n${prefix}gpt What is the future of AI?`,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363290715861418@newsletter',
            newsletterName: "Popkid"
          }
        }
      }, { quoted: m });
    }

    try {
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-70b-8192',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            Authorization: `Bearer ${config.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const replyText = res.data?.choices?.[0]?.message?.content?.trim();

      if (!replyText) {
        return await Matrix.sendMessage(m.from, {
          text: "⚠️ GPT gave no response. Try again with a different prompt.",
          quoted: m
        });
      }

      await Matrix.sendMessage(m.from, {
        text: `${textEmoji} *GPT Response:*\n\n${replyText}`,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "GPT - Popkid AI",
            body: "🤖 Powered by LLaMA3 via Groq",
            mediaType: 1,
            thumbnailUrl: "https://i.ibb.co/NymxRZH/ai-icon.png",
            sourceUrl: "https://groq.com",
            renderLargerThumbnail: true
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363290715861418@newsletter',
            newsletterName: "Popkid"
          }
        }
      }, { quoted: m });

    } catch (error) {
      console.error("❌ GPT Error:", error?.response?.data || error.message);
      return await Matrix.sendMessage(m.from, {
        text: `🚫 *GPT Request Failed!*\n\n💥 *Reason:* ${error?.response?.data?.error?.message || error.message}`,
        quoted: m
      });
    }
  }
};

module.exports = gpt;
