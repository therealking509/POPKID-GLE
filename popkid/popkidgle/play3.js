import axios from 'axios';
import yts from 'yt-search';

const play2 = async (m, Matrix) => {
  const prefix = '.';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/);
  const query = args.join(' ');

  if (cmd !== 'play2') return;
  if (!query) return m.reply('*🎧 Usage:* .play2 Song name or title');

  await m.react('🎶');

  try {
    const search = await yts(query);
    const video = search.videos[0];
    if (!video) return m.reply('❌ No video found.');

    const { data } = await axios.get('https://api.yogik.id/downloader/youtube', {
      params: { url: video.url, format: 'audio' },
      headers: { Accept: 'application/json' }
    });

    const result = data.result;
    if (!result || !result.download_url) return m.reply('❌ Failed to get audio download URL.');

    await Matrix.sendMessage(m.from, {
      audio: { url: result.download_url },
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: result.title || video.title,
          body: result.author_name || video.author.name,
          thumbnailUrl: result.thumbnail_url || video.thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: video.url,
          showAdAttribution: true
        },
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd',
          serverMessageId: m.id
        }
      }
    }, { quoted: m });

  } catch (err) {
    console.error('❌ play2 error:', err);
    await Matrix.sendMessage(m.from, {
      text: '❌ Error fetching or sending audio.',
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363290715861418@newsletter',
          newsletterName: 'Popkid-Xmd',
          serverMessageId: m.id
        }
      }
    }, { quoted: m });
  }
};

export default play2;
