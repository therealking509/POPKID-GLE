import config from '../../config.cjs';

const groupinfo = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : '';

  if (cmd !== "groupinfo") return;

  if (!m.isGroup) {
    return await sock.sendMessage(m.from, {
      text: `❌ *This command only works in group chats.*`
    }, { quoted: m });
  }

  try {
    await m.React("🔍");

    const metadata = await sock.groupMetadata(m.from);
    const groupName = metadata.subject;
    const groupId = metadata.id;
    const members = metadata.participants;
    const admins = members.filter(p => p.admin);
    const owner = metadata.owner || admins.find(a => a.admin === 'superadmin')?.id || 'unknown';
    const description = metadata.desc?.toString().slice(0, 500) || '⚠️ No description available.';
    const announce = metadata.announce
      ? '🔒 Only *admins* can send messages'
      : '🔓 *Everyone* can chat';
    const creationDate = new Date(metadata.creation * 1000).toLocaleString('en-GB');

    // 🌟 Stylish GLE Layout
    const text = `╭───〘 *👥 GLE GROUP INFO* 〙───◆
│ 📛 *Group:* ${groupName}
│ 🆔 *ID:* ${groupId}
│ 👥 *Members:* ${members.length}
│ 🛡️ *Admins:* ${admins.length}
│ 👑 *Owner:* @${owner.split('@')[0]}
│ 🔐 *Privacy:* ${announce}
│ 🕒 *Created:* ${creationDate}
╰───────────────────────────╮
   📝 *About:* ${description}
╰───────────────────────────╯`;

    await sock.sendMessage(m.from, {
      text,
      mentions: [owner, ...admins.map(a => a.id)],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: "Popkid GLE • Group Scanner",
          body: "Analyzing WhatsApp Group Data 🧠",
          thumbnailUrl: "https://i.imgur.com/PopkidGLE.jpg", // 🔁 Your logo here
          sourceUrl: "https://github.com/devpopkid",         // 🔗 Your GitHub or bot page
          mediaType: 1,
          renderLargerThumbnail: true,
          showAdAttribution: true
        }
      }
    }, { quoted: m });

  } catch (error) {
    await sock.sendMessage(m.from, {
      text: `❌ *Failed to fetch group info.*\n_Reason:_ ${error.message || 'Unknown error'}`
    }, { quoted: m });
  }
};

export default groupinfo;
