import axios from 'axios';
import fs from 'fs';
import path from 'path';
import config from '../../config.cjs';

const play = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== "play3") return;

  if (!text) {
    return await sock.sendMessage(m.from, {
      text: `❌ *Please provide a song name!*\n\nExample:\n${prefix}play calm down`
    }, { quoted: m });
  }

  await m.React("🎶");

  try {
    const apiKey = 'ec32bfa1c6b8ff81a636877b6ba302c8'; // public free key
    const url = `https://api.lolhuman.xyz/api/ytplay2?apikey=${apiKey}&query=${encodeURIComponent(text)}`;

    const res = await axios.get(url);
    const result = res.data.result;

    const title = result.title;
    const thumbnail = result.thumbnail;
    const duration = result.duration;
    const filesize = result.audio.size;
    const audioUrl = result.audio.link;

    // 🎨 Styled caption
    const caption = `🎧 *Popkid GLE Player*\n\n` +
                    `🎵 *Title:* ${title}\n` +
                    `⏱️ *Duration:* ${duration}\n` +
                    `📦 *Size:* ${filesize}\n\n` +
                    `🔁 Downloading...`;

    // Preview card first
    await sock.sendMessage(m.from, {
      image: { url: thumbnail },
      caption,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: "Popkid GLE • Music Player 🎵",
          body: title,
          thumbnailUrl: thumbnail,
          sourceUrl: result.link,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: m });

    // Download MP3
    const audioRes = await axios.get(audioUrl, { responseType: 'arraybuffer' });
    const filename = `./tmp/${title}.mp3`;

    fs.writeFileSync(filename, audioRes.data);

    // Send as audio
    await sock.sendMessage(m.from, {
      audio: fs.readFileSync(filename),
      mimetype: 'audio/mp4',
      fileName: `${title}.mp3`,
      ptt: false // Change to true if you want voice-note style
    }, { quoted: m });

    fs.unlinkSync(filename); // Clean up

  } catch (err) {
    console.error("Play Error:", err);
    await sock.sendMessage(m.from, {
      text: `❌ *Failed to fetch or send audio.*\n_Reason:_ ${err.message || 'Something went wrong'}`
    }, { quoted: m });
  }
};

export default play;
