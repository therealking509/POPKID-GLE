// 📁 File: popkidgle/paircode.js import axios from 'axios'; import config from '../../config.cjs';

const pairCode = async (m, sock) => { const prefix = config.PREFIX; const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : ''; const text = m.body.slice(prefix.length + cmd.length).trim(); const senderName = m.pushName || 'User';

if (!text || !text.startsWith('+') || text.length < 8) { return await sock.sendMessage(m.from, { text: ✳️ *Enter your number correctly!\nUsage:* \n${prefix}paircode +254712345678, contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterName: 'Popkid-Xmd', newsletterJid: '120363290715861418@newsletter' } } }, { quoted: m }); }

try { const response = await axios.get(https://popkidsessgenerator.onrender.com/pair?number=${encodeURIComponent(text)});

if (!response.data || !response.data.code) {
  throw new Error('No pair code returned');
}

const result = `✅ *Pair Code Generated!*

📱 Number: ${text} 🔐 Code: ${response.data.code}

📎 Scan this code on the bot to pair it.`;

await sock.sendMessage(m.from, {
  image: { url: 'https://files.catbox.moe/959dyk.jpg' },
  caption: result,
  contextInfo: {
    forwardingScore: 5,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterName: 'Popkid-Xmd',
      newsletterJid: '120363290715861418@newsletter'
    }
  }
}, { quoted: m });

} catch (err) { await sock.sendMessage(m.from, { text: ❌ *Failed to get pair code. Try again later.*, contextInfo: { forwardingScore: 999, isForwarded: true, forwardedNewsletterMessageInfo: { newsletterName: 'Popkid-Xmd', newsletterJid: '120363290715861418@newsletter' } } }, { quoted: m }); } };

export default pairCode;

