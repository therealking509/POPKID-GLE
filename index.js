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
const { emojis, doReact } = pkg;

const app = express();
const PORT = process.env.PORT || 3000;
const orange = chalk.bold.hex("#FFA500");
const lime = chalk.bold.hex("#32CD32");
let useQR = false;
let initialConnection = true;

const MAIN_LOGGER = pino({ timestamp: () => `,"time":"${new Date().toJSON()}"` });
const logger = MAIN_LOGGER.child({});
logger.level = "trace";
const msgRetryCounterCache = new NodeCache();

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');

if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
}

async function downloadSessionData() {
    if (!config.SESSION_ID || !config.SESSION_ID.includes('Popkidmd$')) {
        console.error('❌ Invalid or missing SESSION_ID format. Expected POPKID$<pastebinId>');
        return false;
    }
    const sessdata = config.SESSION_ID.split("POPKID$")[1];
    const url = `https://pastebin.com/raw/${sessdata}`;
    try {
        const response = await axios.get(url);
        const data = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        await fs.promises.writeFile(credsPath, data);
        console.log("🔒 Session Successfully Loaded !!");
        return true;
    } catch (error) {
        console.error('❌ Failed to download session data:', error.message);
        return false;
    }
}

async function start() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
        const { version, isLatest } = await fetchLatestBaileysVersion();
        console.log(`🤖 POPKID-MD using WA v${version.join('.')}, isLatest: ${isLatest}`);

        const sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: useQR,
            browser: ["POPKID-MD", "Safari", "3.3"],
            auth: state,
            getMessage: async (key) => {
                return { conversation: "POPKID-MD whatsapp user bot" };
            }
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
                    console.log(chalk.red("⚠️ Disconnected... Reconnecting"));
                    await start();
                }
            } else if (connection === 'open') {
                console.log(chalk.green("✅ Connected successfully to WhatsApp!"));

                // Join group
                try {
                    await sock.groupAcceptInvite("FHDEPkBBf281sUcdj17eU9");
                    console.log(chalk.green("✅ Successfully joined group."));
                } catch (err) {
                    console.error(chalk.red("❌ Failed to join group: " + err.message));
                }

                // Follow newsletter
                try {
                    await sock.newsletterFollow("120363420342566562@newsletter");
                    console.log(chalk.green("✅ Followed POPKID-GLE newsletter."));
                } catch (err) {
                    console.error(chalk.red("❌ Failed to follow newsletter: " + err.message));
                }

                // Send welcome message
                const welcomeImg = { url: 'https://files.catbox.moe/alnj32.jpg' };
                try {
                    await sock.sendMessage(sock.user.id, {
                        image: welcomeImg,
                        caption: `
╔═════════════════
║ *✅ POPKID CONNECTED*
╠═════════════════
║ *⚡ DEV: POPKID GLE*
╚═════════════════
║ *⌛ NUM DEV: +254111385747*
╚═════════════════`,
                        contextInfo: {
                            isForwarded: true,
                            forwardingScore: 999,
                            forwardedNewsletterMessageInfo: {
                                newsletterJid: "120363420342566562@newsletter",
                                newsletterName: "POPKID-GLE",
                                serverMessageId: -1
                            },
                            externalAdReply: {
                                title: "POPKID-GLE",
                                body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ popkid-gle",
                                thumbnailUrl: "https://files.catbox.moe/alnj32.jpg",
                                sourceUrl: "https://whatsapp.com/channel/0029VadQrNI8KMqo79BiHr3l",
                                mediaType: 1,
                                renderLargerThumbnail: true
                            }
                        }
                    });
                    console.log(chalk.green("📩 Welcome message sent."));
                } catch (err) {
                    console.error(chalk.red("❌ Failed to send welcome message: " + err.message));
                }

                initialConnection = false;
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on("messages.upsert", async (chatUpdate) => {
            try {
                const mek = chatUpdate.messages[0];
                await Handler(chatUpdate, sock, logger);

                if (!mek.key.fromMe && config.AUTO_REACT && mek.message) {
                    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
                    await doReact(randomEmoji, mek, sock);
                }
            } catch (err) {
                console.error('❌ Error in message handler:', err);
            }
        });

        sock.ev.on("call", async (json) => await Callupdate(json, sock));
        sock.ev.on("group-participants.update", async (update) => await GroupUpdate(sock, update));

        if (config.MODE === "public") {
            sock.public = true;
        } else if (config.MODE === "private") {
            sock.public = false;
        }

    } catch (error) {
        console.error('🚨 Critical Error:', error);
        process.exit(1);
    }
}

async function init() {
    if (fs.existsSync(credsPath)) {
        console.log("🔒 Session file found, proceeding without QR code.");
        await start();
    } else {
        const sessionDownloaded = await downloadSessionData();
        if (sessionDownloaded) {
            console.log("🔒 Session downloaded, starting bot.");
            await start();
        } else {
            console.log("⚠️ No session found or downloaded, QR code will be printed for authentication.");
            useQR = true;
            await start();
        }
    }
}

init();

// Express test route
app.get('/', (req, res) => {
    res.send('💡 POPKID WhatsApp bot is running.');
});

app.listen(PORT, () => {
    console.log(`🌐 Express server running on port ${PORT}`);
});
