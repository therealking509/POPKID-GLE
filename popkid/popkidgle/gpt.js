import axios from 'axios';
import config from '../../config.cjs';

const contextInfo = {
  forwardingScore: 999,
  isForwarded: true,
  forwardedNewsletterMessageInfo: {
    newsletterJid: '120363290715861418@newsletter',
    newsletterName: 'Popkid-GPT',
    serverMessageId: 444
  }
};

const gpt = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'gpt' || !text) return;

  try {
    const res = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: 'You are Popkid GPT, a helpful assistant inside WhatsApp.' },
          { role: 'user', content: text }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${config.GPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const replyText = res.data.choices[0].message.content;
    await Matrix.sendMessage(m.from, {
      text: `💬 *Popkid GPT Says:*\n\n${replyText}`,
      contextInfo
    }, { quoted: m });

    await Matrix.sendReaction(m.from, m.key, '🤖');
  } catch (err) {
    console.error('GPT Error:', err?.response?.data || err.message);
    await Matrix.sendMessage(m.from, {
      text: `❌ *GPT Error:* Something went wrong.\n_Check API key or limit_`,
      contextInfo
    }, { quoted: m });
  }
};

export default gpt;
