import axios from "axios";
import config from "../../config.cjs";

const downloadStore = new Map();

const playHandler = async (msg, sock) => {
  try {
    const prefix = config.PREFIX || "!";
    const from = msg?.from;
    const body = msg?.body?.trim();
    if (!from || !sock || (!body?.startsWith(prefix) && !downloadStore.has(from))) return;

    const command = body.startsWith(prefix) ? body.slice(prefix.length).split(" ")[0].toLowerCase() : null;
    const query = command ? body.slice(prefix.length + command.length).trim() : null;

    if (command === "play3") {
      if (!query) {
        await sock.sendMessage(from, { text: "❌ Please provide a song or video name!" }, { quoted: msg });
        if (msg.React) await msg.React("❌");
        return;
      }

      if (msg.React) await msg.React("⏳");

      // 🔍 Step 1: Search video via Popcat API
      const searchRes = await axios.get(`https://api.popcat.xyz/search?q=${encodeURIComponent(query)}`);
      const results = searchRes.data;
      if (!results || !results[0]?.url) throw new Error("Could not find video.");

      const videoUrl = results[0].url;

      // 🎵 Step 2: Get MP3 from GiftedTech API
      const mp3Res = await axios.get(`https://api.giftedtech.web.id/api/download/ytmp3?apikey=gifted&url=${encodeURIComponent(videoUrl)}`);
      const mp3Data = mp3Res.data?.data;
      if (!mp3Data?.url) throw new Error("Failed to fetch MP3");

      const mp3Url = mp3Data.url;
      const mp3Meta = {
        title: mp3Data.title || query,
        url: videoUrl,
        image: mp3Data.thumbnail || "https://i.imgur.com/QpS1G4i.jpeg",
        timestamp: mp3Data.duration || "Unknown",
        views: mp3Data.views || 0,
        author: {
          name: mp3Data.channel || "Unknown Artist"
        }
      };

      // 🎥 Step 3: Try to get MP4 from first or fallback source
      let videoData;
      try {
        const vres = await axios.get("https://apis.davidcyriltech.my.id/download/ytmp4?url=" + encodeURIComponent(videoUrl));
        const data = vres.data.result;
        if (!data?.download_url) throw new Error("Primary MP4 failed");
        videoData = {
          title: data.title,
          thumbnail: data.thumbnail,
          download_url: data.download_url,
          quality: data.quality || "Unknown"
        };
      } catch {
        const fallback = await axios.get("https://iamtkm.vercel.app/downloaders/ytmp4?url=" + encodeURIComponent(videoUrl));
        const data = fallback.data?.data;
        if (!data?.url) throw new Error("Fallback MP4 failed");
        videoData = {
          title: data.title || mp3Meta.title,
          thumbnail: mp3Meta.image,
          download_url: data.url,
          quality: "Unknown (fallback)"
        };
      }

      // 🕒 Setup 3-minute session
      if (downloadStore.has(from)) clearTimeout(downloadStore.get(from).timeout);
      const timeout = setTimeout(() => downloadStore.delete(from), 3 * 60 * 1000);
      downloadStore.set(from, {
        title: mp3Meta.title,
        mp3Url,
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
┃👁️ *Views:* ${mp3Meta.views.toLocaleString()}
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
🕒 _Link expires in 3 minutes._

🔋 ᴘᴏᴡᴇʀᴇᴅ ʙʏ *ᴘᴏᴘᴋɪᴅ-ɢʟᴇ*`,
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
          mimetype: "audio/mpeg",
          caption: `🎵 *Now Playing:* ${title}`,
          contextInfo: {
            isForwarded: true,
            forwardingScore: 1000,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363420342566562@newsletter",
              newsletterName: "ᴘᴏᴘᴋɪᴅ-ɢʟᴇ",
              serverMessageId: -1
            }
          }
        },
        2: {
          document: { url: mp3Url },
          fileName: `${title}.mp3`,
          mimetype: "audio/mpeg",
          contextInfo: {
            isForwarded: true,
            forwardingScore: 1000,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363420342566562@newsletter",
              newsletterName: "ᴘᴏᴘᴋɪᴅ-ɢʟᴇ",
              serverMessageId: -1
            }
          }
        },
        3: {
          document: { url: videoData.download_url },
          fileName: `${videoData.title}.mp4`,
          mimetype: "video/mp4",
          contextInfo: {
            isForwarded: true,
            forwardingScore: 1000,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363420342566562@newsletter",
              newsletterName: "ᴘᴏᴘᴋɪᴅ-ɢʟᴇ",
              serverMessageId: -1
            }
          }
        },
        4: {
          video: { url: videoData.download_url },
          caption: `🎥 *${videoData.title}*`,
          mimetype: "video/mp4",
          contextInfo: {
            isForwarded: true,
            forwardingScore: 1000,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363420342566562@newsletter",
              newsletterName: "ᴘᴏᴘᴋɪᴅ-ɢʟᴇ",
              serverMessageId: -1
            }
          }
        },
        5: {
          audio: { url: mp3Url },
          mimetype: "audio/mpeg",
          ptt: true,
          contextInfo: {
            isForwarded: true,
            forwardingScore: 1000,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363420342566562@newsletter",
              newsletterName: "ᴘᴏᴘᴋɪᴅ-ɢʟᴇ",
              serverMessageId: -1
            }
          }
        }
      };

      await sock.sendMessage(from, sendOptions[choice], { quoted: msg });
      if (msg.React) await msg.React("✅");
      return;
    }

  } catch (err) {
    console.error("play2 error:", err);
    await sock.sendMessage(msg.from, {
      text: `❌ Something went wrong: ${err?.message || "Unknown error"}`
    }, { quoted: msg });
    if (msg.React) await msg.React("❌");
  }
};

export default playHandler;
