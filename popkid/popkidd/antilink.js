import { serialize } from '../../lib/Serializer.js';
import config from '../../config.cjs';

const antilinkSettings = {}; // { groupId: { mode: 'off' | 'delete' | 'warn' | 'kick', warnings: {} } }

export const handleAntilink = async (m, sock, logger, _isBotAdmins, _isAdmins, isCreator) => {
    const PREFIX = /^[\\/!#.]/;
    const isCOMMAND = (body) => PREFIX.test(body);
    const prefixMatch = isCOMMAND(m.body) ? m.body.match(PREFIX) : null;
    const prefix = prefixMatch ? prefixMatch[0] : '/';
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    let isBotAdmins = false;
    let isAdmins = false;

    if (m.isGroup) {
        try {
            const metadata = await sock.groupMetadata(m.from);
            const admins = metadata.participants.filter(p => p.admin !== null).map(p => p.id);
            const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';
            isBotAdmins = admins.includes(botNumber);
            isAdmins = admins.includes(m.sender);
        } catch (err) {
            console.error('Group metadata error:', err);
        }
    }

    // Initialize group settings if not present
    if (!antilinkSettings[m.from]) {
        antilinkSettings[m.from] = { mode: 'off', warnings: {} };
    }

    // Handle command
    if (cmd === 'antilink') {
        if (!m.isGroup) return await sock.sendMessage(m.from, {
            text: '⚠️ *This command is for group chats only.*'
        }, { quoted: m });

        if (!isBotAdmins) return await sock.sendMessage(m.from, {
            text: '❌ *Bot must be admin to manage Antilink.*'
        }, { quoted: m });

        if (!isAdmins && !isCreator) return await sock.sendMessage(m.from, {
            text: '🔒 *Only group admins can use this command.*'
        }, { quoted: m });

        const args = m.body.slice(prefix.length + cmd.length).trim().toLowerCase();
        const validModes = ['off', 'delete', 'warn', 'kick'];

        if (!validModes.includes(args)) {
            return await sock.sendMessage(m.from, {
                text: `🛡️ *Antilink Configuration:*\n\n` +
                      `🟢 Current Mode: *${antilinkSettings[m.from].mode.toUpperCase()}*\n\n` +
                      `📌 *Usage:*\n` +
                      `├ ${prefix}antilink off\n` +
                      `├ ${prefix}antilink delete\n` +
                      `├ ${prefix}antilink warn\n` +
                      `└ ${prefix}antilink kick`,
            }, { quoted: m });
        }

        antilinkSettings[m.from].mode = args;
        return await sock.sendMessage(m.from, {
            text: `✅ *Antilink mode set to: ${args.toUpperCase()}*`,
        }, { quoted: m });
    }

    // Detect link & take action
    const body = m.body || '';
    if (m.isGroup && /https?:\/\/[^\s]+/.test(body)) {
        const mode = antilinkSettings[m.from].mode;
        if (mode === 'off' || !isBotAdmins) return;

        const gclink = `https://chat.whatsapp.com/${await sock.groupInviteCode(m.from)}`;
        const isGroupLink = new RegExp(gclink, 'i').test(body);

        if (isGroupLink) return; // Ignore own group link
        if (isAdmins || isCreator) return; // Ignore admins/owner

        await sock.sendMessage(m.from, { delete: m.key });

        if (mode === 'delete') {
            return await sock.sendMessage(m.from, {
                text: `🗑️ *Link deleted. No further action taken.*`,
            });
        }

        if (!antilinkSettings[m.from].warnings[m.sender]) {
            antilinkSettings[m.from].warnings[m.sender] = 0;
        }
        antilinkSettings[m.from].warnings[m.sender] += 1;

        const userWarnings = antilinkSettings[m.from].warnings[m.sender];
        const maxWarnings = config.ANTILINK_WARNINGS || 3;

        if (mode === 'warn') {
            return await sock.sendMessage(m.from, {
                text: `⚠️ *Warning ${userWarnings}/${maxWarnings}*\n@${m.sender.split('@')[0]} — Links are *not allowed* here!`,
                mentions: [m.sender],
            }, { quoted: m });
        }

        if (mode === 'kick') {
            if (userWarnings >= maxWarnings) {
                await sock.groupParticipantsUpdate(m.from, [m.sender], 'remove');
                delete antilinkSettings[m.from].warnings[m.sender];
                return await sock.sendMessage(m.from, {
                    text: `🚫 *@${m.sender.split('@')[0]} was removed for sharing links after ${maxWarnings} warnings.*`,
                    mentions: [m.sender]
                });
            } else {
                return await sock.sendMessage(m.from, {
                    text: `⚠️ *Warning ${userWarnings}/${maxWarnings}*\n@${m.sender.split('@')[0]} — Do *not* share links here!`,
                    mentions: [m.sender],
                }, { quoted: m });
            }
        }
    }
};
