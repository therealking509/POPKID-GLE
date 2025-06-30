import fetch from 'node-fetch';
import config from '../../config.cjs';

const play = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== "play3") return;

  if (!text) {
    return sock.sendMessage(m.from, {
      text: `❗ *Usage:* \`${prefix}play <song name or YouTube URL>\`\n\n_Example:_\n\`${prefix}play calm down\``
    }, { quoted: m });
  }

  try {
    await m.React('🔍');

    // 🔎 Step 1: Search YouTube
    const searchApi = `https://api.vreden.my.id/api/ytsearch?query=${encodeURIComponent(text)}`;
    const searchResponse = await fetch(searchApi);
    const searchData = await searchResponse.json();

    if (!searchData?.data?.length) {
      await m.React('❌');
      return sock.sendMessage(m.from, {
        text: `😢 *No results found for:* \`${text}\`\n_Refine your search and try again._`
      }, { quoted: m });
    }

    const video = searchData.data[0];

    await m.React('🎶');

    // 🎧 Step 2: Download MP3
    const downloadApi = `https://api.vreden.my.id/api/ytmp3?url=${video.url}`;
    const downloadResponse = await fetch(downloadApi);
    const downloadData = await downloadResponse.json();

    if (!downloadData?.data?.url) {
      await m.React('❌');
      return sock.sendMessage(m.from, {
        text: `❌ *Couldn’t fetch audio.* Try again later or use a different song.`
      }, { quoted: m });
    }

    const { title, url: ytUrl, thumbnail, duration } = video;
    const { url: mp3Url, size } = downloadData.data;

    // 🪄 Step 3: Send song card with metadata
    const caption = `
╭───❏ *🎧 Now Playing*
│
├ 🎵 *Title:* ${title}
├ 🕐 *Duration:* ${duration}
├ 📦 *Size:* ${size}
├ 🔗 *Link:* [YouTube](${ytUrl})
│
╰─✨ *Requested by:* @${m.sender.split('@')[0]}
    `.trim();

    await sock.sendMessage(m.from, {
      image: { url: thumbnail },
      caption,
      mentions: [m.sender]
    }, { quoted: m });

    // 🎼 Step 4: Send audio file
    await sock.sendMessage(m.from, {
      audio: { url: mp3Url },
      mimetype: 'audio/mp4',
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: m });

    await m.React('✅');

  } catch (err) {
    console.error(err);
    await m.React('⚠️');
    await sock.sendMessage(m.from, {
      text: `🚨 *Error:* Something went wrong while processing your request.\nPlease try again.`
    }, { quoted: m });
  }
};

export default play;
