import config from '../../config.cjs';
import {
  enableAutoStatus,
  disableAutoStatus,
  setAutoStatusMessage,
  getAutoStatusSettings
} from '../../lib/autostatus.js';

const autostatus = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const args = body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'autostatus') {
    let replyMsg = '';

    if (args === 'on') {
      enableAutoStatus();
      replyMsg = `✅ *AutoStatus has been ENABLED.*\nNow replying to all viewed status.`;
    } else if (args === 'off') {
      disableAutoStatus();
      replyMsg = `❌ *AutoStatus has been DISABLED.*\nNo replies will be sent to statuses.`;
    } else if (args.startsWith('set ')) {
      const newMsg = args.slice(4);
      if (!newMsg) return m.reply(`❗ Usage: ${prefix}autostatus set <your message>`);
      setAutoStatusMessage(newMsg);
      replyMsg = `✏️ *AutoStatus message updated!*\n📨 New Message:\n${newMsg}`;
    } else {
      const settings = getAutoStatusSettings();
      replyMsg = `
╭━━❰ *AᴜᴛᴏSᴛᴀᴛᴜꜱ Sᴇᴛᴛɪɴɢꜱ* ❱━━⬣
┃⚙️ *Status:* ${settings.enabled ? '🟢 Enabled' : '🔴 Disabled'}
┃✉️ *Message:* ${settings.message}
┃📌 *Commands:*
┃ ┗ ${prefix}autostatus on/off
┃ ┗ ${prefix}autostatus set <msg>
╰━━━⊱ *Popkid Tech* ⊰━━⬣`.trim();
    }

    sock.sendMessage(m.from, { text: replyMsg }, { quoted: m });
  }
};

export default autostatus;
