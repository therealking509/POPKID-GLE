// 📁 popkidgle/antilink.js
import fs from 'fs';
import path from 'path';
import config from '../../config.cjs';

const antilinkFile = path.join('./data/antilink.json');
if (!fs.existsSync(antilinkFile)) fs.writeFileSync(antilinkFile, '{}');

const antilinkData = JSON.parse(fs.readFileSync(antilinkFile));

const saveAntilinkData = () => {
  fs.writeFileSync(antilinkFile, JSON.stringify(antilinkData, null, 2));
};

const groupLinkPattern = /chat\.whatsapp\.com\/[A-Za-z0-9]{22}/;

const antilinkHandler = async (m, sock) => {
  const isGroup = m.key.remoteJid.endsWith('@g.us');
  const sender = m.key.participant || m.key.remoteJid;
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const args = m.body.slice(prefix.length + cmd.length).trim().split(' ');
  const text = args.join(' ');

  if (cmd === 'antilink') {
    if (!isGroup) return await sock.sendMessage(m.from, { text: '❌ This command is only for groups.' }, { quoted: m });

    const groupId = m.from;

    if (args[0] === 'on') {
      antilinkData[groupId] = { enabled: true, mode: 'delete' };
      saveAntilinkData();
      return await sock.sendMessage(m.from, {
        image: { url: 'https://files.catbox.moe/959dyk.jpg' },
        caption: '✅ *Antilink Enabled*\nLinks will be blocked by *deleting them*. Use `.antilink mode` to change behavior.',
        contextInfo: {
          forwardingScore: 10,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363290715861418@newsletter',
          },
        }
      }, { quoted: m });
    }

    if (args[0] === 'off') {
      delete antilinkData[groupId];
      saveAntilinkData();
      return await sock.sendMessage(m.from, {
        image: { url: 'https://files.catbox.moe/959dyk.jpg' },
        caption: '❌ *Antilink Disabled*\nGroup is now open to links.',
        contextInfo: {
          forwardingScore: 10,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363290715861418@newsletter',
          },
        }
      }, { quoted: m });
    }

    if (args[0] === 'mode' && ['delete', 'kick', 'warn'].includes(args[1])) {
      if (!antilinkData[groupId]) return await sock.sendMessage(m.from, { text: '❗ Antilink is not active. Use `.antilink on` first.' }, { quoted: m });
      antilinkData[groupId].mode = args[1];
      saveAntilinkData();
      return await sock.sendMessage(m.from, {
        text: `✅ *Antilink mode set to* _${args[1]}_.`,
        contextInfo: {
          forwardingScore: 5,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363290715861418@newsletter',
          },
        }
      }, { quoted: m });
    }

    return await sock.sendMessage(m.from, {
      text: `⚙️ *Antilink Usage*\n\n• .antilink on/off\n• .antilink mode [kick|warn|delete]`,
      contextInfo: {
        forwardingScore: 3,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: 'Popkid-Xmd',
          newsletterJid: '120363290715861418@newsletter',
        },
      }
    }, { quoted: m });
  }

  // Auto-antispam if link detected
  if (isGroup && m.body && groupLinkPattern.test(m.body)) {
    const groupId = m.from;
    const groupSetting = antilinkData[groupId];
    if (groupSetting?.enabled) {
      let actionText = '';
      if (groupSetting.mode === 'kick') {
        await sock.groupParticipantsUpdate(groupId, [sender], 'remove');
        actionText = '🚫 User removed for sharing a group link!';
      } else if (groupSetting.mode === 'warn') {
        actionText = '⚠️ This is a warning! Group links are not allowed.';
      } else {
        await sock.sendMessage(groupId, { delete: m.key });
        actionText = '🗑️ Message deleted: No group links allowed.';
      }

      await sock.sendMessage(groupId, {
        text: actionText,
        contextInfo: {
          forwardingScore: 2,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363290715861418@newsletter',
          },
        }
      });
    }
  }
};

export default antilinkHandler;
