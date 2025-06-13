import config from "../../config.cjs";

// 🔒 Temporary in-memory storage
const antibotDB = new Map();

const antibot = async (m, gss) => {
  try {
    const cmd = m.body.toLowerCase().trim();

    // 📊 Show Antibot Status
    if (cmd === "antibot status") {
      const status = antibotDB.has(m.from) ? "🟢 ON" : "🔴 OFF";
      return m.reply(
        `📊 *Antibot Status for This Group:*\n\n` +
        `• Status: ${status}\n\n` +
        `Use:\n> *antibot on* - to enable\n> *antibot off* - to disable`
      );
    }

    // ✅ Enable Antibot
    if (cmd === "antibot on") {
      if (!m.isGroup)
        return m.reply("⚠️ *Group-only command!*\n\n> _Try it in a group chat._");

      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin)
        return m.reply("🔐 *Admins only!*\n\n> _You need admin privileges to use this command._");

      antibotDB.set(m.from, true);
      return m.reply("🛡️ *Antibot Activated!*\n\n> _Bot commands are now restricted in this group._");
    }

    // ❎ Disable Antibot
    if (cmd === "antibot off") {
      if (!m.isGroup)
        return m.reply("⚠️ *Group-only command!*\n\n> _Try disabling in a group chat._");

      const groupMetadata = await gss.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const senderAdmin = participants.find(p => p.id === m.sender)?.admin;

      if (!senderAdmin)
        return m.reply("🔐 *Only admins can disable antibot!*\n\n> _Request admin access to proceed._");

      antibotDB.delete(m.from);
      return m.reply("✅ *Antibot Deactivated!*\n\n> _You're now free to use bot commands._");
    }

    // 🚫 Auto-detect bot commands
    if (antibotDB.get(m.from)) {
      const botCommandRegex = /\.menu|\.help|\.ping|\.play|\.owner|\.img|\.repo|\.sc|\.start|\.command/gi;

      if (botCommandRegex.test(m.body)) {
        // Delete the command message
        await gss.sendMessage(m.from, { delete: m.key });

        // First warning message
        await m.reply("🚫 *Bot commands are not allowed in this group!*\n\n> _This is your first warning._");

        // Track warned users
        const warnedKey = `${m.from}_warned`;
        const warnedUsers = antibotDB.get(warnedKey) || new Set();

        if (warnedUsers.has(m.sender)) {
          // Remove user if repeated
          await gss.groupParticipantsUpdate(m.from, [m.sender], "remove");
          return m.reply(`👢 *@${m.sender.split('@')[0]} has been removed for using bot commands repeatedly!*`);
        } else {
          warnedUsers.add(m.sender);
          antibotDB.set(warnedKey, warnedUsers);
        }
      }
    }
  } catch (error) {
    console.error("❌ Antibot Error:", error);
    m.reply("⚠️ *An unexpected error occurred in Antibot!*\n\n> _Please try again later._");
  }
};

export default antibot;
