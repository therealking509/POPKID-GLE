import config from '../../config.cjs';
import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./data/autoblock-codes.json');

// Load blocked codes from file at startup
let blockedCodes = new Set();
try {
  const fileData = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '[]';
  blockedCodes = new Set(JSON.parse(fileData));
} catch (err) {
  console.error("❌ Failed to load autoblock codes:", err);
  blockedCodes = new Set();
}

// Save to file
function saveBlockedCodes() {
  fs.writeFileSync(filePath, JSON.stringify([...blockedCodes], null, 2));
}

const autoblockCountryCommand = async (m, Matrix) => {
  const botNumber = await Matrix.decodeJid(Matrix.user.id);
  const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
  const prefix = config.PREFIX;

  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/);

  if (cmd !== 'autoblock') return;
  if (!isCreator) return m.reply('⛔ *OWNER ACCESS ONLY*');

  if (args[0] === 'list') {
    const list = [...blockedCodes].map(c => `+${c}`).join('\n• ') || 'None';
    return m.reply(`📛 *Blocked Country Codes:*\n• ${list}`);
  }

  if (args[0] === 'off') {
    const remove = args.slice(1).filter(c => /^\d{1,4}$/.test(c));
    if (!remove.length) return m.reply('❗ *Provide numeric country codes to remove*');
    remove.forEach(c => blockedCodes.delete(c));
    saveBlockedCodes();
    return m.reply(`✅ Removed: ${remove.map(c => `+${c}`).join(', ')}`);
  }

  const codes = args.filter(c => /^\d{1,4}$/.test(c));
  if (!codes.length) {
    return m.reply(
`⚙️ *AutoBlock Command*

Usage:
• \`${prefix}autoblock 234 256\` — Enable
• \`${prefix}autoblock off 256\` — Disable
• \`${prefix}autoblock list\` — View current`
    );
  }

  codes.forEach(c => blockedCodes.add(c));
  saveBlockedCodes();
  return m.reply(`🔒 Enabled for: ${codes.map(c => `+${c}`).join(', ')}`);
};

export default autoblockCountryCommand;
export { blockedCodes };
