import config from '../config.cjs';

const report = async (m, gss) => {
  try {
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();
    const validCommands = ['calc', 'cal', 'calculater'];

    if (!validCommands.includes(cmd)) return;

    if (!text) {
      await m.React("❌");
      return m.reply(
        `╭───「 𝙈𝘼𝙏𝙃 」───╮\n` +
        `│ ⚠️ Please enter a math formula\n` +
        `│\n` +
        `│ ✏️ Example:\n` +
        `│ ${prefix}calc (22 + 7) ÷ 3\n` +
        `╰────────────────╯`
      );
    }

    const id = m.from;
    gss.math = gss.math ?? {};
    if (id in gss.math) {
      clearTimeout(gss.math[id][3]);
      delete gss.math[id];
      return m.reply('🧹 *Previous session cleared.*');
    }

    let raw = text
      .replace(/[^0-9\-\/+*×÷πEe()piPI.]/g, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/π|pi/gi, 'Math.PI')
      .replace(/e/gi, 'Math.E')
      .replace(/\/+/g, '/')
      .replace(/\++/g, '+')
      .replace(/-+/g, '-');

    let pretty = raw
      .replace(/Math\.PI/g, 'π')
      .replace(/Math\.E/g, 'e')
      .replace(/\//g, '÷')
      .replace(/\*/g, '×');

    const result = new Function(`return ${raw}`)();

    if (isNaN(result)) throw new Error("⚠️ Invalid expression. Example: `.calc 12 + 5`");

    const response = `
╭─『 🧠 𝙋𝙊𝙋𝙆𝙄𝘿 𝘾𝘼𝙇𝘾 』─╮
│ 🧾 *Expression:* ${pretty}
│ 📌 *Result:* _${result}_
╰────────────────────╯
    `.trim();

    await m.reply({
      text: response,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "120363420342566562@newsletter",
          newsletterName: "Popkid-Xmd 🧋",
          serverMessageId: 237
        }
      }
    });

    await m.React("🧮");

  } catch (err) {
    await m.React("❌");
    return m.reply(`🚫 *Error:* ${err?.message || "Something went wrong!"}`);
  }
};

export default report;
