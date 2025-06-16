// 📁 File: popkidgle/paircode.js
import axios from 'axios';
import config from '../../config.cjs';

const paircode = async (m, sock) => {
  const prefix = config.PREFIX;
  const isCmd = m.body.startsWith(prefix);
  if (!isCmd) return;

  const fullCmd = m.body.slice(prefix.length).trim().split(' ');
  const cmd = fullCmd[0].toLowerCase();

  if (cmd !== 'paircode') return;

  try {
    const { data } = await axios.get('https://popkidsessgenerator.onrender.com/pair');

    if (!data || !data.code) {
      return await sock.sendMessage(m.from, {
        text: '❌ Could not fetch a pairing code. Please try again later.',
      }, { quoted: m });
    }

    const msg = `✅ *Pairing Code Generated!*\n\n🧬 *Code:* \`\`\`${data.code}\`\`\`\n\n🔗 Use this code to link your WhatsApp to the bot device.\n\n⚡ Powered by *Popkid-Xmd*`;

    await sock.sendMessage(m.from, {
      image: { url: 'https://files.catbox.moe/959dyk.jpg' },
      caption: msg,
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'Popkid-Xmd',
          newsletterJid: '120363290715861418@newsletter',
        },
      },
    }, { quoted: m });

  } catch (err) {
    console.error('[PAIRCODE ERROR]', err);
    await sock.sendMessage(m.from, {
      text: `❌ Error occurred while fetching code:\n${err.message}`,
    }, { quoted: m });
  }
};

export default paircode;
