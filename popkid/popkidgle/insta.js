import axios from "axios";
import config from "../config.cjs";

const instagram = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const query = m.body.slice(prefix.length + cmd.length).trim();

  if (!["ig", "insta", "instagram"].includes(cmd)) return;

  if (!query || !query.startsWith("http")) {
    return Matrix.sendMessage(m.from, {
      text: `
╭━━❰ ❌ *Invalid Usage* ❱━━
┃ 
┃ ⚠️ Use: *.ig <Instagram URL>*
┃ Example: *.ig https://www.instagram.com/reel/xxxx*
┃ 
╰━━━━━━━━━━━━━━━━━
`.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363354023106228@newsletter",
          newsletterName: "popkidgle",
          serverMessageId: 143,
        },
      },
    }, { quoted: m });
  }

  try {
    await Matrix.sendMessage(m.from, { react: { text: "📥", key: m.key } });

    const { data } = await axios.get(`https://api.davidcyriltech.my.id/instagram?url=${query}`);

    if (!data.success || !data.downloadUrl) {
      return Matrix.sendMessage(m.from, {
        text: `
╭━━❰ ⚠️ *Download Failed* ❱━━
┃
┃ ❌ Unable to fetch Instagram video.
┃ 🔁 Please check the URL or try again.
┃
╰━━━━━━━━━━━━━━━━━
`.trim(),
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363354023106228@newsletter",
            newsletterName: "popkidgle",
            serverMessageId: 143,
          },
        },
      }, { quoted: m });
    }

    await Matrix.sendMessage(m.from, {
      video: { url: data.downloadUrl },
      mimetype: "video/mp4",
      caption: "📥 *Instagram Video*\n✅ *Powered By JawadTechX*",
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363354023106228@newsletter",
          newsletterName: "popkidgle",
          serverMessageId: 143,
        },
      },
    }, { quoted: m });

    await Matrix.sendMessage(m.from, { react: { text: "✅", key: m.key } });

  } catch (error) {
    console.error("Instagram Downloader Error:", error);
    Matrix.sendMessage(m.from, {
      text: `
╭━━❰ ❌ *Error Occurred* ❱━━
┃
┃ ⚠️ Something went wrong while fetching the video.
┃ 🔁 Try again later.
┃
╰━━━━━━━━━━━━━━━━━
`.trim(),
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363354023106228@newsletter",
          newsletterName: "popkid",
          serverMessageId: 143,
        },
      },
    }, { quoted: m });
  }
};

export default instagram;
