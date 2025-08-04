import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';
import config from '../../config.cjs';

const updateCommand = async (m, sock) => {
  const prefix = config.PREFIX || '.';
  const cmdRaw = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';

  const sender = m.sender;
  const isOwner = sender === config.OWNER_NUMBER + '@s.whatsapp.net';

  if (!['update', 'restart', 'reboot'].includes(cmdRaw)) return;

  if (!isOwner) {
    return await sock.sendMessage(
      m.from,
      { text: '⛔ *Access Denied*\nOnly the bot owner can run this command.' },
      { quoted: m }
    );
  }

  if (cmdRaw === 'restart' || cmdRaw === 'reboot') {
    await sock.sendMessage(m.from, {
      text: `♻️ *Restart Command*\n\n✅ *Bot restarting...*`,
    }, { quoted: m });

    setTimeout(() => process.exit(0), 1000);
    return;
  }

  if (cmdRaw === 'update') {
    await sock.sendMessage(m.from, {
      text: '🔄 *Downloading update, please wait...*'
    }, { quoted: m });

    try {
      const zipUrl = 'https://github.com/devpopkid/POPKID-GLE/archive/refs/heads/main.zip';
      const zipPath = path.join(process.cwd(), 'update.zip');
      const tempExtractPath = path.join(process.cwd(), 'update_temp');

      // Download ZIP from GitHub
      const downloadZip = async () => {
        console.log('[+] Fetching ZIP file...');
        const res = await fetch(zipUrl);
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const buffer = await res.arrayBuffer();
        await fs.promises.writeFile(zipPath, Buffer.from(buffer));
      };

      await downloadZip();

      const stat = fs.statSync(zipPath);
      if (stat.size < 1000) throw new Error('Downloaded ZIP too small or invalid.');

      console.log('[+] ZIP downloaded. Extracting...');
      await fs.promises.mkdir(tempExtractPath, { recursive: true });

      await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: tempExtractPath }))
        .promise();

      const extractedFolders = fs.readdirSync(tempExtractPath)
        .filter(f => fs.statSync(path.join(tempExtractPath, f)).isDirectory());

      if (!extractedFolders.length) throw new Error('No folder found in ZIP.');

      const extractedPath = path.join(tempExtractPath, extractedFolders[0]);

      // Recursive copy with exclusions
      const copyRecursive = (src, dest) => {
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);

          // Exclude specific config files
          if (['.env', 'config.cjs'].includes(entry.name)) continue;

          if (entry.isDirectory()) {
            if (!fs.existsSync(destPath)) fs.mkdirSync(destPath);
            copyRecursive(srcPath, destPath);
          } else {
            fs.copyFileSync(srcPath, destPath);
          }
        }
      };

      console.log('[+] Copying files...');
      copyRecursive(extractedPath, process.cwd());

      console.log('[+] Cleaning up...');
      fs.unlinkSync(zipPath);
      fs.rmSync(tempExtractPath, { recursive: true, force: true });

      // Send message with restart button
      await sock.sendMessage(m.from, {
        text: `✅ *Update complete!*\n\nPress the button below to restart the bot and apply updates.`,
        buttons: [
          {
            buttonId: `${prefix}restart`,
            buttonText: { displayText: '🔁 Restart Now' },
            type: 1
          }
        ],
        footer: 'POP Bot Updater',
        headerType: 1
      }, { quoted: m });

    } catch (err) {
      console.error('Update error:', err);
      await sock.sendMessage(m.from, {
        text: `❌ *Update failed.*\n\n${err.message}`
      }, { quoted: m });
    }
  }
};

export default updateCommand;
