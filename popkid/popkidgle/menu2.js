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

  // Section Response Handler (If reply is "1", "2", etc.)
  if (/^[1-6]$/.test(m.body)) {
    const section = menuSections[m.body];
    if (section) {
      return m.reply(`📘 *Section ${m.body}:*\n${section}`);
    }
  }

  // Main Menu Command
  if (cmd === "menu2") {
    const start = Date.now();
    await m.React('📱');
    const responseTime = (Date.now() - start) / 1000;

    let profilePictureUrl = 'https://files.catbox.moe/kiy0hl.jpg';
    try {
      const pp = await sock.profilePictureUrl(m.sender, 'image');
      if (pp) profilePictureUrl = pp;
    } catch {}

    const mainMenu = `
╭━━━〔 *🤖 ${config.BOT_NAME} - Menu Sections* 〕━━━◉
│✨ *Bot Speed:* ${responseTime.toFixed(2)}s
│🚀 *Version:* 7.1.0
│👑 *Owner:* ${config.OWNER_NAME}
╰━━━━━━━━━━━━━━━━━━━━━━━◉

Reply with a number to view that section:
╭──〔 🗂️ Available Sections 〕──◆
│1️⃣ System Menu
│2️⃣ Owner Tools
│3️⃣ GPT / AI Zone
│4️⃣ Media / Downloader
│5️⃣ Search Tools
│6️⃣ Fun Tools
╰──────────────────────────◆

🧾 Uptime: Coming Soon...
📢 Developer: *Popkid-Xmd*
    `.trim();

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: mainMenu,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
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
