import { serialize } from '../lib/Serializer.js';

const antilinkSettings = {}; // In-memory database for each group
const warnedUsers = {}; // In-memory warning tracker

const NEWSLETTER_JID = "120363290715861418@newsletter";
const NEWSLETTER_NAME = "Popkid-Xmd";

export const antilink = {
  name: "antilink",
  description: "Manage anti-link settings in group",
  category: "moderation",
  async run(m, sock, { isBotAdmins, isAdmins, isCreator }) {
    const command = m.body.trim().split(/\s+/)[1]?.toLowerCase();
    const groupId = m.from;

    if (!m.isGroup) {
      return await sock.sendMessage(m.from, {
        text: "❌ This command is only for group chats.",
      }, { quoted: m });
    }

    if (!isAdmins) {
      return await sock.sendMessage(m.from, {
        text: "❌ Only admins can use this command.",
      }, { quoted: m });
    }

    if (!antilinkSettings[groupId]) antilinkSettings[groupId] = { mode: "off" };

    const modes = ["off", "delete", "warn", "kick", "status"];

    if (!m.command || !m.command.includes("antilink") || !command || !modes.includes(command)) {
      return await sock.sendMessage(m.from, {
        text: `🎛️ *Antilink Modes*\n\n- ${m.prefix}antilink delete\n- ${m.prefix}antilink warn\n- ${m.prefix}antilink kick\n- ${m.prefix}antilink off\n- ${m.prefix}antilink status`,
      }, { quoted: m });
    }

    if (command === "status") {
      return await sock.sendMessage(m.from, {
        text: `✅ *Antilink status:* ${antilinkSettings[groupId].mode}`,
      }, { quoted: m });
    }

    antilinkSettings[groupId].mode = command;
    return await sock.sendMessage(m.from, {
      text: `✅ Antilink mode updated to *${command.toUpperCase()}* successfully.`,
    }, { quoted: m });
  },
};

export const handleAntilink = async (m, sock, { isBotAdmins, isAdmins, isCreator }) => {
  if (!m.isGroup || !m.body) return;

  const groupId = m.from;
  if (!antilinkSettings[groupId] || antilinkSettings[groupId].mode === "off") return;

  const mode = antilinkSettings[groupId].mode;
  const isGroupLink = /(https?:\/\/)?chat\.whatsapp\.com\/[A-Za-z0-9]+/i.test(m.body);

  if (isGroupLink) {
    const gclink = `https://chat.whatsapp.com/${await sock.groupInviteCode(m.from)}`;
    const isOwnLink = new RegExp(gclink, 'i').test(m.body);

    if (isOwnLink || isAdmins || isCreator) return;

    const sender = m.sender;
    const mentions = [sender];

    if (mode === "delete" || mode === "kick" || mode === "warn") {
      await sock.sendMessage(m.from, {
        delete: {
          remoteJid: m.from,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant,
        },
      });
    }

    // Styled Forwarded Newsletter message
    const actionText = {
      delete: "🚫 Your message containing a group link has been deleted.",
      warn: "⚠️ You’ve been warned for sharing a group link.",
      kick: "🔴 You will be removed for sharing a group link.",
    };

    await sock.sendMessage(m.from, {
      text: `\`\`\`「 Group Link Detected 」\`\`\`\n\n@${sender.split("@")[0]} ${actionText[mode] || ""}`,
      contextInfo: {
        mentionedJid: mentions,
        forwardedNewsletterMessageInfo: {
          newsletterJid: NEWSLETTER_JID,
          newsletterName: NEWSLETTER_NAME,
          serverMessageId: m.id || "",
        },
      },
    });

    // Warn counter
    if (mode === "warn") {
      if (!warnedUsers[groupId]) warnedUsers[groupId] = {};
      if (!warnedUsers[groupId][sender]) warnedUsers[groupId][sender] = 0;

      warnedUsers[groupId][sender] += 1;
      if (warnedUsers[groupId][sender] >= 3) {
        await sock.groupParticipantsUpdate(m.from, [sender], "remove");
        delete warnedUsers[groupId][sender];
        await sock.sendMessage(m.from, {
          text: `🚫 @${sender.split("@")[0]} has been removed after 3 warnings.`,
          contextInfo: { mentionedJid: mentions },
        });
      }
    }

    if (mode === "kick") {
      setTimeout(async () => {
        await sock.groupParticipantsUpdate(m.from, [sender], "remove");
      }, 3000);
    }
  }
};
