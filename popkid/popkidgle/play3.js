import fetch from 'node-fetch';
import config from '../../config.cjs';

const apis = {
  cyril: (query) => `https://apis.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(query)}&apikey=gifted-md`,
  dark: (query) => `https://www.dark-yasiya-api.site/download/ytmp3?url=${encodeURIComponent(query)}`,
  dreaded: (query) => `https://api.dreaded.site/api/ytdl/video?query=${encodeURIComponent(query)}`
};

const play = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== "play") return;

  if (!text) {
    return sock.sendMessage(m.from, {
      text: `❗ *Usage:* \`${prefix}play <song name or YouTube URL>\`\n_Example:_\n\`${prefix}play calm down\``
    }, { quoted: m });
  }

  await m.React('🔍');

  try {
    const result = await searchFromAllApis(text);

    if (!result || !result.audio) {
      await m.React('❌');
      return sock.sendMessage(m.from, { text: '❌ *No working audio found.*' }, { quoted: m });
    }

    const { title, duration, thumbnail, url: ytUrl, audio, size } = result;

    const caption = `
╭─🎧 *Now Playing*
│
├ 🎵 *Title:* ${title}
├ 🕐 *Duration:* ${duration}
├ 📦 *Size:* ${size || 'Unknown'}
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
      audio: { url: audio },
      mimetype: 'audio/mp4',
      fileName: `${title}.mp3`,
      ptt: false
    }, { quoted: m });

    await m.React('✅');

  } catch (e) {
    console.error(e);
    await m.React('⚠️');
    await sock.sendMessage(m.from, { text: '🚨 *Error occurred. Try again later.*' }, { quoted: m });
  }
};

async function searchFromAllApis(query) {
  const apiList = Object.entries(apis);

  for (const [key, buildUrl] of apiList) {
    try {
      const url = buildUrl(query);
      const res = await fetch(url);
      const json = await res.json();

      const result = extractResult(json);

      if (result?.audio) {
        return {
          title: result.title || 'Unknown Title',
          duration: result.duration || 'N/A',
          thumbnail: result.thumbnail || null,
          url: result.url || query,
          audio: result.audio,
          size: result.size || 'Unknown'
        };
      }
    } catch (err) {
      continue; // Try next API
    }
  }

  return null;
}

function extractResult(data) {
  if (!data) return null;

  // Try common structures
  const audio =
    data.result?.audio?.url || data.data?.url || data.result?.url || data.url;

  return {
    audio,
    title: data.result?.title || data.data?.title,
    thumbnail: data.result?.thumbnail || data.data?.thumbnail,
    duration: data.result?.duration || data.data?.duration,
    size: data.result?.size || data.data?.size,
    url: data.result?.url || data.data?.url
  };
}

export default play;
