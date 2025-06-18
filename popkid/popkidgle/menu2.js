import config from '../../config.cjs';

const menu = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const text = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd === "menu2") {
    const start = new Date().getTime();
    await m.React('🧬');
    const end = new Date().getTime();
    const responseTime = ((end - start) / 1000).toFixed(2);

    let profilePictureUrl = 'https://files.catbox.moe/kiy0hl.jpg';
    try {
      const pp = await sock.profilePictureUrl(m.sender, 'image');
      if (pp) profilePictureUrl = pp;
    } catch (err) {
      console.error('PP Fetch Error:', err);
    }

    const menuText = `
┏━━━━━━━━━━━[ ⚙️ POPKID-XMD DASHBOARD ⚙️ ]━━━━━━━━━━━┓
┃ 📦 Status: ONLINE   ⚡ Uptime: ${responseTime}s
┃ 🧑‍💻 Dev: POPKID-XMD | 🌐 Version: 7.1.0
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

╭───[ 🔧 SYSTEM MENU ]─────────────
│ 🧿 ${prefix}menu     🔋 ${prefix}alive
│ 👤 ${prefix}owner    🧰 ${prefix}status
╰─────────────────────────────────

╭───[ 👑 OWNER CONTROLS ]──────────
│ 🔗 ${prefix}join      ❌ ${prefix}leave
│ 🎭 ${prefix}setppbot  📌 ${prefix}autobio
│ 🔒 ${prefix}block     🔓 ${prefix}unblock
│ 💬 ${prefix}setstatus 📛 ${prefix}setnamebot
│ 🚫 ${prefix}anticall  🌀 ${prefix}autolikestatus
╰─────────────────────────────────

╭───[ 🤖 AI TOOLS ]────────────────
│ 💡 ${prefix}ai        🧠 ${prefix}gpt
│ 🐞 ${prefix}bug       🛡️ ${prefix}report
│ 🤖 ${prefix}chatbot   🎨 ${prefix}dalle
╰─────────────────────────────────

╭───[ 📤 CONVERTERS ]─────────────
│ 🔤 ${prefix}attp      🖼️ ${prefix}gimage
│ 🎧 ${prefix}play      🎥 ${prefix}video
╰─────────────────────────────────

╭───[ 🔍 SEARCH ENGINES ]─────────
│ 🔎 ${prefix}google    🎵 ${prefix}lyrics
│ 📥 ${prefix}mediafire 📺 ${prefix}imdb
│ 📸 ${prefix}instagram 🎬 ${prefix}facebook
│ 📱 ${prefix}tiktok
╰─────────────────────────────────

╭───[ 🎲 FUN ZONE ]───────────────
│ 🖼️ ${prefix}getpp     🌐 ${prefix}url
╰─────────────────────────────────

📡 *Your system is fully armed.*
🧬 Type any command and dominate the grid!
⚡ Powered by Popkid-XMD
`;

    await sock.sendMessage(m.from, {
      image: { url: profilePictureUrl },
      caption: menuText.trim(),
      contextInfo: {
        forwardingScore: 10,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterName: "Popkid-Xmd",
          newsletterJid: "120363290715861418@newsletter",
        },
      },
    }, { quoted: m });
  }
};

export default menu;
