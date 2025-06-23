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

  const waitMsg = await Matrix.sendMessage(m.from, {
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
    const res = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: text }],
      temperature: 0.8
    }, {
      headers: {
        'Authorization': `Bearer ${config.GPT_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const reply = res.data?.choices?.[0]?.message?.content?.trim();
    await Matrix.sendMessage(m.from, {
      text: `🧠 *Popkid GPT Response:*\n\n${reply}`,
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
  } catch (error) {
    console.error('GPT Error:', error?.response?.data || error.message);
    await Matrix.sendMessage(m.from, {
      text: `❌ *GPT Error:* Something went wrong.\n_Check API key or limit_`,
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
