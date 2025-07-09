import config from "../../config.cjs";

const autoReplyCommand = async (m, sock) => {
  const prefix = config.PREFIX || ".";
  const botNumber = await sock.decodeJid(sock.user.id);
  const isOwner = [botNumber, `${config.OWNER_NUMBER}@s.whatsapp.net`].includes(m.sender);

  const cmd = m.body.slice(prefix.length).split(" ")[0].toLowerCase();
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (!["autostatusreply", "autostatusreplymsg"].includes(cmd)) return;

  if (!isOwner)
    return m.reply("⛔ *OWNER ONLY COMMAND!*");

  if (cmd === "autostatusreply") {
    if (text === "on") {
      config.AUTO_STATUS_REPLY = true;
      return m.reply("✅ *Auto Status Reply ENABLED!*");
    } else if (text === "off") {
      config.AUTO_STATUS_REPLY = false;
      return m.reply("❎ *Auto Status Reply DISABLED!*");
    } else {
      return m.reply(`ℹ️ Usage:\n• *${prefix}autoreply on/off*`);
    }
  }

  if (cmd === "autostatusreplymsg") {
    if (!text) return m.reply("✏️ *Please enter a reply message.*");
    config.AUTO_STATUS_REPLY_MSG = text;
    return m.reply(`✅ *Auto-reply message updated to:*\n> ${text}`);
  }
};

export default autoReplyCommand;
