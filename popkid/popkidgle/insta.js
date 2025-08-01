import axios from "axios";
import config from "../config.cjs";

const instagram = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : "";
  const query = m.body.slice(prefix.length + cmd.length).trim();

  if (!["ig", "insta", "instagram"].includes(cmd)) return;

  if (!query || !query.startsWith("http")) {
    return sock.sendMessage(m.from, {
      text: `
❌ *Usage:* \`${prefix}ig <Instagram URL>\`
📌 Example: \`${prefix}ig https://www.instagram.com/reel/xyz\`
`.trim(),
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363420342566562@newsletter",
          newsletterName: "Popkid-Xmd",
          serverMessageId: 145,
        },
      },
    }, { quoted: m });
  }

  try {
    await m.React("📥");

    const { data } = await axios.get(
      `https://api.davidcyriltech.my.id/instagram?url=${query}`
    );

    if (!data.success || !data.downloadUrl) {
      return sock.sendMessage(m.from, {
        text: `
⚠️ *Failed to fetch video from Instagram.*
🔁 Please try again with a valid or public link.
`.trim(),
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "Popkid-Xmd",
            serverMessageId: 146,
          },
        },
      }, { quoted: m });
    }

    await sock.sendMessage(
      m.from,
      {
        video: { url: data.downloadUrl },
        mimetype: "video/mp4",
        caption: `
🎬 *Instagram Video Downloaded!*
✅ Powered by *Popkid-Xmd*
🔗 Original: ${query}
`.trim(),
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "Popkid-Xmd",
            serverMessageId: 147,
          },
        },
      },
      { quoted: m }
    );

    await m.React("✅");
  } catch (err) {
    console.error("Instagram Download Error:", err);
    await sock.sendMessage(m.from, {
      text: `
❌ *An unexpected error occurred.*
Please try again later.
`.trim(),
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363420342566562@newsletter",
          newsletterName: "Popkid-Xmd",
          serverMessageId: 148,
        },
      },
    }, { quoted: m });
  }
};

export default instagram;
