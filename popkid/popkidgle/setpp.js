import config from '../../config.cjs';
import fs from 'fs';
import util from 'util';
import fetch from 'node-fetch';
import { CatboxUrl } from '../lib/uploader.js'; // ✅ Adjust path if needed

const setpp = async (m, sock, botNumber, isBotAdmins, isAdmins, PopkidTheCreator, mess) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'setpp') {
    const quoted = m.quoted;
    const mime = quoted?.mimetype || '';

    if (!quoted || !/image/.test(mime)) {
      return sock.sendMessage(m.from, {
        text: `*Reply to an image with caption:* ${prefix}setpp [gc]`,
      }, { quoted: m });
    }

    await m.React('🖼️');

    let mediaPath;

    try {
      // Step 1: Download and save the image locally
      mediaPath = await sock.downloadAndSaveMediaMessage(quoted);

      // Step 2: Upload to Catbox
      const url = await CatboxUrl(mediaPath);
      const imageUrl = util.format(url);

      // Step 3: Fetch the image buffer from the public URL
      const imageBuffer = await (await fetch(imageUrl)).buffer();

      // Step 4: Update group or bot profile picture
      if (text === 'gc') {
        if (!m.isGroup) return sock.sendMessage(m.from, { text: mess.group }, { quoted: m });
        if (!isBotAdmins) return sock.sendMessage(m.from, { text: mess.botAdmin }, { quoted: m });
        if (!isAdmins && !PopkidTheCreator) return sock.sendMessage(m.from, { text: mess.admin }, { quoted: m });

        await sock.updateProfilePicture(m.from, imageBuffer);
        return sock.sendMessage(m.from, { text: '✅ Group profile picture updated successfully!' }, { quoted: m });

      } else {
        if (!PopkidTheCreator) return sock.sendMessage(m.from, { text: mess.owner }, { quoted: m });

        await sock.updateProfilePicture(botNumber, imageBuffer);
        return sock.sendMessage(m.from, { text: '✅ Bot profile picture updated successfully!' }, { quoted: m });
      }

    } catch (err) {
      console.error('❌ Error in setpp (Catbox):', err);
      return sock.sendMessage(m.from, { text: '❌ Failed to update profile picture!' }, { quoted: m });
    } finally {
      // Clean up the downloaded file
      if (mediaPath && fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }
  }
};

export default setpp;
