import config from '../../config.cjs';
import ytSearch from 'yt-search';
import fetch from 'node-fetch';

const forwardedNewsletterMessageInfo = {
  newsletterJid: "120363420342566562@newsletter",
  newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
  serverMessageId: 143
};

const play = async (message, client) => {
  const prefix = config.PREFIX;
  const cmd = message.body.startsWith(prefix)
    ? message.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : '';
  const query = message.body.slice(prefix.length + cmd.length).trim();

  if (cmd === 'play3') {
    if (!query) {
      return message.reply("❌ Please provide a search query!");
    }

    await message.react('🎧');

    try {
      const searchResults = await ytSearch(query);
      if (!searchResults.videos.length) {
        return message.reply("❌ No results found!");
      }

      const video = searchResults.videos[0];
      const caption = `
╭━━〔  𝗣𝗼𝗽𝗞𝗶𝗱 𝗠𝗲𝗱𝗶𝗮 𝗣𝗹𝗮𝘆𝗲𝗿 〕━━⬣
┃🍿 *Title:* ${video.title}
┃⏱️ *Duration:* ${video.timestamp}
┃📈 *Views:* ${video.views}
┃📺 *Channel:* ${video.author.name}
╰━━━━━━━━━━━━━━━━━━━━⬣

*Reply with one of the following:*
1️⃣ Video
2️⃣ Audio
3️⃣ Video (Document)
4️⃣ Audio (Document)
`;

      const optionsMsg = await client.sendMessage(message.from, {
        image: { url: video.thumbnail },
        caption,
        contextInfo: {
          mentionedJid: [message.sender],
          ...forwardedNewsletterMessageInfo
        }
      }, { quoted: message });

      const optionsMsgId = optionsMsg.key.id;
      const videoUrl = video.url;

      client.ev.on('messages.upsert', async ({ messages }) => {
        const response = messages[0];
        if (!response.message) return;

        const selectedOption = response.message.conversation ||
          response.message.extendedTextMessage?.text;
        const chatJid = response.key.remoteJid;
        const isResponseToOptions = response.message.extendedTextMessage?.contextInfo?.stanzaId === optionsMsgId;

        if (isResponseToOptions) {
          await client.sendMessage(chatJid, {
            react: { text: '🤳', key: response.key }
          });

          let apiUrl, format, mimeType, responseText;
          switch (selectedOption) {
            case '1':
              apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`;
              format = "video";
              responseText = "🎬 *Downloaded Video*";
              break;
            case '2':
              apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${videoUrl}`;
              format = "audio";
              mimeType = "audio/mpeg";
              responseText = "🎧 *Downloaded Audio*";
              break;
            case '3':
              apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${videoUrl}`;
              format = "document";
              mimeType = "video/mp4";
              responseText = "📁 *Video (Document)*";
              break;
            case '4':
              apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp3?url=${videoUrl}`;
              format = "document";
              mimeType = "audio/mpeg";
              responseText = "📁 *Audio (Document)*";
              break;
            default:
              return client.sendMessage(chatJid, {
                text: "❌ Invalid selection! Reply with 1, 2, 3, or 4.",
                quoted: response
              });
          }

          // Simulate progress
          const progressMsg = await client.sendMessage(chatJid, {
            text: `🔄 Processing your request...\n\n[${' '.repeat(20)}] 0%`,
            quoted: response
          });

          for (let i = 5; i <= 100; i += 5) {
            const progress = Math.round(i / 5);
            const progressBar = '█'.repeat(progress) + ' '.repeat(20 - progress);
            await client.sendMessage(chatJid, {
              edit: progressMsg.key,
              text: `🔄 Processing your request...\n\n[${progressBar}] ${i}%`
            });
            await new Promise(res => setTimeout(res, 200));
          }

          try {
            const res = await fetch(apiUrl);
            const json = await res.json();
            if (!json.success) {
              return client.sendMessage(chatJid, {
                edit: progressMsg.key,
                text: "❌ Download failed. Try again."
              });
            }

            const downloadUrl = json.result.download_url;
            const mediaMessage = {
              [format]: { url: downloadUrl },
              mimetype: mimeType,
              caption: responseText,
              contextInfo: {
                mentionedJid: [message.sender],
                ...forwardedNewsletterMessageInfo
              }
            };

            if (format === 'document') {
              mediaMessage.fileName = `Popkid_${format.includes('audio') ? 'audio' : 'video'}.${mimeType.split('/')[1]}`;
            }

            await client.sendMessage(chatJid, { delete: progressMsg.key });
            await client.sendMessage(chatJid, mediaMessage, { quoted: response });

          } catch (err) {
            console.error(err);
            await client.sendMessage(chatJid, {
              edit: progressMsg.key,
              text: "❌ An error occurred while downloading."
            });
          }
        }
      });
    } catch (err) {
      console.error("Search error:", err);
      return message.reply("❌ An error occurred while searching.");
    }
  }
};

export default play;
