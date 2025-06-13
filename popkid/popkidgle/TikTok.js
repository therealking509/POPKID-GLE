import config from '../../config.cjs';
import axios from 'axios';
import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

const tiktokdl = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const args = m.body.trim().split(' ').slice(1);
  const q = args.join(' ');
  const sender = m.pushName || 'User';
  const reply = (text) => sock.sendMessage(m.from, { text }, { quoted: m });

  if (cmd !== 'tiktokdl' && cmd !== 'tiktok') return;

  if (!q) {
    return reply(
      `❗ *Hey ${sender}, you forgot the TikTok link!*\n\n📌 *Usage:* \`${prefix}${cmd} https://vm.tiktok.com/xxxx\`\n\nMake sure it's a valid TikTok video link.`
    );
  }

  if (!q.includes('tiktok.com')) {
    return reply('🚫 *Invalid Link!*\nPlease provide a proper TikTok URL.');
  }

  await reply('🔄 *Processing your request...* ⏳');

  try {
    const apiUrl = `https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(q)}`;
    const { data } = await axios.get(apiUrl);

    if (!data?.status || !data?.data) {
      return reply('❌ *Failed to fetch video!*\nServer might be down or the link is broken.');
    }

    const { title, like, comment, share, author, meta } = data.data;
    const videoUrl = meta.media.find((m) => m.type === 'video')?.org;
    const views = meta?.play_count || 'N/A';

    if (!videoUrl) {
      return reply('⚠️ Could not retrieve video file from the server response.');
    }

    const caption = `
🎬 *TikTok Video Downloader*
────────────────────────
👤 *User:* ${author.nickname} (@${author.username})
📝 *Title:* ${title || 'No title available'}
👁️ *Views:* ${views}
❤️ *Likes:* ${like}
💬 *Comments:* ${comment}
🔗 *Shares:* ${share}
────────────────────────
✨ Powered by *POPKID XTECH*
`.trim();

    // Send the video with interactive buttons
    await sock.sendMessage(
      m.from,
      {
        video: { url: videoUrl },
        caption,
        footer: 'Choose an option below ⬇️',
        buttons: [
          {
            buttonId: `${prefix}menu`,
            buttonText: { displayText: '📜 Menu' },
            type: 1,
          },
          {
            buttonId: `${prefix}tiktokdl ${q}`,
            buttonText: { displayText: '🔁 Download Again' },
            type: 1,
          },
        ],
        headerType: 5,
        contextInfo: { mentionedJid: [m.sender] },
      },
      { quoted: m }
    );
  } catch (err) {
    console.error('🔥 TikTok Downloader Error:', err);
    return reply(
      `🚨 *Unexpected Error Occurred!*\n\nMessage: ${err.message || 'Unknown error'}`
    );
  }
};

export default tiktokdl;
