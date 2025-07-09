import config from '../../config.cjs';
import { setAutoStatus, setAutoStatusMessage, isAutoStatusOn, getAutoStatusMessage } from '../../lib/autostatus.js';

const autostatus = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const args = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'autostatusreply') {
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
      replyMsg = `📨 Reply message set to:\n\n"${newMsg}"`;
    } else {
      replyMsg = `🛠 *AutoStatus Settings:*\nStatus: ${isAutoStatusOn() ? '🟢 ON' : '🔴 OFF'}\nMessage: "${getAutoStatusMessage()}"`;
    }

    await sock.sendMessage(m.from, { text: replyMsg }, { quoted: m });
  }
};

export default autostatus;
