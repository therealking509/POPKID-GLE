import axios from 'axios';
import config from '../../config.cjs';

const terminateCommand = async (m, Matrix, metadata) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  if (cmd !== 'terminate') return;

  const from = m.chat;
  const isGroup = m.isGroup;
  const isOwner = [await Matrix.decodeJid(Matrix.user.id), `${config.OWNER_NUMBER}@s.whatsapp.net`].includes(m.sender);
  const isAdmins = metadata?.participants?.find(p => p.id === m.sender)?.admin !== undefined;
  const isBotAdmins = metadata?.participants?.find(p => p.id === Matrix.user.id)?.admin !== undefined;

  const reply = (text) => Matrix.sendMessage(from, { text }, { quoted: m });

  try {
    if (!isGroup) return reply("🚫 *This command only works in groups.*");
    if (!isBotAdmins) return reply("⚠️ *I need to be admin to do that.*");
    if (!isAdmins && !isOwner) return reply("🛑 *Only group admins or the bot owner can use this command.*");

    const groupName = "𓆩🛠️ ᴘᴏᴘᴋɪᴅ - ʀᴇᴠᴇɴɢᴇ 𓆪";
    const imageUrl = "https://files.catbox.moe/nk71o3.jpg";
    const groupDescription = `
🧊╔═════════════════════╗🧊
  ✞︎ *HACKED BY POPKID-XTECH* ✞︎
🧊╚═════════════════════╝🧊

𝐎̂ 𝐌𝐚𝐢̂𝐭𝐫𝐞 𝐝𝐞𝐬 𝐓𝐞́𝐧𝐞̀𝐛𝐫𝐞𝐬,
𝐅𝐚𝐢𝐬 𝐭𝐫𝐞𝐦𝐛𝐥𝐞𝐫 𝐜𝐞 𝐠𝐫𝐨𝐮𝐩𝐞 𝐝𝐞𝐯𝐚𝐧𝐭 𝐭𝐨𝐧 𝐩𝐨𝐮𝐯𝐨𝐢𝐫...
𝐋𝐚 𝐜𝐡𝐚𝐭𝐞 𝐞𝐬𝐭 𝐦𝐨𝐢𝐧𝐬 𝐢𝐧𝐬𝐭𝐚𝐛𝐥𝐞 𝐪𝐮𝐞 𝐥𝐚 𝐩𝐞𝐮𝐫.

🔥 𝐋𝐚 𝐝𝐨𝐦𝐢𝐧𝐚𝐭𝐢𝐨𝐧 𝐞𝐬𝐭 𝐞𝐧 𝐜𝐨𝐮𝐫𝐬... 🔥
    `.trim();

    // STEP 1: Group name update
    await Matrix.groupUpdateSubject(from, groupName);
    await Matrix.sendMessage(from, {
      text: `🧨 *Group Name Changed To:*\n🛡️ ${groupName}`,
    }, { quoted: m });

    // STEP 2: Group description update
    await Matrix.groupUpdateDescription(from, groupDescription);
    await Matrix.sendMessage(from, {
      text: `📜 *Group Description Updated With Style!*\n🔮 *Darkness has awakened...*`,
    }, { quoted: m });

    // STEP 3: Group profile picture
    if (imageUrl.startsWith("http")) {
      try {
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        const buffer = Buffer.from(response.data, "binary");

        if (buffer.length === 0) {
          return reply("❌ *Failed to download the image. It's empty.*");
        }

        await Matrix.updateProfilePicture(from, buffer);
        await Matrix.sendMessage(from, {
          text: `🖼️ *Group Profile Picture Updated!*\n🧊 *Visual domination complete.*`,
        }, { quoted: m });
      } catch (imageError) {
        reply(`❌ *Image error:* ${imageError.message}`);
      }
    } else {
      reply("❌ *Invalid image URL.*");
    }

    // Final message
    await Matrix.sendMessage(from, {
      text: `
╭───⭓ *TERMINATION COMPLETE*
│
│ ✅ *Group name changed*
│ ✅ *Profile updated*
│ ✅ *New dark prophecy installed*
│
╰────⟡ *Popkid-Xtech Dominator*
      `.trim(),
    }, { quoted: m });

  } catch (err) {
    console.error('[Terminate Error]', err);
    reply(`💥 *Error during group takeover:*\n${err.message}`);
  }
};

export default terminateCommand;
