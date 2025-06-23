import axios from 'axios';
import config from '../../config.cjs';

const askgpt = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'gpt') return;

  if (!text) {
    return await Matrix.sendMessage(m.from, {
      text: `💡 *Usage:* \n${prefix}askgpt What is the meaning of life?`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd',
          serverMessageId: 45
        }
      }
    }, { quoted: m });
  }

  const thinking = await Matrix.sendMessage(m.from, {
    text: `🤖 *Popkid GPT is thinking...*`,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363290715861418@newsletter',
        newsletterName: 'Popkid-Xmd',
        serverMessageId: 45
      }
    }
  }, { quoted: m });

  try {
    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'mistral-saba-24b',
      messages: [{ role: 'user', content: text }],
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${config.GPT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const replyText = response.data?.choices?.[0]?.message?.content?.trim();

    if (!replyText) throw new Error('No response from GPT');

    await Matrix.sendMessage(m.from, {
      text: `🧠 *Popkid GPT says:*\n\n${replyText}`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd',
          serverMessageId: 45
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error('❌ GPT API Error:', err?.response?.data || err.message);
    await Matrix.sendMessage(m.from, {
      text: `❌ *Error using GPT:*\n${err?.response?.data?.error?.message || err.message}`,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd',
          serverMessageId: 45
        }
      }
    }, { quoted: m });
  }
};

export default askgpt;
