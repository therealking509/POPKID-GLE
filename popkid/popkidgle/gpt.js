import axios from 'axios';
import config from '../../config.cjs';

const gpt = async (m, sock) => {
  const prefix = config.PREFIX || '.';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'gpt') return;
  if (!text) return m.reply('💡 *Usage:* .gpt your question here');

  await m.react('🤖');

  try {
    const { data } = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [{ role: 'user', content: text }],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.GPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = data.choices?.[0]?.message?.content?.trim() || '🤖 No response.';

    await sock.sendMessage(m.from, {
      text: `🧠 *LLaMA 4 Response:*\n\n${reply}`,
      contextInfo: {
        externalAdReply: {
          title: 'Popkid GPT Assistant',
          body: 'Powered by LLaMA 4 via Groq',
          thumbnailUrl: 'https://telegra.ph/file/36f0d1a2a5f54d372adad.jpg',
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true,
          sourceUrl: 'https://console.groq.com',
        },
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd',
          serverMessageId: m.id,
        },
      },
    }, { quoted: m });

  } catch (error) {
    console.error('❌ GPT Error:', error?.response?.data || error.message);
    await sock.sendMessage(m.from, {
      text: '❌ GPT request failed. Please try again later.',
    }, { quoted: m });
  }
};

export default gpt;
