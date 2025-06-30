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

    // Step 1: Fallback search using Dreaded API (supports search & link)
    const searchApi = `https://api.dreaded.site/api/ytdl/video?query=${encodeURIComponent(text)}`;
    const searchRes = await fetch(searchApi);
    const searchData = await searchRes.json();

    if (!searchData?.status || !searchData?.result?.url) {
      await m.React('❌');
      return sock.sendMessage(m.from, { text: '😔 *No results found or invalid query.*' }, { quoted: m });
    }

    const video = searchData.result;
    const ytUrl = video.url;
    const title = video.title;
    const duration = video.duration;
    const thumbnail = video.thumbnail;

    // Step 2: Try 3 APIs for MP3 download (with fallback)
    const audioData = await getAudioFromFallbacks(ytUrl);
    if (!audioData || !audioData.url) {
      await m.React('❌');
      return sock.sendMessage(m.from, { text: `❌ *Failed to fetch audio.* Try again later.` }, { quoted: m });
    }

    const caption = `
╭─🎧 *Now Playing*
│
├ 🎵 *Title:* ${title}
├ 🕐 *Duration:* ${duration}
├ 📦 *Size:* ${audioData.size || 'Unknown'}
├ 🔗 *Source:* [YouTube](${ytUrl})
│
╰─✨ *Requested by:* @${m.sender.split('@')[0]}
`.trim();

    await sock.sendMessage(m.from, {
      image: { url: thumbnail },
      caption,
      mentions: [m.sender]
    }, { quoted: m });

    await sock.sendMessage(m.from, {
      audio: { url: audioData.url },
      mimetype: 'audio/mp4',
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: m });

    await m.React('✅');

  } catch (err) {
    console.error(err);
    await m.React('⚠️');
    await sock.sendMessage(m.from, {
      text: '🚨 *Error:* Something went wrong while processing your request.'
    }, { quoted: m });
  }
};

async function getAudioFromFallbacks(ytUrl) {
  const apis = [
    `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(ytUrl)}&apikey=gifted-md`,
    `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(ytUrl)}`,
    `https://api.dreaded.site/api/ytdl/video?query=${encodeURIComponent(ytUrl)}`
  ];

  for (let url of apis) {
    try {
      const res = await fetch(url);
      const json = await res.json();

      const audioUrl =
        json?.result?.url || json?.data?.url || json?.url || json?.result?.audio?.url;

      if (audioUrl) {
        return {
          url: audioUrl,
          size: json?.result?.size || json?.data?.size || json?.size || null
        };
      }
    } catch (e) {
      continue;
    }
  }

  return null;
}

export default play;
