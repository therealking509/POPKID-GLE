import config from '../../config.cjs';
import path from 'path';
import fs from 'fs';

const ownerContact = async (m, sock) => {
  const ownerNumber = config.OWNER_NUMBER;
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'owner') {
    try {
      const newsletterJid = '120363290715861418@newsletter';
      const newsletterName = 'Popkid-Xmd';

      // Newsletter image as preview
      const profilePictureUrl = await sock.profilePictureUrl(newsletterJid, 'image').catch(() =>
        'https://telegra.ph/file/265c672c09b5c9be6c3af.jpg'
      );

      const captionText = `
╭───〔 👑 *BOT OWNER* 〕───⬣
┃ 👤 *Name:* ${config.OWNER_NAME || 'Popkid'}
┃ 📞 *Contact:* wa.me/${ownerNumber}
┃ 🌐 *GitHub:* github.com/${config.GITHUB || 'popkid-xmd'}
╰──────────────⬣`.trim();

      // Send newsletter-style profile image + info
      await sock.sendMessage(m.from, {
        image: { url: profilePictureUrl },
        caption: captionText,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName,
            newsletterJid,
          },
        },
      }, { quoted: m });

      // Send vCard contact
      const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${config.OWNER_NAME || 'Popkid'}
TEL;type=CELL;type=VOICE;waid=${ownerNumber}:${ownerNumber}
END:VCARD`;

      await sock.sendMessage(m.from, {
        contacts: {
          displayName: config.OWNER_NAME || 'Popkid',
          contacts: [{ vcard }],
        },
      }, { quoted: m });

      // Path to your local song file (must be present in your bot folder)
      const songPath = path.join('mydata', 'owner-theme.mp3'); // Ensure this file exists

      if (fs.existsSync(songPath)) {
        await sock.sendMessage(m.from, {
          audio: fs.readFileSync(songPath),
          mimetype: 'audio/mp4',
          ptt: false, // true if you want it to appear like a voice note
        }, { quoted: m });
      } else {
        console.warn('⚠️ Song file not found:', songPath);
      }

      await m.react('🎵');
    } catch (error) {
      console.error('❌ Error in owner command:', error);
      await m.reply('❌ *Could not send owner info. Try again later.*');
      await m.react('❌');
    }
  }
};

export default ownerContact;
