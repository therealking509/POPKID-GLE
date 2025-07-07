import axios from "axios";
import config from "../../config.cjs";

const downloadStore = new Map();

const playHandler = async (msg, sock) => {
  try {
    const prefix = config.PREFIX || ".";
    const from = msg?.from;
    const body = msg?.body?.trim();
    if (!from || !sock || (!body?.startsWith(prefix) && !downloadStore.has(from))) return;

    const command = body.startsWith(prefix) ? body.slice(prefix.length).split(" ")[0].toLowerCase() : null;
    const query = command ? body.slice(prefix.length + command.length).trim() : null;

    if (command === "play3") {
      if (!query) {
        await sock.sendMessage(from, { text: "❌ Please provide a YouTube URL!" }, { quoted: msg });
        if (msg.React) await msg.React("❌");
        return;
      }

      if (msg.React) await msg.React("⏳");

      // 🎵 Use PrinceTech API for MP3 (direct URL support)
      const mp3Res = await axios.get(`https://api.princetechn.com/api/download/mp3`, {
        params: {
          apikey: "prince_api_tjhv",
          url: query
        }
      });

      const res = mp3Res.data;
      if (!res?.url) throw new Error("Failed to fetch MP3");

      const mp3Meta = {
        title: res.title || "Unknown",
        url: query,
        image: res.thumbnail || "https://i.imgur.com/QpS1G4i.jpeg",
        timestamp: res.duration || "Unknown",
        views: res.views || 0,
        author: {
          name: res.channel || "Unknown Artist"
        }
      };

      // Optional: Try MP4 from fallback
      let videoData = null;
      try {
        const fallback = await axios.get("https://iamtkm.vercel.app/downloaders/ytmp4?url=" + encodeURIComponent(query));
        const data = fallback.data?.data;
        if (!data?.url) throw new Error("Fallback MP4 failed");
        videoData = {
          title: mp3Meta.title,
          thumbnail: mp3Meta.image,
          download_url: data.url,
          quality: "Unknown (fallback)"
        };
      } catch {
        videoData = null;
      }

      // 🕒 3-minute session
      if (downloadStore.has(from)) clearTimeout(downloadStore.get(from).timeout);
      const timeout = setTimeout(() => downloadStore.delete(from), 3 * 60 * 1000);
      downloadStore.set(from, {
        title: mp3Meta.title,
        mp3Url: res.url,
        mp3Meta,
        videoData,
        timeout
      });

      await sock.sendMessage(from, {
        image: { url: mp3Meta.image },
        caption:
`╔═══❖『 🎧 𝙉𝙤𝙬 𝙋𝙡𝙖𝙮𝙞𝙣𝙜 』❖═══╗
┃🎵 *Title:* ${mp3Meta.title}
┃⏱️ *Duration:* ${mp3Meta.timestamp}
┃🎤 *Artist:* ${mp3Meta.author.name}
╚═══════════════════════╝

🌟 *Download Options:*
╭───────────────╮
│ 1️⃣ Audio
│ 2️⃣ Document MP3
│ 3️⃣ Document MP4
│ 4️⃣ Video Stream
│ 5️⃣ Voice Note
╰───────────────╯

💬 _Reply with a number (1–5)_
🕒 _Expires in 3 minutes_

🔋 ᴘᴏᴡᴇʀᴇᴅ ʙʏ *ᴘᴏᴘᴋɪᴅ × ᴘʀɪɴᴄᴇᴛᴇᴄʜ*`,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "ᴘᴏᴘᴋɪᴅ-ɢʟᴇ",
            serverMessageId: -1
          },
          externalAdReply: {
            title: mp3Meta.title,
            body: "Download Menu • Popkid-Gle",
            thumbnailUrl: mp3Meta.image,
            sourceUrl: mp3Meta.url,
            mediaType: 1
          }
        }
      }, { quoted: msg });

      if (msg.React) await msg.React("✅");
      return;
    }

    if (/^[1-5]$/.test(body) && downloadStore.has(from)) {
      const choice = parseInt(body);
      const { title, mp3Url, mp3Meta, videoData } = downloadStore.get(from);

      const sendOptions = {
        1: {
          audio: { url: mp3Url },
          mimetype: "audio/mpeg"
        },
        2: {
          document: { url: mp3Url },
          fileName: `${title}.mp3`,
          mimetype: "audio/mpeg"
        },
        3: videoData ? {
          document: { url: videoData.download_url },
          fileName: `${videoData.title}.mp4`,
          mimetype: "video/mp4"
        } : { text: "❌ Video unavailable." },
        4: videoData ? {
          video: { url: videoData.download_url },
          caption: `🎥 *${videoData.title}*`,
          mimetype: "video/mp4"
        } : { text: "❌ Video unavailable." },
        5: {
          audio: { url: mp3Url },
          mimetype: "audio/mpeg",
          ptt: true
        }
      };

      await sock.sendMessage(from, sendOptions[choice], { quoted: msg });
      if (msg.React) await msg.React("✅");
      return;
    }

  } catch (err) {
    console.error("play3 error:", err);
    await sock.sendMessage(msg.from, {
      text: `❌ Something went wrong: ${err?.message || "Unknown error"}`
    }, { quoted: msg });
    if (msg.React) await msg.React("❌");
  }
};

export default playHandler;
