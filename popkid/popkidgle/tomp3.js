import { toAudio } from '../lib/converter.cjs';
import config from '../config.cjs';

const tomp3 = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const validCommands = ['tomp3', 'mp3'];
    if (!validCommands.includes(cmd)) return;

    if (!m.quoted || m.quoted.mtype !== 'videoMessage') {
      return m.reply(`Reply to a video with *${prefix}${cmd}* to convert it to MP3.`);
    }

    m.reply('🔄 Converting to MP3, please wait...');
    console.log('[INFO] Downloading video...');
    const media = await m.quoted.download();

    console.log('[INFO] Converting to MP3...');
    const audio = await toAudio(media, 'mp4');

    await gss.sendMessage(
      m.from,
      {
        document: audio,
        mimetype: 'audio/mpeg',
        fileName: `Converted By ${gss.user?.name || 'Bot'}.mp3`,
      },
      { quoted: m }
    );
    console.log('[INFO] MP3 sent successfully.');
  } catch (err) {
    console.error('[ERROR]', err);
    m.reply('❌ Failed to convert video to MP3. Please try again.');
  }
};

export default tomp3;
