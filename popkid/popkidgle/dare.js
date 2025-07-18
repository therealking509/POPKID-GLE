import moment from 'moment-timezone';
import fs from 'fs';
import os from 'os';
import pkg from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import config from '../../config.cjs';

const dare = async (m, sock) => {
  const prefix = config.PREFIX;
  const pushName = m.pushName || 'User';

  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  if (cmd === "dare") {
    await m.React('🎲'); // Initial reaction

    const dares = [
      "Send the most embarrassing photo from your gallery.",
      "Call a random number and sing 'Happy Birthday'.",
      "Post 'I love pineapple on pizza' on your status for 1 hour.",
      "Text your crush saying 'I dreamt about you last night'.",
      "Let the group choose your profile picture for 24 hours.",
      "Eat a spoonful of hot sauce or wasabi.",
      "Try to lick your elbow and send a selfie attempting it.",
      "Let the group decide what you eat for your next meal.",
      "Do an interpretive dance of your favorite movie scene (video proof).",
      "Call a tech support hotline and ask how to download 'more RAM'.",
      "Text your mom: 'So... how do you feel about grandkids soon?'",
      "Post a screenshot of your YouTube homepage with the caption: 'Explain yourselves.'",
      "Wear socks on your hands for the next hour and send a pic.",
      "Put on a blindfold and let someone feed you a mystery food—guess what it is.",
      "Call a pizza place and order a 'spicy sadness pizza'.",
      "Go outside and yell 'I believe in aliens!' as loud as you can.",
      "Call a random business and ask if they offer 'exorcisms as a service.'"
      // You can append more here...
    ];

    const randomDare = dares[Math.floor(Math.random() * dares.length)];

    const dareMessage = `
┌──「 *𝘿𝘼𝙍𝙀 𝘾𝙃𝘼𝙇𝙇𝙀𝙉𝙂𝙀* 」──◆
│🎯 *Dare*: ${randomDare}
│🧑 *Requested by*: ${pushName}
│⏱️ *Time*: ${moment().format('HH:mm:ss')}
└───────────────◆
✨ Powered by *PopkidXtech*
`;

    await m.React('🔥'); // Final reaction

    await sock.sendMessage(
      m.from,
      {
        text: dareMessage.trim(),
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
            serverMessageId: 143,
          },
          externalAdReply: {
            title: "𝕯𝖆𝖗𝖊 𝕮𝖍𝖆𝖑𝖑𝖊𝖓𝖌𝖊 🎲",
            body: "Ready for the wildest challenge?",
            thumbnailUrl: "https://files.catbox.moe/ixttdp.jpg",
            sourceUrl: "https://whatsapp.com/channel/0029VbB6d0KKAwEdvcgqrH26",
            mediaType: 1,
            renderLargerThumbnail: true,
          },
        },
      },
      { quoted: m }
    );
  }
};

export default dare;
