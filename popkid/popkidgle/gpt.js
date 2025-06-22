import config from '../config.cjs';
import axios from 'axios';

const gpt = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'gpt') {
    if (!text) {
      await m.React('🤖');
      return Matrix.sendMessage(m.from, {
        text: "🤖 *Hello!*\nPlease ask me something like:\n\n.gpt What is AI?",
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

    await m.React('💭');

    try {
      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama3-70b-8192', // Or 'meta-llama/llama-4-scout-17b-16e-instruct' if verified working
          messages: [{ role: 'user', content: text }],
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            Authorization: `Bearer ${config.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          },
          timeout: 20000
        }
      );

      const replyText = res.data?.choices?.[0]?.message?.content?.trim();

      if (!replyText) {
        await m.React('⚠️');
        return Matrix.sendMessage(m.from, {
          text: "⚠️ I didn’t receive a valid response. Try again with a better prompt.",
          quoted: m
        });
      }

      await m.React('✅');

      await Matrix.sendMessage(m.from, {
        text: `💡 *GPT Response:*\n\n${replyText}`,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          externalAdReply: {
            title: "GPT - Popkid AI",
            body: "🤖 Powered by LLaMA via Groq",
            thumbnailUrl: "https://i.ibb.co/NymxRZH/ai-icon.png",
            mediaType: 1,
            sourceUrl: "https://groq.com",
            renderLargerThumbnail: true
          },
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363290715861418@newsletter',
            newsletterName: "Popkid"
          }
        }
      }, { quoted: m });

    } catch (err) {
      console.error("❌ GPT Error:", err.response?.data || err.message || err);
      await m.React('❌');
      return Matrix.sendMessage(m.from, {
        text: `🚫 *GPT Request Failed!*\n\n💥 *Reason:* ${err.response?.data?.error?.message || err.message || 'Unknown error.'}`,
        quoted: m
      });
    }
  }
};

export default gpt;
