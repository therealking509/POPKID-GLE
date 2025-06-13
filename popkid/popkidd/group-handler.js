import moment from 'moment-timezone';
import config from '../../config.cjs';

const fallbackPP = "https://i.ibb.co/fqvKZrP/ppdefault.jpg";
const TIMEZONE = 'Africa/Kenya';

export default async function GroupParticipants(sock, { id, participants, action }) {
   try {
      const metadata = await sock.groupMetadata(id);
      const groupName = metadata.subject;
      const membersCount = metadata.participants.length;

      for (const jid of participants) {
         let profilePic;
         try {
            profilePic = await sock.profilePictureUrl(jid, 'image');
         } catch {
            profilePic = fallbackPP;
         }

         const userName = jid.split('@')[0];
         const time = moment.tz(TIMEZONE).format('HH:mm:ss');
         const date = moment.tz(TIMEZONE).format('DD/MM/YYYY');

         const commonContext = {
            mentions: [jid],
            contextInfo: {
               externalAdReply: {
                  mediaType: 1,
                  previewType: 0,
                  renderLargerThumbnail: true,
                  thumbnailUrl: profilePic,
                  sourceUrl: 'https://github.com/Popkiddevs/POPKID-XTECH'
               }
            }
         };

         // ============ WELCOME ============
         if (action === 'add' && config.WELCOME) {
            const welcomeCaption = `
╭━━━[ 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 💫 ]━━━╮

👋 𝙃𝙚𝙡𝙡𝙤 @${userName}!
🎉 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙩𝙤 *${groupName}*
🔢 𝙔𝙤𝙪’𝙧𝙚 𝙢𝙚𝙢𝙗𝙚𝙧 #: *${membersCount}*
📅 𝘿𝙖𝙩𝙚: *${date}*
🕒 𝙏𝙞𝙢𝙚: *${time}*

💌 𝙈𝙖𝙠𝙚 𝙮𝙤𝙪𝙧𝙨𝙚𝙡𝙛 𝙖𝙩 𝙝𝙤𝙢𝙚!

╰━━━━━━━━━━━━━━━━━╯
🔗 POWERED BY *POPKID*
            `.trim();

            await sock.sendMessage(id, {
               image: { url: profilePic },
               caption: welcomeCaption,
               ...commonContext,
               contextInfo: {
                  ...commonContext.contextInfo,
                  externalAdReply: {
                     ...commonContext.contextInfo.externalAdReply,
                     title: '🎊 Welcome to the Realm',
                     body: `You're now part of ${groupName}`
                  }
               }
            });
         }

         // ============ GOODBYE ============
         if (action === 'remove' && config.WELCOME) {
            const goodbyeCaption = `
╭━━━[ 𝙂𝙊𝙊𝘿𝘽𝙔𝙀 💔 ]━━━╮

👋 𝙎𝙤 𝙡𝙤𝙣𝙜, @${userName}
🚪 𝙇𝙚𝙛𝙩 *${groupName}*
👥 𝙍𝙚𝙢𝙖𝙞𝙣𝙞𝙣𝙜: *${membersCount}*
📅 𝘿𝙖𝙩𝙚: *${date}*
🕒 𝙏𝙞𝙢𝙚: *${time}*

💭 𝙔𝙤𝙪 𝙬𝙞𝙡𝙡 𝙗𝙚 𝙢𝙞𝙨𝙨𝙚𝙙...

╰━━━━━━━━━━━━━━━━━╯
🔗 POWERED BY *POPKID*
            `.trim();

            await sock.sendMessage(id, {
               image: { url: profilePic },
               caption: goodbyeCaption,
               ...commonContext,
               contextInfo: {
                  ...commonContext.contextInfo,
                  externalAdReply: {
                     ...commonContext.contextInfo.externalAdReply,
                     title: '😢 Goodbye, fallen soldier',
                     body: `Farewell from ${groupName}`
                  }
               }
            });
         }
      }
   } catch (e) {
      console.error("❌ Error in GroupParticipants:", e);
   }
}
