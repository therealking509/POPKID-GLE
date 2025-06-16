import axios from 'axios';
import config from '../../config.cjs';

const paircode = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd !== 'paircode') return;

  const args = body.trim().split(' ').slice(1);
  const number = args[0];

  if (!number) {
    return await sock.sendMessage(m.from, {
      text: '*⚠️ Please provide a number to pair.*\n\nExample:\n.paircode +254712345678',
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid-Xmd",
          newsletterJid: "120363290715861418@newsletter",
        }
      }
    }, { quoted: m });
  }

  try {
    const res = await axios.get(`https://prikinpopkif.onrender.com/pair?number=${encodeURIComponent(number)}`);
    const data = res.data;

    if (!data || !data.pairing_code) {
      throw new Error('Invalid response from session generator.');
    }

    const caption = `👤 *Number:* ${number}\n🔐 *Pairing Code:* \`${data.pairing_code}\`\n\n✅ Use this to login to your WhatsApp bot securely.`;

    await sock.sendMessage(m.from, {
      image: { url: 'https://files.catbox.moe/959dyk.jpg' },
      caption,
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid-Xmd",
          newsletterJid: "120363290715861418@newsletter",
        }
      }
    }, { quoted: m });

  } catch (err) {
    await sock.sendMessage(m.from, {
      text: `❌ *Failed to generate pairing code.*\n\nReason: ${err.message}`,
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid-Xmd",
          newsletterJid: "120363290715861418@newsletter",
        }
      }
    }, { quoted: m });
  }
};

export default paircode;
