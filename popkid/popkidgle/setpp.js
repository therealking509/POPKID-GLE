import config from '../../config.cjs';
import fs from 'fs';

const setpp = async (m, sock, botNumber, isBotAdmins, isAdmins, PopkidTheCreator, mess) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();
  const quoted = m.quoted;
  const mime = quoted?.mimetype || '';

  if (cmd === 'setpp') {
    if (!quoted || !/image/.test(mime)) {
      return sock.sendMessage(m.from, {
        text: `*Reply to an image with caption:* ${prefix}setpp [gc]`,
      }, { quoted: m });
    }

    await m.React('🖼️');

    try {
      const mediaBuffer = await quoted.download();

      if (text === 'gc') {
        if (!m.isGroup) return sock.sendMessage(m.from, { text: mess.group }, { quoted: m });
        if (!isBotAdmins) return sock.sendMessage(m.from, { text: mess.botAdmin }, { quoted: m });
        if (!isAdmins && !PopkidTheCreator) return sock.sendMessage(m.from, { text: mess.admin }, { quoted: m });

        await sock.updateProfilePicture(m.from, mediaBuffer);
        await sock.sendMessage(m.from, { text: '✅ Group profile picture updated successfully!' }, { quoted: m });

      } else {
        if (!PopkidTheCreator) return sock.sendMessage(m.from, { text: mess.owner }, { quoted: m });

        await sock.updateProfilePicture(botNumber, mediaBuffer);
        await sock.sendMessage(m.from, { text: '✅ Bot profile picture updated successfully!' }, { quoted: m });
      }

    } catch (err) {
      console.error(err);
      sock.sendMessage(m.from, { text: '❌ Failed to update profile picture!' }, { quoted: m });
    }
  }
};

export default setpp;
