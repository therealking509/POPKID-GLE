import config from '../../config.cjs';
import axios from 'axios';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

const gitclone = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "gitclone") {
    try {
      if (!text) {
        await m.React('❌');
        return sock.sendMessage(m.from, {
          text:
`🚀 *GitHub Repository Downloader*

❌ *Error:* No URL provided.
📌 *Usage:* ${prefix}gitclone <github-url>
🔗 *Example:* ${prefix}gitclone https://github.com/user/repo`,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363420342566562@newsletter",
              newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
              serverMessageId: 143,
            }
          }
        }, { quoted: m });
      }

      await m.React('⏳');

      const url = text.replace(/\.git$/, '');
      const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/i);

      if (!match) {
        await m.React('❌');
        return sock.sendMessage(m.from, {
          text:
`🚀 *GitHub Repository Downloader*

❌ *Error:* Invalid GitHub URL
🔗 *Expected Format:* https://github.com/user/repo
📌 *Example:* ${prefix}gitclone https://github.com/carl24tech/Buddy-XTR`,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363420342566562@newsletter",
              newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
              serverMessageId: 143,
            }
          }
        }, { quoted: m });
      }

      const [, owner, repo] = match;
      const downloadUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/main`;
      const fileName = `${repo}.zip`;

      let progressMessage = await sock.sendMessage(m.from, {
        text:
`🚀 *GitHub Repository Downloader*

🔍 *Initializing download...*

▰▱▱▱▱▱▱▱▱▱ 10%
📡 *Connecting to GitHub...*`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
            serverMessageId: 143,
          }
        }
      }, { quoted: m });

      const updateProgress = async (percentage, customStatus = '') => {
        const bar = '▰'.repeat(Math.floor(percentage / 10)).padEnd(10, '▱');
        let statusMsg = customStatus || (
          percentage < 30 ? '🌐 Connecting...' :
          percentage < 50 ? '⬇️ Downloading data...' :
          percentage < 70 ? '📦 Packaging files...' :
          percentage < 90 ? '🔧 Finalizing...' :
          '✅ Almost done...'
        );

        await sock.sendMessage(m.from, {
          text:
`🚀 *GitHub Repository Downloader*

🔍 *Downloading:* ${repo}

${bar} ${percentage}%
${statusMsg}`,
          edit: progressMessage.key,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "120363420342566562@newsletter",
              newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
              serverMessageId: 143,
            }
          }
        }, { quoted: m });
      };

      // Manual progress simulation since axios progressEvent is limited
      await updateProgress(30);
      const response = await axios({
        method: 'GET',
        url: downloadUrl,
        responseType: 'stream',
        headers: {
          'User-Agent': 'Node.js'
        }
      });

      await updateProgress(60);
      const writer = fs.createWriteStream(fileName);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      await updateProgress(90);
      await updateProgress(100, '✅ Download complete! Preparing file...');

      await sock.sendMessage(m.from, {
        document: fs.readFileSync(fileName),
        mimetype: 'application/zip',
        fileName,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
            serverMessageId: 143,
          }
        }
      }, { quoted: m });

      await sock.sendMessage(m.from, {
        text:
`🚀 *GitHub Repository Downloader*

✅ *Download Complete!*
📦 *File:* ${fileName}
🔗 *Source:* ${url}

▰▰▰▰▰▰▰▰▰▰ 100%
📤 *Status:* Sent successfully.`,
        edit: progressMessage.key,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
            serverMessageId: 143,
          }
        }
      }, { quoted: m });

      fs.unlinkSync(fileName); // Cleanup
      await m.React('✅');

    } catch (error) {
      console.error("GitClone Error:", error);
      await m.React('❌');

      const isNotFound = error?.response?.status === 404;

      const errorMessage =
`🚀 *GitHub Repository Downloader*

❌ *Error:* ${isNotFound ? 'Repository not found!' : 'Failed to download repository.'}
🔍 ${isNotFound
  ? 'Check if the repo is public, deleted, or URL is wrong.'
  : 'Check your connection or GitHub rate limit.'}`;

      await sock.sendMessage(m.from, {
        text: errorMessage,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "120363420342566562@newsletter",
            newsletterName: "PᴏᴘᴋɪᴅXᴛᴇᴄʜ",
            serverMessageId: 143,
          }
        }
      }, { quoted: m });
    }
  }
};

export default gitclone;
