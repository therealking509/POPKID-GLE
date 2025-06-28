import axios from "axios";
import config from "../config.cjs";

const instagram = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const query = m.body.slice(prefix.length + cmd.length).trim();

  if (!["ig", "insta", "instagram"].includes(cmd)) return;

  if (!query || !query.startsWith("http")) {
    return Matrix.sendMessage(m.from, {
      text: `❌ *Missing URL!*\n\n✨ *Usage:* \n\`${prefix}ig <Instagram Link>\`\n\n_Example:_\n${prefix}ig https://www.instagram.com/reel/xxxx`,
    }, { quoted: m });
  }

  try {
    await Matrix.sendMessage(m.from, { react: { text: "⏳", key: m.key } });

    const { data } = await axios.get(`https://api.davidcyriltech.my.id/instagram?url=${encodeURIComponent(query)}`);

    if (!data?.success || !data?.downloadUrl) {
      return Matrix.sendMessage(m.from, {
        text: "⚠️ *Unable to fetch video from Instagram. Please check the link or try again later.*",
      }, { quoted: m });
    }

    const caption = `
╭━━━[ 🎬 𝗜𝗡𝗦𝗧𝗔 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 ]━━━╮
┃ 📥 *Instagram Video Retrieved!*
┃ 🔗 *URL:* ${query}
┃ 🧋 *Brand:* Popkid-Xmd
┃ 🧠 *Bot:* POPKID-XMD-2
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━╯
`.trim();

    await Matrix.sendMessage(m.from, {
      video: { url: data.downloadUrl },
      mimetype: "video/mp4",
      caption,
      contextInfo: {
        mentionedJid: [m.sender],
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363420342566562@newsletter",
          newsletterName: "Popkid-Xmd 🧋",
          serverMessageId: 143
        }
      }
    }, { quoted: m });

    await Matrix.sendMessage(m.from, { react: { text: "✅", key: m.key } });

  } catch (err) {
    console.error("Instagram Downloader Error:", err);
    await Matrix.sendMessage(m.from, {
      text: "❌ *An unexpected error occurred while processing your request.*",
    }, { quoted: m });
  }
};

export default instagram;
