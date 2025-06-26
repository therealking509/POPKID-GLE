import dotenv from 'dotenv';
dotenv.config();

import {
    makeWASocket,
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
import axios from 'axios';
import config from './config.cjs';
import pkg from './lib/autoreact.cjs';
const { emojis, doReact } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;
let useQR = false;
let initialConnection = true;

const logger = pino({ level: 'trace', timestamp: () => `,"time":"${new Date().toJSON()}"` }).child({});
const msgRetryCounterCache = new NodeCache();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

async function downloadSessionData() {
    if (!config.SESSION_ID || !config.SESSION_ID.includes("Popkidmd$")) {
        console.error("❌ Invalid SESSION_ID format. Use: Popkidmd$<pastebinId>");
        return false;
    }
    const sessdata = config.SESSION_ID.split("Popkidmd$")[1];
    const url = `https://pastebin.com/raw/${sessdata}`;
    try {
        const response = await axios.get(url);
        const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        await fs.promises.writeFile(credsPath, data);
        console.log("🔒 Session Successfully Loaded!!");
        return true;
    } catch (error) {
        console.error("❌ Failed to download session:", error.message);
        return false;
    }
}

async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`🤖 POPKID-MD using WA v${version.join('.')}, isLatest: ${isLatest}`);

        const Matrix = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["POPKID-MD", "Safari", "3.3"],
            auth: state,
            getMessage: async () => ({ conversation: "POPKID-MD WhatsApp User Bot" }),
        });

        Matrix.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    console.log(chalk.red("🔄 Disconnected, restarting..."));
                    await start();
                }
            } else if (connection === 'open') {
                if (initialConnection) {
                    console.log(chalk.green("✅ Connected Successfully!"));

                    // Auto Join Group
                    try {
                        await Matrix.groupAcceptInvite("FHDEPkBBf281sUcdj17eU9");
                        console.log(chalk.green("✅ Joined POPKID group."));
                    } catch (e) {
                        console.error(chalk.red("❌ Failed to join group: " + e.message));
                    }

                    // Auto Follow Newsletter
                    try {
                        await Matrix.newsletterFollow("120363420342566562@newsletter");
                        console.log(chalk.green("✅ Followed POPKID-GLE newsletter."));
                    } catch (e) {
                        console.error(chalk.red("❌ Failed to follow newsletter: " + e.message));
                    }

                    // Welcome Message
                    try {
                        await Matrix.sendMessage(Matrix.user.id, {
                            image: { url: 'https://files.catbox.moe/shuljc.jpg' },
                            caption: `
╔═══════════════════════
║ ✅ *POPKID CONNECTED!*
╠═══════════════════════
║ ⚡ *DEVELOPER:* POPKID GLE
║ 📞 *DEV NUMBER:* +254111385747
╠═══════════════════════
║ 🔗 *PREFIX:* ${config.PREFIX}
║ 🌐 *DEPLOYED ON:* ${process.env.DEPLOYMENT_PLATFORM || 'Render'}
║ 🧭 *BOT MODE:* ${config.MODE.toUpperCase()}
╚═══════════════════════`,
                            contextInfo: {
                                isForwarded: true,
                                forwardingScore: 999,
                                forwardedNewsletterMessageInfo: {
                                    newsletterJid: "120363420342566562@newsletter",
                                    newsletterName: "POPKID-GLE",
                                    serverMessageId: -1,
                                },
                                externalAdReply: {
                                    title: "POPKID-GLE",
                                    body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ popkid-gle",
                                    thumbnailUrl: "https://files.catbox.moe/shuljc.jpg",
                                    sourceUrl: "https://whatsapp.com/channel/0029VbB6d0KKAwEdvcgqrH26",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        });
                        console.log(chalk.green("📩 Connection message sent."));
                    } catch (e) {
                        console.error(chalk.red("❌ Failed to send welcome message: " + e.message));
                    }

                    initialConnection = false;
                }
            }
        });

        Matrix.ev.on('creds.update', saveCreds);

        Matrix.ev.on("messages.upsert", async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                await Handler(chatUpdate, Matrix, logger);

                if (!mek.key.fromMe && config.AUTO_REACT && mek.message) {
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await doReact(randomEmoji, mek, Matrix);
                }
            } catch (err) {
                console.error('❌ Error in message handler:', err);
            }
        });

        Matrix.ev.on("call", async (json) => await Callupdate(json, Matrix));
        Matrix.ev.on("group-participants.update", async (update) => await GroupUpdate(Matrix, update));

        Matrix.public = config.MODE === "public";

    } catch (error) {
        console.error("🚨 Startup Error:", error.message);
        process.exit(1);
    }
}

async function init() {
    if (fs.existsSync(credsPath)) {
        console.log("🔒 Local session found, proceeding...");
        await start();
    } else {
        const downloaded = await downloadSessionData();
        if (downloaded) {
            console.log("🔓 Session downloaded. Starting...");
            await start();
        } else {
            console.log("🔑 No session found. QR will be printed.");
            useQR = true;
            await start();
        }
    }
}

init();

app.get('/', (req, res) => {
    res.send('💡 POPKID WhatsApp bot is running.');
});

app.listen(PORT, () => {
    console.log(`🌐 Express server running on port ${PORT}`);
});
