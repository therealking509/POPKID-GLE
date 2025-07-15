import config from '../../config.cjs';

const setpp = async (m, sock, botNumber, isBotAdmins, isAdmins, PopkidTheCreator, mess) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'setpp') {
    const quoted = m.quoted;
    const mime = quoted?.mimetype || '';

    // Check if user replied to an image
    if (!quoted || !/image/.test(mime)) {
      return sock.sendMessage(m.from, {
        text: `*Reply to an image with caption:* ${prefix}setpp [gc]`,
      }, { quoted: m });
    }

    await m.React('🖼️');

    try {
      const mediaBuffer = await quoted.download(); // Get image buffer

      if (!mediaBuffer || mediaBuffer.length === 0) {
        return sock.sendMessage(m.from, {
          text: '❌ Failed to download image.',
        }, { quoted: m });
      }

      if (text === 'gc') {
        // Group profile picture
        if (!m.isGroup) return sock.sendMessage(m.from, { text: mess.group }, { quoted: m });
        if (!isBotAdmins) return sock.sendMessage(m.from, { text: mess.botAdmin }, { quoted: m });
        if (!isAdmins && !PopkidTheCreator) return sock.sendMessage(m.from, { text: mess.admin }, { quoted: m });

        await sock.updateProfilePicture(m.from, mediaBuffer);
        return sock.sendMessage(m.from, { text: '✅ Group profile picture updated successfully!' }, { quoted: m });

      } else {
        // Bot profile picture
        if (!PopkidTheCreator) return sock.sendMessage(m.from, { text: mess.owner }, { quoted: m });

        await sock.updateProfilePicture(botNumber, mediaBuffer);
        return sock.sendMessage(m.from, { text: '✅ Bot profile picture updated successfully!' }, { quoted: m });
      }

    } catch (err) {
      console.error('❌ Error in setpp:', err);
      return sock.sendMessage(m.from, { text: '❌ Failed to update profile picture!' }, { quoted: m });
    }
  }
};

export default setpp;
