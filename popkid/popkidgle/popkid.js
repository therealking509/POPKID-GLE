import axios from 'axios';
import yts from 'yt-search';

const BASE_URL = 'https://noobs-api.top';

const delayTyping = async (sock, jid, text = '🎶 𝙋𝙊𝙋𝙆𝙄𝘿 𝙓𝘿 𝙄𝙎 𝙊𝙉 𝙄𝙏...') => {
  await sock.sendPresenceUpdate('composing', jid);
  await sock.sendMessage(jid, { text }, { ephemeralExpiration: 86400 });
};

const sendUsage = (sock, from, command, m) => {
  return sock.sendMessage(from, {
    text: `❗ *Usage:* \`.${command} <song/video>\`\n💡 *Example:* \`.${command} calm down remix\``
  }, { quoted: m });
};

const sendError = async (sock, from, error, m) => {
  console.error(`[POP🔴ERROR]:`, error.message);
  return sock.sendMessage(from, {
    text: `🚨 *Error:* \`${error.message}\`\nTry again or use another keyword.`
  }, { quoted: m });
};

const handleMediaCommand = async (m, sock, format = 'mp3') => {
  const prefix = '.';
  const command = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + command.length).trim();
  const from = m.from;

  if (!text) return sendUsage(sock, from, command, m);

  try {
    await delayTyping(sock, from);

    const search = await yts(text);
    const video = search.videos[0];

    if (!video) {
      return sock.sendMessage(from, {
        text: '😔 No results found. Try another keyword.'
      }, { quoted: m });
    }

    const ytUrl = `https://www.youtube.com/watch?v=${video.videoId}`;
    const apiUrl = format === 'mp3'
      ? `${BASE_URL}/dipto/ytDl3?link=${video.videoId}&format=mp3`
      : `https://jawad-tech.vercel.app/download/ytmp3?url=${encodeURIComponent(ytUrl)}`;

    const { data } = await axios.get(apiUrl);

    if (!data.downloadLink) {
      return sock.sendMessage(from, {
        text: '❌ Failed to generate download link. API may be offline.'
      }, { quoted: m });
    }

    const caption = `
╭━━🎧 𝙋𝙊𝙋𝙆𝙄𝘿 𝙓𝘿 𝙈𝙀𝘿𝙄𝘼 ━━╮
┃ 🔊 *${format.toUpperCase()} Request Ready!*
┃
┃ 🎵 *Title:* ${video.title}
┃ 👤 *Author:* ${video.author.name}
┃ ⏱️ *Duration:* ${video.timestamp}
┃ 📅 *Published:* ${video.ago}
┃ 👁️ *Views:* ${video.views.toLocaleString()}
┃ 🔗 *Link:* ${ytUrl}
┃ 📥 *Format:* ${format.toUpperCase()}
╰━━━━━━━━━━━━━━━━━━━━╯
⚡ Powered by *POPᴋID GLE V2*
    `.trim();

    await sock.sendMessage(from, {
      image: { url: video.thumbnail },
      caption,
    }, { quoted: m });

    const fileName = `${video.title.replace(/[\\/:*?"<>|]/g, '')}.${format}`;

    await sock.sendMessage(from, {
      [format === 'mp3' ? 'audio' : 'video']: { url: data.downloadLink },
      mimetype: format === 'mp3' ? 'audio/mpeg' : 'video/mp4',
      fileName
    }, { quoted: m });

  } catch (err) {
    return sendError(sock, from, err, m);
  }
};

const mediaHandler = async (m, sock) => {
  const prefix = '.';
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  switch (cmd) {
    case 'play':
    case 'music':
    case 'song':
    case 'audiofile':
    case 'mp3doc':
      return handleMediaCommand(m, sock, 'mp3');

    case 'video':
    case 'vid':
    case 'mp4':
    case 'movie':
      return handleMediaCommand(m, sock, 'mp4');
  }
};

export const aliases = [
  'play', 'music', 'song', 'audiofile', 'mp3doc',
  'video', 'vid', 'mp4', 'movie'
];
export default mediaHandler;
