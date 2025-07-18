import config from '../../config.cjs';

const bc = async (m, gss) => {
    try {
        const botNumber = await gss.decodeJid(gss.user.id);
        const isCreator = [botNumber, config.OWNER_NUMBER + '@s.whatsapp.net'].includes(m.sender);
        const prefix = config.PREFIX;
        const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
        const text = m.body.slice(prefix.length + cmd.length).trim();

        if (cmd !== 'bc') return;

        if (!isCreator) return m.reply("*🚫 OWNER ONLY COMMAND!*");
        if (!text) return m.reply(`❗ Please provide a message to broadcast.\n\n📌 Example:\n${prefix}bc Hello groups!`);

        const startTime = new Date();
        const timeString = startTime.toLocaleString('en-GB', {
            weekday: 'short', day: '2-digit', month: 'short',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const groupChats = await gss.groupFetchAllParticipating();
        const groupIds = Object.keys(groupChats);

        if (groupIds.length === 0) return m.reply("❌ Bot is not in any groups.");

        const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';

        await gss.sendMessage(ownerJid, {
            text:
`🛰️ *Broadcast Initiated*

📤 *From:* @${m.sender.split("@")[0]}
🕒 *Time:* ${timeString}
📩 *Message:*
${text.slice(0, 120)}${text.length > 120 ? '...' : ''}

🔁 Sending to *${groupIds.length}* groups...`,
            mentions: [m.sender],
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363420342566562@newsletter",
                newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
                serverMessageId: 143
            }
        });

        m.reply(`📡 Broadcasting to *${groupIds.length}* groups...\n\n✅ Please wait...`);

        let successCount = 0;
        let failCount = 0;
        const failedGroups = [];

        for (const groupId of groupIds) {
            try {
                await gss.sendMessage(groupId, {
                    text:
`📢 *BROADCAST ANNOUNCEMENT*

${text}

────────────
🤖 Sent by admin at *${timeString}*`,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: "120363420342566562@newsletter",
                        newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
                        serverMessageId: 143
                    }
                });
                successCount++;
            } catch (e) {
                failCount++;
                failedGroups.push(groupId.split('@')[0]);
                console.error(`Failed in group ${groupId}: ${e.message}`);
            }
        }

        const endTime = new Date();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        const summary =
`✅ *Broadcast Completed*

🕒 *Time:* ${timeString}
⏱️ *Duration:* ${duration} seconds
📊 *Report:*
• Total: ${groupIds.length}
• ✅ Sent: ${successCount}
• ❌ Failed: ${failCount}

${failCount > 0 ? `🚫 *Failed Groups:*\n${failedGroups.map(id => `- ${id}`).join('\n')}` : ''}

📝 *Message Preview:*
${text.slice(0, 200)}${text.length > 200 ? '...' : ''}`;

        await m.reply(summary);

        await gss.sendMessage(ownerJid, {
            text: summary,
            mentions: [m.sender],
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363420342566562@newsletter",
                newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
                serverMessageId: 143
            }
        });

    } catch (err) {
        console.error("BC Command Error:", err);
        const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
        await gss.sendMessage(ownerJid, {
            text:
`❌ *Broadcast Failed*

🧨 Error: ${err.message}
🕒 Time: ${new Date().toLocaleString()}

Check logs for details.`,
            forwardedNewsletterMessageInfo: {
                newsletterJid: "120363420342566562@newsletter",
                newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
                serverMessageId: 143
            }
        });
        m.reply("🚫 An error occurred during the broadcast.");
    }
};

export default bc;
