import fs from 'fs';
import acrcloud from 'acrcloud';
import config from '../../config.cjs';

const acr = new acrcloud({
  host: 'identify-eu-west-1.acrcloud.com',
  access_key: '716b4ddfa557144ce0a459344fe0c2c9',
  access_secret: 'Lz75UbI8g6AzkLRQgTgHyBlaQq9YT5wonr3xhFkf'
});

const shazam = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix)
      ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
      : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['shazam', 'hansfind', 'whatmusic'];
    if (!validCommands.includes(cmd)) return;

    const quoted = m.quoted || {};
    const mime = quoted.mimetype;

    if (!quoted || (!mime?.includes('audio') && !mime?.includes('video'))) {
      return m.reply(
        `🎧 *Music ID Request*\n\n` +
        `Please quote an *audio* or *video* message to identify its music.\n\n` +
        `_Example:_\nReply to a voice note or video clip with:\n*${prefix}shazam*`
      );
    }

    const media = await quoted.download();
    const filePath = `./${Date.now()}.mp3`;
    fs.writeFileSync(filePath, media);

    await m.reply('🔍 *Identifying the track...*\nPlease wait a moment.');

    const res = await acr.identify(fs.readFileSync(filePath));
    fs.unlinkSync(filePath); // Delete temp file

    const { code, msg } = res.status;
    if (code !== 0) {
      throw new Error(msg);
    }

    const music = res.metadata.music[0];
    const {
      title,
      artists,
      album,
      genres,
      release_date
    } = music;

    const resultMessage =
      `🎶 *TRACK IDENTIFIED!*\n\n` +
      `• 📌 *Title:* ${title || 'Unknown'}\n` +
      `• 👤 *Artist:* ${artists?.map(a => a.name).join(', ') || 'Unknown'}\n` +
      `• 💿 *Album:* ${album?.name || 'Unknown'}\n` +
      `• 🎼 *Genre:* ${genres?.map(g => g.name).join(', ') || 'Unknown'}\n` +
      `• 📅 *Release:* ${release_date || 'Unknown'}\n\n` +
      `✅ _Powered by ACRCloud_`;

    await m.reply(resultMessage);
  } catch (err) {
    console.error('Shazam error:', err);
    await m.reply('⚠️ *An error occurred while identifying the music.*\n\nPlease try again with a valid audio or video.');
  }
};

export default shazam;
