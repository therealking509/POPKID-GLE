import axios from "axios";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load config
const configPath = path.join(__dirname, '../config.cjs');
const config = await import(configPath).then(m => m.default || m).catch(() => ({}));

const update = async (m, sock) => {
  const prefix = config.PREFIX || '.';
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  if (cmd !== 'update') return;

  const botNumber = await sock.decodeJid(sock.user.id);
  if (m.sender !== botNumber) {
    return sock.sendMessage(m.from, {
      text: '🔐 *Access Denied*\nOnly the bot itself can perform updates!',
    }, { quoted: m });
  }

  await m.React('🧠');

  const thumb = 'https://files.catbox.moe/x0ohbm.jpg';
  const baseInfo = {
    image: { url: thumb },
    contextInfo: {
      forwardingScore: 5,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: "Popkid-Xmd",
        newsletterJid: "120363290715861418@newsletter",
      },
    },
  };

  const sendCaption = async (text) => {
    return sock.sendMessage(m.from, {
      ...baseInfo,
      caption: text,
    }, { quoted: m });
  };

  const editCaption = sendCaption;

  try {
    await sendCaption(`🛰️ *Popkid-Xmd Updater Initialized*\nChecking for latest commit...`);

    const { data: commitData } = await axios.get('https://api.github.com/repos/devpopkid/POPKID-GLX/commits/main');
    const latestCommit = commitData.sha;

    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    const currentHash = packageJson.commitHash || 'unknown';

    if (latestCommit === currentHash) {
      await m.React('✅');
      return editCaption(`✅ *Already Up-to-Date!*\n\nNo new changes found on the main branch.`);
    }

    await editCaption(`📥 *Update Available!*\nDownloading latest build from GitHub...`);

    const zipUrl = 'https://github.com/devpopkid/POPKID-GLE/archive/main.zip';
    const zipPath = path.join(process.cwd(), 'update.zip');
    const writer = fs.createWriteStream(zipPath);

    const response = await axios({ method: 'GET', url: zipUrl, responseType: 'stream' });
    response.data.pipe(writer);

    await new Promise((res, rej) => {
      writer.on('finish', res);
      writer.on('error', rej);
    });

    await editCaption(`🗜️ *Extracting update files...*`);

    const extractTo = path.join(process.cwd(), 'latest');
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractTo, true);

    await editCaption(`🔁 *Applying update to your bot instance...*`);

    const source = path.join(extractTo, 'POPKID-GLE-main');
    await copyFolderSync(source, process.cwd(), ['package.json', 'config.cjs', '.env']);

    packageJson.commitHash = latestCommit;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

    fs.unlinkSync(zipPath);
    fs.rmSync(extractTo, { recursive: true, force: true });

    await editCaption(`♻️ *Update Installed!*\nRestarting the bot in 3 seconds...`);

    setTimeout(() => process.exit(0), 3000);

  } catch (err) {
    console.error("❌ Update Failed:", err.message);
    await m.React("❌");
    return sock.sendMessage(m.from, {
      text: `🚨 *Update Failed!*\nReason: ${err.message}`,
    }, { quoted: m });
  }
};

async function copyFolderSync(src, dest, skip = []) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);
    if (skip.includes(item)) continue;
    const stat = fs.lstatSync(srcPath);
    if (stat.isDirectory()) {
      await copyFolderSync(srcPath, destPath, skip);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

export default update;
