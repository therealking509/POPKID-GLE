import config from '../../config.cjs';

const onlinelist = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

  if (cmd === "onlinelist") {
    try {
      const groupMetadata = await sock.groupMetadata(m.from);
      const participants = groupMetadata.participants;
      const total = participants.length;

      let onlineMembers = [];
      for (const user of participants) {
        const presence = sock.presence[m.from]?.[user.id];
        const isOnline = presence?.lastKnownPresence === 'available';
        if (isOnline) onlineMembers.push(user.id);
      }

      if (onlineMembers.length === 0) {
        await sock.sendMessage(m.from, {
          text: `❌ No members are online right now.`,
        }, { quoted: m });
        return;
      }

      const formattedList = onlineMembers
        .map((jid, i) => `├❍ ${i + 1}. @${jid.split('@')[0]}`)
        .join('\n');

      const response = `
*╭━[🟢 ᴏɴʟɪɴᴇ ᴍᴇᴍʙᴇʀs]━╮*
*┋*▧ *ɢʀᴏᴜᴘ*: ${groupMetadata.subject}
*┋*▧ *ᴛᴏᴛᴀʟ ᴍᴇᴍʙᴇʀs*: ${total}
*┋*▧ *ᴏɴʟɪɴᴇ*: ${onlineMembers.length}
╰──────────────╶╶···◈

${formattedList}

> _*⚡ Powered by ${config.OWNER_NAME || 'POPKID'} BOT*_`
        .trim();

      await sock.sendMessage(m.from, {
        text: response,
        mentions: onlineMembers
      }, { quoted: m });

    } catch (err) {
      console.error("Error in .onlinelist:", err);
      await sock.sendMessage(m.from, {
        text: "❌ *Error:* Unable to fetch online users at this time."
      }, { quoted: m });
    }
  }
};

export default onlinelist;
