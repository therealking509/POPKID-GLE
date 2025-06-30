import config from '../../config.cjs';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const play = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== "play3") return;

  if (!text || (!text.includes("youtube.com") && !text.includes("youtu.be"))) {
    return await sock.sendMessage(m.from, {
      text: `❌ *Please provide a valid YouTube link!*\n\nExample:\n${prefix}play3 https://youtu.be/xxxxxxx`
    }, { quoted: m });
  }

  await m.React("🎧");

  try {
    const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${encodeURIComponent(text)}`;
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (!data.success || !data.data?.url) {
      return await sock.sendMessage(m.from, {
        text: `❌ *Failed to download audio!*\n_Reason:_ ${data.message || "Invalid response"}`
      }, { quoted: m });
    }

    const { title, url, thumbnail, duration } = data.data;
    const safeTitle = title.replace(/[<>:"/\\|?*]+/g, '').slice(0, 50);
    const filePath = `./tmp/${safeTitle}.mp3`;

    // Preview card
    const caption = `╭───〘 🎧 *Popkid GLE Player* 〙───◆
│ 🎵 *Title:* ${title}
│ ⏱️ *Duration:* ${duration || 'N/A'}
╰───────────────────────────╮
   🔁 *Downloading audio...*
╰───────────────────────────╯`;

    await sock.sendMessage(m.from, {
      image: { url: thumbnail },
      caption,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: "Popkid GLE • Music Stream 🎶",
          body: title,
          thumbnailUrl: thumbnail,
          sourceUrl: text,
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: m });

    // Download & save audio
    const buffer = await fetch(url).then(res => res.arrayBuffer());
    fs.writeFileSync(filePath, Buffer.from(buffer));

    // Send MP3
    await sock.sendMessage(m.from, {
      audio: fs.readFileSync(filePath),
      mimetype: 'audio/mp4',
      fileName: `${safeTitle}.mp3`,
      ptt: false
    }, { quoted: m });

    fs.unlinkSync(filePath);

  } catch (err) {
    console.error("Play3 Error:", err);
    await sock.sendMessage(m.from, {
      text: `❌ *An error occurred while fetching the audio.*\n_Reason:_ ${err.message || 'Unknown error'}`
    }, { quoted: m });
  }
};

export default play;
