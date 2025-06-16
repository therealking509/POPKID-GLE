// 📁 File: popkidgle/personality.js import config from '../../config.cjs';

const personality = async (m, sock) => { const prefix = config.PREFIX; const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : ''; const senderName = m.pushName || 'User';

if (cmd === 'love') { const msg = ❤️ *Hey ${senderName}*, Here's a little love for you 💕 Stay amazing!;

await sock.sendMessage(m.from, {
  image: { url: 'https://i.ibb.co/nQtD5MP/love.jpg' },
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

}

if (cmd === 'goodmorning') { const msg = 🌞 *Good Morning, ${senderName}!* Wishing you a fresh start and good vibes today.;

await sock.sendMessage(m.from, {
  image: { url: 'https://i.ibb.co/MhsXjDR/gm.jpg' },
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

}

if (cmd === 'goodnight') { const msg = 🌙 *Good Night, ${senderName}!* Sweet dreams and peaceful rest.;

await sock.sendMessage(m.from, {
  image: { url: 'https://i.ibb.co/hBnpVbG/gn.jpg' },
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

} };

export default personality;

