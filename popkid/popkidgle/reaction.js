// 🌀 Popkid-GLE | Reaction Commands
import axios from 'axios';
import config from '../../config.cjs';

const baseUrl = 'https://nekos.best/api/v2/';

// ✅ Supported Reaction Types
const reactions = [
  'bonk', 'bully', 'yeet', 'slap', 'nom', 'poke', 'awoo', 'wave', 'smile',
  'dance', 'smug', 'blush', 'cringe', 'sad', 'happy', 'cuddle', 'hug',
  'glomp', 'handhold', 'highfive', 'kick', 'kill', 'kiss', 'cry', 'bite',
  'lick', 'pat'
];

// 🔁 Create Commands for Each Reaction
const commands = {};
for (const type of reactions) {
  commands[type] = async (m, Matrix) => {
    const prefix = config.PREFIX;
    const cmd = m.body.toLowerCase().startsWith(`${prefix}${type}`);
    if (!cmd) return;

    const mention = m.mentionedJid?.[0] || m.quoted?.sender || '';
    const mentionTag = mention ? `@${mention.split('@')[0]}` : '';

    try {
      const res = await axios.get(`${baseUrl}${type}`);
      const url = res.data?.results?.[0]?.url;

      if (!url) throw new Error('No media');

      await Matrix.sendMessage(m.from, {
        image: { url },
        caption: `💥 *${type.toUpperCase()}!* ${mentionTag}`,
        contextInfo: {
          mentionedJid: mention ? [mention] : [],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363290715861418@newsletter',
            newsletterName: 'Popkid-Xmd',
            serverMessageId: 99
          }
        }
      }, { quoted: m });
    } catch (err) {
      console.error(`[Reaction: ${type}] Error:`, err);
      await Matrix.sendMessage(m.from, {
        text: `❌ *Reaction Failed:* Couldn't fetch a "${type}" image.`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363290715861418@newsletter',
            newsletterName: 'Popkid-Xmd',
            serverMessageId: 99
          }
        }
      }, { quoted: m });
    }
  };
}

export default commands;
