import axios from 'axios';
import yts from 'yt-search';

const BASE_URL = 'https://noobs-api.top';

const delayTyping = async (sock, jid, text = '🎶 Fetching your media, please wait...') => {
  await sock.sendPresenceUpdate('composing', jid);
  await sock.sendMessage(jid, { text }, { ephemeralExpiration: 86400 });
};

const formatFileName = (title, format) =>
  `${title.replace(/[\\/:*?"<>|]/g, '')}.${format}`;

const buildCaption = (video, format) => {
  const type = format.toUpperCase();
  return `
╭━━━❏ *${type === 'MP3' ? '🎵 SONG DETAILS' : '🎬 VIDEO DETAILS'}*
┃
┃ 📝 *Title:* ${video.title}
┃ 👤 *Author:* ${video.author.name}
┃ ⏱️ *Duration:* ${video.timestamp}
┃ 📅 *Published:* ${video.ago}
┃ 👁️ *Views:* ${video.views.toLocaleString()}
┃ 📥 *Format:* ${type}
╰━━━❏

🤖 *Powered by Popkid GLE™*
  `.trim();
};

const handleMediaCommand = async (m, sock) => {
  const prefix = '.';
  const command = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + command.length).trim();
  const from = m.from;

  if (!text) {
    return sock.sendMessage(from, {
      text: `❗ *Usage:* \`${prefix}${command} <title>\`\n📌 *Example:* \`${prefix}${command} faded alan walker\``
    }, { quoted: m });
  }

  await delayTyping(sock, from);

  const search = await yts(text);
  const video = search.videos[0];

  if (!video) {
    return sock.sendMessage(from, {
      text: '❌ No results found. Try a different title or keyword.'
    }, { quoted: m });
  }

  const videoId = video.videoId;
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const optionsText = `
🎧 *Choose a format to download:*

1️⃣ Voice Note
2️⃣ Audio Document
3️⃣ Normal Audio
4️⃣ Video Document
5️⃣ Normal Video

💬 _Reply with a number (1-5)_
`;

  await sock.sendMessage(from, { text: optionsText }, { quoted: m });

  sock.ev.once('messages.upsert', async ({ messages }) => {
    const userReply = messages[0]?.message?.conversation?.trim();
    const formatOption = parseInt(userReply);

    if (![1, 2, 3, 4, 5].includes(formatOption)) {
      return sock.sendMessage(from, { text: '❌ Invalid option. Please send a number from 1 to 5.' }, { quoted: m });
    }

    // Default settings
    let format = 'mp3';
    let document = false;
    let ptt = false;

    switch (formatOption) {
      case 1: ptt = true; break;
      case 2: document = true; break;
      case 3: break;
      case 4: format = 'mp4'; document = true; break;
      case 5: format = 'mp4'; break;
    }

    // Choose API
    const apiUrl = format === 'mp3'
      ? `${BASE_URL}/dipto/ytDl3?link=${encodeURIComponent(videoId)}&format=mp3`
      : `https://jawad-tech.vercel.app/download/ytmp3?url=${encodeURIComponent(ytUrl)}`;

    let res, data;

    try {
      res = await axios.get(apiUrl);
      data = res.data;
    } catch (err) {
      return sock.sendMessage(from, {
        text: `❌ Failed to fetch media: ${err.message}`
      }, { quoted: m });
    }

    if (!data.downloadLink) {
      return sock.sendMessage(from, {
        text: '❌ Media link is invalid or unavailable. Try another video.'
      }, { quoted: m });
    }

    const fileName = formatFileName(video.title, format);
    const caption = buildCaption(video, format);

    await sock.sendMessage(from, {
      image: { url: video.thumbnail },
      caption
    }, { quoted: m });

    const mediaPayload = {
      mimetype: format === 'mp3' ? 'audio/mpeg' : 'video/mp4',
      [format === 'mp3' ? 'audio' : 'video']: { url: data.downloadLink },
      fileName,
      ptt,
      asDocument: document
    };

    await sock.sendMessage(from, mediaPayload, { quoted: m });
  });
};

const mediaHandler = async (m, sock) => {
  const prefix = '.';
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if ([
    'play', 'music', 'song', 'audiofile', 'mp3doc',
    'video', 'vid', 'mp4', 'movie'
  ].includes(cmd)) {
    return handleMediaCommand(m, sock);
  }
};

export const aliases = ['play', 'music', 'song', 'audiofile', 'mp3doc', 'video', 'vid', 'mp4', 'movie'];
export default mediaHandler;
