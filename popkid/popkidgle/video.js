import axios from 'axios';
import ytSearch from 'yt-search';
import config from '../../config.cjs';

const videoCommand = async (m, sock) => {
  const prefix = config.PREFIX || '!';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  const newsletterJid = "120363290715861418@newsletter";
  const newsletterName = "Popkid-Xmd";

  if (!["video", "ytmp4", "v"].includes(cmd)) return;

  if (!text) {
    return await sock.sendMessage(m.from, {
      text: "❌ Please provide a video name or keyword!",
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid,
          newsletterName,
        }
      }
    }, { quoted: m });
  }

  if (typeof m.React === "function") await m.React("🔍");

  try {
    const search = await ytSearch(text);
    const video = search.videos?.[0];
    if (!video) throw new Error("No video found");

    let videoData;
    try {
      const res = await axios.get("https://apis.davidcyriltech.my.id/download/ytmp4?url=" + encodeURIComponent(video.url));
      const data = res.data.result;
      if (!data?.download_url) throw new Error("Primary failed");
      videoData = {
        title: data.title,
        thumbnail: data.thumbnail,
        download_url: data.download_url,
        quality: data.quality || "Unknown"
      };
    } catch {
      const res = await axios.get("https://iamtkm.vercel.app/downloaders/ytmp4?url=" + encodeURIComponent(video.url));
      const data = res.data?.data;
      if (!data?.url) throw new Error("Fallback failed");
      videoData = {
        title: data.title || video.title,
        thumbnail: video.thumbnail,
        download_url: data.url,
        quality: "Unknown (fallback)"
      };
    }

    const preview = {
      image: { url: videoData.thumbnail },
      caption: `╭────「 *🎬 Video Preview* 」\n│  📌 Title: ${videoData.title}\n│  ⏱️ Duration: ${video.timestamp}\n│  👁️ Views: ${video.views}\n│  📺 Quality: ${videoData.quality}\n│  📅 Published: ${video.ago}\n╰───────────────⊷`,
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        externalAdReply: {
          title: "Popkid XMD YT MENU",
          body: "Streaming via Popkid XMD Bot",
          thumbnailUrl: "https://raw.githubusercontent.com/joeljamestech2/JOEL-XMD/main/mydata/media/thumbnail.jpg",
          sourceUrl: video.url,
          mediaType: 1,
          renderLargerThumbnail: true
        },
        forwardedNewsletterMessageInfo: {
          newsletterJid,
          newsletterName,
          serverMessageId: -1
        }
      }
    };

    await sock.sendMessage(m.from, preview, { quoted: m });

    const videoMsg = {
      video: { url: videoData.download_url },
      mimetype: "video/mp4",
      caption: "🎥 Powered by Popkid XMD Bot\nStreaming now ↻ ◁ II ▷ ↺",
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        externalAdReply: {
          title: "Popkid XMD BOT",
          body: "Streaming now ↻ ◁ II ▷ ↺",
          thumbnailUrl: videoData.thumbnail,
          sourceUrl: video.url,
          mediaType: 1,
          renderLargerThumbnail: true
        },
        forwardedNewsletterMessageInfo: {
          newsletterJid,
          newsletterName,
          serverMessageId: -1
        }
      }
    };

    await sock.sendMessage(m.from, videoMsg, { quoted: m });
    if (typeof m.React === "function") await m.React("✅");

  } catch (e) {
    console.error(e);
    await sock.sendMessage(m.from, {
      text: "❌ An unexpected error occurred! Try again later.",
      contextInfo: {
        forwardingScore: 5,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid,
          newsletterName,
        }
      }
    }, { quoted: m });
    if (typeof m.React === "function") await m.React("❌");
  }
};

export default videoCommand;
