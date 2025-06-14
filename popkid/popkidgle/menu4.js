import config from '../../config.cjs';

const menuSections = {
  1: `
╭──〔 🛠️ *System Menu* 〕──◆
│⎘ ${config.PREFIX}menu
│✅ ${config.PREFIX}alive
│🧑‍💻 ${config.PREFIX}owner
│📍 ${config.PREFIX}ping
╰───────────────────────◆`,
  2: `
╭──〔 👑 *Owner Tools* 〕──◆
│🔒 ${config.PREFIX}block
│🔓 ${config.PREFIX}unblock
│📤 ${config.PREFIX}join
│📥 ${config.PREFIX}leave
│🧃 ${config.PREFIX}autolikestatus
│🧬 ${config.PREFIX}autobio
│👨‍💻 ${config.PREFIX}setppbot
│📛 ${config.PREFIX}setstatus
│✏️ ${config.PREFIX}setnamebot
╰───────────────────────◆`,
  3: `
╭──〔 🧠 *GPT / AI Zone* 〕──◆
│💬 ${config.PREFIX}ai
│🤖 ${config.PREFIX}gpt
│🖌️ ${config.PREFIX}dalle
│📣 ${config.PREFIX}chatbot
│🐞 ${config.PREFIX}bug
│📝 ${config.PREFIX}report
╰───────────────────────◆`,
  4: `
╭──〔 🎧 *Media / Downloader* 〕──◆
│🎶 ${config.PREFIX}play
│🎥 ${config.PREFIX}video
│📸 ${config.PREFIX}gimage
│💌 ${config.PREFIX}attp
╰───────────────────────◆`,
  5: `
╭──〔 🔍 *Search Tools* 〕──◆
│🌐 ${config.PREFIX}google
│📄 ${config.PREFIX}lyrics
│🎞️ ${config.PREFIX}imdb
│📦 ${config.PREFIX}mediafire
│📘 ${config.PREFIX}facebook
│📸 ${config.PREFIX}instagram
│🎵 ${config.PREFIX}tiktok
╰───────────────────────◆`,
  6: `
╭──〔 🎭 *Fun Tools* 〕──◆
│🖼️ ${config.PREFIX}getpp
│🔗 ${config.PREFIX}url
╰───────────────────────◆`,
};

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(' ')[0].toLowerCase()
    : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  // Handle reply by number or button ID (for sections 1-6)
  const sectionKey = m.body.trim() || m.buttonReply?.buttonId;
  if (/^[1-6]$/.test(sectionKey)) {
    const section = menuSections[sectionKey];
    if (section) return m.reply(`📘 *Section ${sectionKey}:*\n${section}`);
  }

  // Main menu command
  if (cmd === 'menu4') {
    const start = Date.now();
    await m.React('📱');
    const responseTime = (Date.now() - start) / 1000;

    let profilePictureUrl = 'https://files.catbox.moe/kiy0hl.jpg';
    try {
      const pp = await sock.profilePictureUrl(m.sender, 'image');
      if (pp) profilePictureUrl = pp;
    } catch {}

    const mainMenu = `
╭━━━〔 ꧁ *𝙿𝙾𝙿𝙺𝙸𝙳 𝚇𝙼𝙳 - 𝙼𝙴𝙽𝚄* ꧂ 〕━━━◉
│✨ 𝘽𝙤𝙩 𝙎𝙥𝙚𝙚𝙙: ${responseTime.toFixed(2)}s
│🚀 𝙑𝙚𝙧𝙨𝙞𝙤𝙣: 7.1.0
│👑 𝙊𝙬𝙣𝙚𝙧: ${config.OWNER_NAME}
╰━━━━━━━━━━━━━━━━━━━━━━━◉

✪ 𝙍𝙚𝙥𝙡𝙮 𝙤𝙧 𝙏𝙖𝙥 𝙖 𝙗𝙪𝙩𝙩𝙤𝙣:

╭──〔 🗂️ 𝘼𝙫𝙖𝙞𝙡𝙖𝙗𝙡𝙚 𝙎𝙚𝙘𝙩𝙞𝙤𝙣𝙨 〕──◆
│1️⃣ 𝚂𝚢𝚜𝚝𝚎𝚖 𝙼𝚎𝚗𝚞
│2️⃣ 𝙾𝚠𝚗𝚎𝚛 𝚃𝚘𝚘𝚕𝚜
│3️⃣ 𝙶𝙿𝚃 / 𝙰𝙸 𝚉𝚘𝚗𝚎
│4️⃣ 𝙼𝚎𝚍𝚒𝚊 / 𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚎𝚛
│5️⃣ 𝚂𝚎𝚊𝚛𝚌𝚑 𝚃𝚘𝚘𝚕𝚜
│6️⃣ 𝙵𝚞𝚗 𝚃𝚘𝚘𝚕𝚜
╰──────────────────────────◆

🧾 𝚄𝚙𝚝𝚒𝚖𝚎: Coming Soon...
📢 𝙳𝚎𝚟: *Popkid-Xmd*
    `.trim();

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: mainMenu,
      footer: '✨ Tap a button below or reply with a number.',
      buttons: [
        { buttonId: '1', buttonText: { displayText: '📁 System Menu' }, type: 1 },
        { buttonId: '2', buttonText: { displayText: '🛠 Owner Tools' }, type: 1 },
        { buttonId: '3', buttonText: { displayText: '🤖 AI / GPT' }, type: 1 },
        { buttonId: '4', buttonText: { displayText: '📥 Downloader' }, type: 1 },
        { buttonId: '5', buttonText: { displayText: '🔍 Search' }, type: 1 },
        { buttonId: '6', buttonText: { displayText: '🎭 Fun Tools' }, type: 1 },
        { buttonId: `${config.PREFIX}menu hacker`, buttonText: { displayText: '👾 Style: Hacker' }, type: 1 },
        { buttonId: `${config.PREFIX}menu font`, buttonText: { displayText: '🖋 Style: Fontish' }, type: 1 },
        { buttonId: `${config.PREFIX}menu neon`, buttonText: { displayText: '💡 Style: Neon' }, type: 1 }
      ],
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363290715861418@newsletter",
          newsletterName: "Popkid-Xmd"
        },
        externalAdReply: {
          title: `${config.BOT_NAME} | Menu`,
          body: `Developed by ${config.OWNER_NAME}`,
          thumbnailUrl: profilePictureUrl,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: 'https://github.com/PopkidOfficial'
        }
      }
    }, { quoted: m });
  }
};

export default menu;
