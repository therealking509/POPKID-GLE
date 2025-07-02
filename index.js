// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import {
  makeWASocket,
  Browsers,
  fetchLatestBaileysVersion,
  DisconnectReason,
  useMultiFileAuthState,
} from '@whiskeysockets/baileys';

import { Handler, Callupdate, GroupUpdate } from './popkid/popkidd/popkiddd.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import NodeCache from 'node-cache';
import path from 'path';
import chalk from 'chalk';
import moment from 'moment-timezone';
import axios from 'axios';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
import { File } from 'megajs';
import { fileURLToPath } from 'url';
import http from 'http';

const { emojis, doReact } = pkg;

const sessionName = "session";
const app = express();
const PORT = process.env.PORT || 3000;
let useQR = false;
let initialConnection = true;

const MAIN_LOGGER = pino({
  timestamp: () => `,"time":"${new Date().toJSON()}"`
});
const logger = MAIN_LOGGER.child({});
logger.level = "trace";

const msgRetryCounterCache = new NodeCache();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });

async function downloadSessionData() {
  try {
    if (!config.SESSION_ID) {
      console.error('❌ Please add your session to SESSION_ID env!');
      return false;
    }

    const sessdata = config.SESSION_ID.split("POPKID;;;")[1];
    if (!sessdata || !sessdata.includes("#")) {
      console.error('❌ Invalid SESSION_ID format!');
      return false;
    }

    const [fileID, decryptKey] = sessdata.split("#");
    const file = File.fromURL(`https://mega.nz/file/${fileID}#${decryptKey}`);

    console.log("🔄 Downloading Session...");
    const data = await new Promise((resolve, reject) => {
      file.download((err, data) => err ? reject(err) : resolve(data));
    });

    await fs.promises.writeFile(credsPath, data);
    console.log("🔒 Session Successfully Loaded!");
    return true;

  } catch (error) {
    console.error('❌ Failed to download session data:', error.message);
    return false;
  }
}

const lifeQuotes = [
  "The only way to do great work is to love what you do.",
  "Strive not to be a success, but rather to be of value.",
  "The mind is everything. What you think you become.",
  "Life is what happens when you're busy making other plans.",
  "Be the change that you wish to see in the world.",
  "It is never too late to be what you might have been.",
  "The journey of a thousand miles begins with a single step."
];

async function updateBio(Matrix) {
  try {
    const now = moment().tz('Africa/Nairobi');
    const bio = `🧛‍♋️ ᵐᵒᴿᵋᴿ ᵘᴽᴼ ACTIVE 🧛‍♋️ ${now.format('HH:mm:ss')} | ${lifeQuotes[Math.floor(Math.random() * lifeQuotes.length)]}`;
    await Matrix.updateProfileStatus(bio);
    console.log(chalk.yellow(`ℹ️ Bio updated to: "${bio}"`));
  } catch (err) {
    console.error(chalk.red('❌ Bio update failed:'), err.message);
  }
}

async function updateLiveBio(Matrix) {
  try {
    const now = moment().tz('Africa/Nairobi');
    await Matrix.updateProfileStatus(`🧛‍♋️ ᵐᵒᴿᵋᴿ ᵘᴽᴼ ACTIVE 🧛‍♋️ ${now.format('HH:mm:ss')}`);
  } catch (err) {
    console.error(chalk.red('❌ Live bio update failed:'), err.message);
  }
}

async function start() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    console.log(`📆 WhatsApp version: ${version.join('.')}`);

    const Matrix = makeWASocket({
      version,
      logger: pino({ level: 'silent' }),
      printQRInTerminal: useQR,
      browser: ["popkid", "safari", "3.3"],
      auth: state,
      getMessage: async () => ({
        conversation: "popkid md whatsapp user bot"
      })
    });

    Matrix.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
      if (connection === 'close') {
        const reason = lastDisconnect?.error?.output?.statusCode;
        console.log(chalk.red(`❌ Disconnected [Reason: ${reason}]`));
        if (reason !== DisconnectReason.loggedOut) start();
      } else if (connection === 'open') {
        console.log(chalk.green("✅ POPKID MD is now ONLINE"));

        // ✅ Join Group
        try {
          await Matrix.groupAcceptInvite("FHDEPkBBf281sUcdj17eU9");
          console.log(chalk.green("✅ Successfully joined group."));
        } catch (err) {
          console.error(chalk.red("❌ Failed to join group: " + err.message));
        }

        // ✅ Follow newsletter (no duplicates)
        try {
          await Matrix.newsletterFollow("120363420342566562@newsletter");
          console.log(chalk.cyan("📨 Followed POPKID newsletter."));
        } catch (err) {
          console.error(chalk.red("❌ Failed to follow newsletter: " + err.message));
        }

        // ✅ Status bio + image
        await updateBio(Matrix);
        const welcomeImg = { url: 'https://files.catbox.moe/alnj32.jpg' };

        await Matrix.sendMessage(Matrix.user.id, {
          image: welcomeImg,
          caption: `╔═════ ∘◦ ✧ ✦ ✧ ◦∘ ═════╗
🅟🅞🅟🅚🅘🅓 • 🅧🅜🅓 • 🅢🅨🅢
╚═════ ∘◦ ✧ ✦ ✧ ◦∘ ═════╝

💻 BOT:       𝙿𝙾𝙿𝙺𝙸𝙳 𝚇𝙼𝙳  
🧑‍💼 OWNER:     👑 ᴘᴏᴘᴋɪᴅ  
🛠️ MODE:      ${config.MODE.toUpperCase()}  
🎮 PREFIX:    ${config.PREFIX}  
📡 STATUS:    ✅ 𝗢𝗡𝗟𝗜𝗡𝗘 • 𝗥𝗘𝗔𝗗𝗬 • 𝗙𝗜𝗥𝗘

🕶️ ᴘᴏᴘᴋɪᴅ ᴅᴏᴇꜱɴ'ᴛ ᴄʀᴀꜱʜ, ʜᴇ ʀᴇʙᴏᴏᴛꜱ.
═══════════════════════════`,
          contextInfo: {
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363420342566562@newsletter',
              newsletterName: "popkid xmd ʙᴏᴛ",
              serverMessageId: -1,
            },
            externalAdReply: {
              title: "ᴘᴏᴘᴋɪᴅ xᴍᴅ ʙᴏᴛ",
              body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴘᴏᴘᴋɪᴅ",
              thumbnailUrl: 'https://files.catbox.moe/nk71o3.jpg',
              sourceUrl: 'https://whatsapp.com/channel/0029VajweHxKQuJP6qnjLM31',
              mediaType: 1,
              renderLargerThumbnail: false,
            },
          },
        });

        if (!global.isLiveBioRunning) {
          global.isLiveBioRunning = true;
          setInterval(() => updateLiveBio(Matrix), 60 * 1000);
        }

        initialConnection = false;
      }
    });

    Matrix.ev.on('creds.update', saveCreds);
    Matrix.ev.on("messages.upsert", async (chatUpdate) => {
      if (!chatUpdate.messages?.length) return;
      await Handler(chatUpdate, Matrix, logger);

      try {
        const mek = chatUpdate.messages[0];
        if (!mek.key.fromMe && config.AUTO_REACT && mek.message) {
          const emoji = emojis[Math.floor(Math.random() * emojis.length)];
          await doReact(emoji, mek, Matrix);
        }
      } catch (err) {
        console.error('❌ Auto-react failed:', err.message);
      }
    });

    Matrix.ev.on("call", (json) => Callupdate(json, Matrix));
    Matrix.ev.on("group-participants.update", (msg) => GroupUpdate(Matrix, msg));
    Matrix.public = config.MODE === "public";

  } catch (err) {
    console.error('❌ Startup Error:', err.stack || err.message);
    process.exit(1);
  }
}

async function init() {
  global.isLiveBioRunning = false;
  if (fs.existsSync(credsPath)) {
    console.log("🔒 Session file exists. Starting...");
    await start();
  } else {
    const ok = await downloadSessionData();
    if (ok) {
      console.log("✅ Session downloaded successfully.");
      await start();
    } else {
      console.log("📸 Starting in QR mode...");
      useQR = true;
      await start();
    }
  }
}

init();

// Express UI
app.use(express.static(path.join(__dirname, 'mydata')));
app.get('/', (_, res) => res.sendFile(path.join(__dirname, 'mydata', 'index.html')));

// Keepalive ping
const SELF_URL = process.env.SELF_URL || `http://localhost:${PORT}`;
setInterval(() => {
  axios.get(SELF_URL).catch(() => {});
}, 4 * 60 * 1000);

// Start Express server
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
