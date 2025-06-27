import axios from "axios";
import config from "../../config.cjs";

// Temporary storage for per-user song data
const downloadStore = new Map();

const playHandler = async (msg, sock) => {
  try {
    const prefix = config.PREFIX || "!";
    const from = msg?.from;
    const body = msg?.body?.trim();
    if (!from || !sock || (!body?.startsWith(prefix) && !downloadStore.has(from))) return;

    const command = body.startsWith(prefix) ? body.slice(prefix.length).split(" ")[0].toLowerCase() : null;
    const query = command ? body.slice(prefix.length + command.length).trim() : null;

    // === Handle `.play2 <query>` ===
    if (command === "play2") {
      if (!query) {
        await sock.sendMessage(from, { text: "❌ Please provide a song or video name!" }, { quoted: msg });
        if (msg.React) await msg.React("❌");
        return;
      }

      if (msg.React) await msg.React("⏳");

      // Get MP3 & metadata
      const mp3Res = await axios.get(`https://api.vreden.my.id/api/ytplaymp3?query=${encodeURIComponent(query)}`);
      const mp3Data = mp3Res.data.result;
      const mp3Meta = mp3Data.metadata;
      const mp3Url = mp3Data.download.url;

      // Get MP4 fallback
      let videoData;
      try {
        const vres = await axios.get("https://apis.davidcyriltech.my.id/download/ytmp4?url=" + encodeURIComponent(mp3Meta.url));
        const data = vres.data.result;
        if (!data?.download_url) throw new Error("Primary failed");
        videoData = {
          title: data.title,
          thumbnail: data.thumbnail,
          download_url: data.download_url,
          quality: data.quality || "Unknown"
        };
      } catch {
        const fallback = await axios.get("https://iamtkm.vercel.app/downloaders/ytmp4?url=" + encodeURIComponent(mp3Meta.url));
        const data = fallback.data?.data;
        if (!data?.url) throw new Error("Fallback failed");
        videoData = {
          title: data.title || mp3Meta.title,
          thumbnail: mp3Meta.image,
          download_url: data.url,
          quality: "Unknown (fallback)"
        };
      }

      // Store user's song data
      if (downloadStore.has(from)) clearTimeout(downloadStore.get(from).timeout);
      downloadStore.set(from, {
        title: mp3Meta.title,
        mp3Url,
        mp3Meta,
        videoData,
        timeout: setTimeout(() => downloadStore.delete(from), 3 * 60 * 1000) // 3 minutes expiry
      });

      // Send menu message with image and info
      await sock.sendMessage(from, {
        image: { url: mp3Meta.image },
        caption:
          `🎶 Choose your download format for: *${mp3Meta.title}*\n\n` +
          `📄 *Duration:* ${mp3Meta.timestamp}\n` +
          `👁 *Views:* ${mp3Meta.views.toLocaleString()}\n` +
          `🎤 *Artist:* ${mp3Meta.author.name}\n\n` +
          `1️⃣ Audio\n` +
          `2️⃣ Document MP3\n` +
          `3️⃣ Document MP4\n` +
          `4️⃣ Video Stream\n` +
          `5️⃣ Voice Note\n\n` +
          `_Reply with the number (1–5) to receive your preferred format._\n\n` +
          `ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ-ɢʟᴇ`,
        contextInfo: {
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

    // === Handle reply numbers 1–5 ===
    if (/^[1-5]$/.test(body) && downloadStore.has(from)) {
      const choice = parseInt(body);
      const { title, mp3Url, mp3Meta, videoData } = downloadStore.get(from);

      const sendOptions = {
        1: {
          audio: { url: mp3Url },
          mimetype: "audio/mpeg",
          caption: `🎶 *Now Playing:* ${title}`,
        },
        2: {
          document: { url: mp3Url },
          fileName: `${title}.mp3`,
          mimetype: "audio/mpeg",
        },
        3: {
          document: { url: videoData.download_url },
          fileName: `${videoData.title}.mp4`,
          mimetype: "video/mp4",
        },
        4: {
          video: { url: videoData.download_url },
          caption: `🎥 *${videoData.title}*`,
          mimetype: "video/mp4",
        },
        5: {
          audio: { url: mp3Url },
          mimetype: "audio/mpeg",
          ptt: true,
        }
      };

      await sock.sendMessage(from, sendOptions[choice], { quoted: msg });
      if (msg.React) await msg.React("✅");

      clearTimeout(downloadStore.get(from).timeout);
      downloadStore.delete(from);
    }
  } catch (err) {
    console.error("play2 error:", err);
    await sock.sendMessage(msg.from, { text: "❌ Something went wrong while processing your request." }, { quoted: msg });
    if (msg.React) await msg.React("❌");
  }
};

export default playHandler;
