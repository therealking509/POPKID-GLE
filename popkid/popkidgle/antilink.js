import fs from "fs";
import config from "../config.cjs";

const dbPath = "./database/antilink.json";
let antilinkDB = fs.existsSync(dbPath)
  ? JSON.parse(fs.readFileSync(dbPath))
  : {};

const saveDB = () => fs.writeFileSync(dbPath, JSON.stringify(antilinkDB, null, 2));

const antiLink = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const body = m.body.toLowerCase().trim();
    if (!body.startsWith(prefix)) return;

    const command = body.slice(prefix.length).trim();

    const send = (text) => sock.sendMessage(m.from, {
      text,
      contextInfo: {
        forwardingScore: 9,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "🛡️ Popkid AntiLink System",
          newsletterJid: "120363290715861418@newsletter"
        }
      }
    }, { quoted: m });

    if (command === "antilink") {
      return send(
        `┏━━『 *🛡️ ANTILINK USAGE* 』━━\n` +
        `┃\n` +
        `┃ ⚙️ ${prefix}antilink on\n` +
        `┃ ⚙️ ${prefix}antilink off\n` +
        `┃\n` +
        `┃ 🔒 Blocks links in groups\n` +
        `┃ 💠 Only admins can control it\n` +
        `┃\n` +
        `┗━━━━━━━━━━━━━━━━━━━━┛`
      );
    }

    if (command === "antilink on") {
      if (!m.isGroup) return send(`❗ *Group command only!*`);
      const metadata = await sock.groupMetadata(m.from);
      const isAdmin = metadata.participants.find(p => p.id === m.sender)?.admin;

      if (!isAdmin) return send(`🚫 *Admin only!*`);

      antilinkDB[m.from] = true;
      saveDB();
      return send(
        `┏━━『 *✅ ANTILINK ACTIVATED* 』━━\n` +
        `┃ 🔐 Group protected from link spam\n` +
        `┃ 🔄 Use *${prefix}antilink off* to disable\n` +
        `┗━━━━━━━━━━━━━━━━━━━━┛`
      );
    }

    if (command === "antilink off") {
      if (!m.isGroup) return send(`❗ *Group command only!*`);
      const metadata = await sock.groupMetadata(m.from);
      const isAdmin = metadata.participants.find(p => p.id === m.sender)?.admin;

      if (!isAdmin) return send(`🚫 *Admin only!*`);

      delete antilinkDB[m.from];
      saveDB();
      return send(
        `┏━━『 *❌ ANTILINK DEACTIVATED* 』━━\n` +
        `┃ 🔓 Group no longer protected\n` +
        `┃ 🔄 Use *${prefix}antilink on* to enable\n` +
        `┗━━━━━━━━━━━━━━━━━━━━┛`
      );
    }

    // Auto-moderate links
    const isAutoOn = config.ANTILINK === true;
    const groupEnabled = antilinkDB[m.from];
    const shouldBlock = isAutoOn || groupEnabled;

    if (shouldBlock && m.isGroup) {
      const linkRegex = /(https?:\/\/[^\s]+|chat\.whatsapp\.com\/[a-zA-Z0-9]+)/gi;
      const metadata = await sock.groupMetadata(m.from);
      const isAdmin = metadata.participants.find(p => p.id === m.sender)?.admin;

      if (!isAdmin && linkRegex.test(m.body)) {
        await sock.sendMessage(m.from, { delete: m.key });
        return send(
          `┏━━『 *🚫 LINK DELETED* 』━━\n` +
          `┃ ⚠️ Links are not allowed here!\n` +
          `┃ 🔐 Protection active for this group\n` +
          `┗━━━━━━━━━━━━━━━━━━━━┛`
        );
      }
    }

  } catch (err) {
    console.error("❌ AntiLink Error:", err);
    sock.sendMessage(m.from, {
      text:
        `┏━━『 *❌ ERROR OCCURRED* 』━━\n` +
        `┃ ⚠️ ${err.message}\n` +
        `┃ Please try again later.\n` +
        `┗━━━━━━━━━━━━━━━━━━━━┛`
    }, { quoted: m });
  }
};

export default antiLink;
