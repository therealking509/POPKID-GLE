import { serialize } from '../../lib/Serializer.js';

const antilinkSettings = {}; // Group-level settings

const antilinkMenu = `
┏━━━『 🛡️ Antilink Configuration 🛡️ 』━━━┓
┃ 
┃ 1️⃣ Delete Links 🗑️
┃ 2️⃣ Warn Users ⚠️ (auto-kick after 3)
┃ 3️⃣ Instant Kick 🚪
┃ 
┃ Type a number to select mode
┃ Type "off" to disable antilink
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`;

const newsletterImage = 'https://files.catbox.moe/d1f4ab.jpg'; // Valid image URL

const respond = async (sock, jid, text, quoted, mentions = []) => {
  return sock.sendMessage(
    jid,
    {
      image: { url: newsletterImage },
      caption: text,
      mentions,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363290715861418@newsletter",
          newsletterName: "Popkid-Xmd",
        },
      },
    },
    { quoted }
  );
};

const getCommand = (body, prefix) =>
  body.startsWith(prefix) ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : '';

export const handleAntilink = async (m, sock, logger, isBotAdmins, isAdmins, isCreator) => {
  const prefix = (m.body.match(/^[\/!#.]/) || ["/"])[0];
  const cmd = getCommand(m.body, prefix);

  if (cmd !== 'antilink') return;

  const isGroup = m.isGroup;
  const args = m.body.slice(prefix.length + cmd.length).trim().split(/\s+/);
  const groupId = m.from;

  if (!isGroup) return respond(sock, groupId, '🚫 This command only works in groups.', m);
  if (!isBotAdmins) return respond(sock, groupId, '🤖 I need to be an admin first!', m);
  if (!isAdmins) return respond(sock, groupId, '🔒 Only admins can modify antilink settings.', m);

  if (args.length === 0 || args[0] === '') {
    return respond(sock, groupId, antilinkMenu, m);
  }

  const choice = args[0].toLowerCase();
  const initializeSetting = (action, warningLimit = 3) => ({
    enabled: true,
    action,
    warningLimit,
    warnedUsers: {},
  });

  switch (choice) {
    case '1':
      antilinkSettings[groupId] = initializeSetting('delete');
      return respond(sock, groupId, '🗑️ Links will be auto-deleted.', m);
    case '2':
      antilinkSettings[groupId] = initializeSetting('warn');
      return respond(sock, groupId, '⚠️ Users will be warned. 3 warnings = kick.', m);
    case '3':
      antilinkSettings[groupId] = initializeSetting('kick');
      return respond(sock, groupId, '🚪 Link sharers will be instantly kicked.', m);
    case 'off':
      delete antilinkSettings[groupId];
      return respond(sock, groupId, '🔓 Antilink disabled.', m);
    default:
      return respond(sock, groupId, `❌ Invalid option.\n${antilinkMenu}`, m);
  }
};

export const monitorLinks = async (m, sock, logger, isBotAdmins, isAdmins, isCreator) => {
  const groupId = m.from;
  const settings = antilinkSettings[groupId];
  if (!settings || !settings.enabled || !m.body) return;

  const sender = m.sender;
  const groupLinkRegex = /(?:https?:\/\/)?chat\.whatsapp\.com\/[a-zA-Z0-9_-]+/gi;
  const matchedLinks = m.body.match(groupLinkRegex);
  if (!matchedLinks || isAdmins || isCreator) return;

  const inviteCode = await sock.groupInviteCode(groupId);
  const selfLinkPattern = new RegExp(`(?:https?:\\/\\/)?chat\\.whatsapp\\.com\\/${inviteCode}`, 'i');

  const mention = [sender];

  const deleteMsg = async () => {
    try {
      await sock.sendMessage(groupId, {
        delete: {
          remoteJid: groupId,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant,
        },
      });
    } catch (err) {
      logger.error(`⚠️ Delete failed: ${err}`);
    }
  };

  for (const link of matchedLinks) {
    if (selfLinkPattern.test(link)) continue;

    const { action, warnedUsers, warningLimit } = settings;

    if (action === 'delete') {
      await deleteMsg();
      return respond(sock, groupId, `🗑️ Link deleted from @${sender.split("@")[0]}.`, m, mention);
    }

    if (action === 'warn') {
      warnedUsers[sender] = (warnedUsers[sender] || 0) + 1;
      await deleteMsg();

      if (warnedUsers[sender] >= warningLimit) {
        try {
          await sock.groupParticipantsUpdate(groupId, [sender], 'remove');
          await respond(sock, groupId, `🚷 @${sender.split("@")[0]} removed after ${warningLimit} warnings.`, m, mention);
          delete warnedUsers[sender];
        } catch (err) {
          logger.error(`❌ Kick failed: ${err}`);
          await respond(sock, groupId, `⚠️ Couldn’t kick @${sender.split("@")[0]}.`, m, mention);
        }
      } else {
        await respond(sock, groupId, `⚠️ @${sender.split("@")[0]} warned! (${warnedUsers[sender]}/${warningLimit})`, m, mention);
      }
    }

    if (action === 'kick') {
      await deleteMsg();
      try {
        await sock.groupParticipantsUpdate(groupId, [sender], 'remove');
        await respond(sock, groupId, `🚪 @${sender.split("@")[0]} was kicked for sharing a link.`, m, mention);
      } catch (err) {
        logger.error(`❌ Kick error: ${err}`);
        await respond(sock, groupId, `⚠️ Couldn’t kick @${sender.split("@")[0]}.`, m, mention);
      }
    }
  }
};
