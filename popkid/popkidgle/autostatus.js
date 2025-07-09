import config from '../../config.cjs';
import {
  setAutoStatus,
  setAutoStatusMessage,
  isAutoStatusOn,
  getAutoStatusMessage
} from '../../lib/autostatus.js';

const autostatus = async (m, sock) => {
  const prefix = config.PREFIX;
  const body = m.body || '';
  const cmd = body.startsWith(prefix) ? body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const args = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'autostatus') {
    let replyMsg = '';

    if (args === 'on') {
      setAutoStatus(true);
      replyMsg = '✅ AutoStatus is now *ON*.';
    } else if (args === 'off') {
      setAutoStatus(false);
      replyMsg = '❌ AutoStatus is now *OFF*.';
    } else if (args.startsWith('set ')) {
      const newMsg = args.slice(4);
      setAutoStatusMessage(newMsg);
      replyMsg = `📨 AutoStatus message updated:\n"${newMsg}"`;
    } else {
      replyMsg = `🛠 *AutoStatus Settings:*\nStatus: ${isAutoStatusOn() ? '🟢 ON' : '🔴 OFF'}\nReply: "${getAutoStatusMessage()}"`;
    }

    await sock.sendMessage(m.from, { text: replyMsg }, { quoted: m });
  }
};

export default autostatus;
