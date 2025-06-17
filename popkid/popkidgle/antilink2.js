import fs from 'fs';
import path from 'path';
import config from '../../config.cjs';

const dataFile = path.join('./data', 'antilink.json');
if (!fs.existsSync(dataFile)) fs.writeFileSync(dataFile, '{}');
let antilink = JSON.parse(fs.readFileSync(dataFile));

function saveAntilink() {
  fs.writeFileSync(dataFile, JSON.stringify(antilink, null, 2));
}

const antilinkHandler = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/);
  const text = args[0];
  const groupId = m.key.remoteJid;

  if (!m.isGroup) return;

  // 💬 .antilink [mode]
  if (cmd === 'antilink') {
    const mode = text?.toLowerCase();

    if (['off', 'delete', 'warn', 'kick'].includes(mode)) {
      antilink[groupId] = mode;
      saveAntilink();

      await sock.sendMessage(m.from, {
        image: { url: 'https://files.catbox.moe/959dyk.jpg' },
        caption: `✅ *Antilink mode updated!*\n\n🛡️ Group: *${m.pushName || 'Group'}*\n🔧 Mode: *${mode.toUpperCase()}*`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363290715861418@newsletter',
          },
        },
      }, { quoted: m });

    } else if (mode === 'status') {
      const current = antilink[groupId] || 'OFF';
      await sock.sendMessage(m.from, {
        image: { url: 'https://files.catbox.moe/959dyk.jpg' },
        caption: `🛡️ *Antilink Status*\n\n📍 Group: *${m.pushName || 'Group'}*\n📶 Current Mode: *${current.toUpperCase()}*`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363290715861418@newsletter',
          },
        },
      }, { quoted: m });
    } else {
      await sock.sendMessage(m.from, {
        text: `✳️ *Antilink Control*\n\nUse:\n`.concat(
          `• .antilink delete\n`,
          `• .antilink warn\n`,
          `• .antilink kick\n`,
          `• .antilink off\n`,
          `• .antilink status`
        ),
        contextInfo: {
          forwardingScore: 100,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterName: 'Popkid-Xmd',
            newsletterJid: '120363290715861418@newsletter',
          },
        }
      }, { quoted: m });
    }
    return;
  }

  // 🚨 Auto-Antilink detection
  if (antilink[groupId] && ['delete', 'warn', 'kick'].includes(antilink[groupId])) {
    const groupInviteRegex = /chat\.whatsapp\.com\/[A-Za-z0-9]{20,24}/;
    const isLink = groupInviteRegex.test(m.body);

    if (isLink && !m.key.fromMe) {
      const metadata = await sock.groupMetadata(groupId);
      const groupAdmins = metadata.participants.filter(p => p.admin).map(p => p.id);
      const isAdmin = groupAdmins.includes(m.key.participant);

      if (isAdmin) return; // don't take action on admins

      const mode = antilink[groupId];
      if (mode === 'delete') {
        await sock.sendMessage(m.from, {
          delete: m.key
        });
      } else if (mode === 'warn') {
        await sock.sendMessage(m.from, {
          text: `🚨 *Link Detected!* ${m.pushName}, please avoid posting group links.`,
          contextInfo: {
            forwardingScore: 100,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: 'Popkid-Xmd',
              newsletterJid: '120363290715861418@newsletter',
            },
          }
        }, { quoted: m });
      } else if (mode === 'kick') {
        await sock.groupParticipantsUpdate(m.from, [m.key.participant], 'remove');
        await sock.sendMessage(m.from, {
          text: `👢 Removed ${m.pushName} for posting a link.`,
          contextInfo: {
            forwardingScore: 100,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterName: 'Popkid-Xmd',
              newsletterJid: '120363290715861418@newsletter',
            },
          }
        });
      }
    }
  }
};

export default antilinkHandler;
