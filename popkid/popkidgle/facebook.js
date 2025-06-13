import pkg, { prepareWAMessageMedia } from '@whiskeysockets/baileys';
const { generateWAMessageFromContent, proto } = pkg;
import getFBInfo from '@xaviabot/fb-downloader';
import config from '../../config.cjs';

const fbSearchResultsMap = new Map();
let fbSearchIndex = 1;

const facebookCommand = async (m, Matrix) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (['facebook', 'fb', 'fbdl'].includes(cmd)) {
    if (!text) return m.reply('❌ *Please provide a valid Facebook video URL.*');

    try {
      await m.React("🔍");

      const fbData = await getFBInfo(text);
      if (!fbData) {
        await m.reply('❌ *No downloadable video found.*');
        await m.React("❌");
        return;
      }

      const qualityList = [];
      if (fbData.sd) qualityList.push({ resolution: 'SD', url: fbData.sd });
      if (fbData.hd) qualityList.push({ resolution: 'HD', url: fbData.hd });

      if (qualityList.length === 0) {
        await m.reply('⚠️ *No SD or HD quality available for this video.*');
        return;
      }

      // Store in session map
      fbSearchResultsMap.set(fbSearchIndex, { ...fbData, qualityList });

      // Stylish numbered menu
      let menu = `
╭━━〔 *📥 POPKID-MD FACEBOOK DOWNLOADER* 〕━━⬣
┃ 📝 *Title:* ${fbData.title}
┃ 🌐 *Source:* Facebook
┃ 📊 *Qualities:* ${qualityList.length}
┃
┃ 💠 *Choose a download option below:*
┃
${qualityList.map((q, i) => `┃ ${i + 1}. ${q.resolution} Quality`).join('\n')}
┃
┃ ✏️ *Reply with the number (1-${qualityList.length})*
╰━━━━━━━━━━━━━━━━━━━━⬣
`;

      await Matrix.sendMessage(m.from, {
        image: { url: fbData.thumbnail },
        caption: menu.trim()
      }, { quoted: m });

      m.session = { fbKey: fbSearchIndex };
      fbSearchIndex++;

      await m.React("✅");

    } catch (error) {
      console.error("Facebook command error:", error);
      await m.reply('❌ *Error processing your request.*');
      await m.React("❌");
    }

  } else if (!isNaN(m.body.trim())) {
    const userChoice = parseInt(m.body.trim());
    const sessionKey = Object.keys(fbSearchResultsMap).pop();
    const fbResult = fbSearchResultsMap.get(parseInt(sessionKey));

    if (fbResult && fbResult.qualityList[userChoice - 1]) {
      try {
        await m.React("⬇️");

        const selected = fbResult.qualityList[userChoice - 1];
        const buffer = await getStreamBuffer(selected.url);
        const sizeMB = buffer.length / (1024 * 1024);

        if (sizeMB > 300) {
          await m.reply("🚫 *The video exceeds 300MB and cannot be sent.*");
        } else {
          await Matrix.sendMessage(m.from, {
            video: buffer,
            mimetype: 'video/mp4',
            caption: `✅ *Download Complete: ${selected.resolution}*\n\n🎥 *POPKID-MD BOT*`
          }, { quoted: m });
        }

        await m.React("✅");

      } catch (error) {
        console.error("Send error:", error);
        await m.reply('❌ *Failed to download or send video.*');
        await m.React("❌");
      }
    } else {
      await m.reply("❌ *Invalid option. Please select from the original list.*");
    }
  }
};

const getStreamBuffer = async (url) => {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return Buffer.from(buffer);
};

export default facebookCommand;
