import config from '../../config.cjs';

const autotypingCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isOwner = [botNumber, `${config.OWNER_NUMBER}@s.whatsapp.net`].includes(m.sender);
  const prefix = config.PREFIX;

  const command = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  const args = m.body.slice(prefix.length + command.length).trim();

  if (command !== 'autotyping') return;

  if (!isOwner) {
    return m.reply('📛 *THIS IS AN OWNER-ONLY COMMAND*');
  }

  let message;

  switch (args) {
    case 'on':
      config.AUTO_TYPING = true;
      message = '💬 *Auto-Typing has been enabled.*';
      break;

    case 'off':
      config.AUTO_TYPING = false;
      message = '🔕 *Auto-Typing has been disabled.*';
      break;

    default:
      const status = config.AUTO_TYPING ? '🟢 ON' : '🔴 OFF';
      message = `
╭─⧉  *Auto-Typing Settings*
│
│ 🖊️ *Status:* ${status}
│
│ 🔧 *Usage:*
│ • \`autotyping on\` — Enable auto typing
│ • \`autotyping off\` — Disable auto typing
│
╰────⟡ *Popkid-AI Control Panel*
`.trim();
      break;
  }

  try {
    await Matrix.sendMessage(m.from, { text: message }, { quoted: m });
  } catch (err) {
    console.error('[AutoTyping Error]', err.message);
    await Matrix.sendMessage(m.from, {
      text: '❌ *An error occurred while processing your request.*'
    }, { quoted: m });
  }
};

export default autotypingCommand;
