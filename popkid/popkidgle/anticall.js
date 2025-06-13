import config from '../../config.cjs';

// 🌐 Anti-Call Command
const anticallcommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;

  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'anticall') {
    if (!isCreator) return m.reply('*🚫 Only the owner can use this command!*');

    let responseMessage;

    if (text === 'on') {
      config.REJECT_CALL = true;
      responseMessage = `✅ *Anti-Call Enabled!*\n\nAll incoming calls will now be automatically rejected.`;
    } else if (text === 'off') {
      config.REJECT_CALL = false;
      responseMessage = `❌ *Anti-Call Disabled!*\n\nCalls will no longer be auto-rejected.`;
    } else {
      responseMessage = `📛 *Invalid Usage!*\n\nTry one of the following:\n\n- \`${prefix}anticall on\` — Enable Anti-Call\n- \`${prefix}anticall off\` — Disable Anti-Call`;
    }

    try {
      await Matrix.sendMessage(m.from, { text: responseMessage }, { quoted: m });
    } catch (error) {
      console.error('❗ Error handling anticall command:', error);
      await Matrix.sendMessage(m.from, { text: '⚠️ An error occurred while processing your request.' }, { quoted: m });
    }
  }
};

export default anticallcommand;
