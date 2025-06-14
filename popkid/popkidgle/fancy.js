// file: commands/fancy.js

import config from '../../config.cjs';

const fonts = [
  { name: "Bold", map: '𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳', offset: 0x1D400 },
  { name: "Italic", map: '𝑎𝑏𝑐𝑑𝑒𝑓𝑔ℎ𝑖𝑗𝑘𝑙𝑚𝑛𝑜𝑝𝑞𝑟𝑠𝑡𝑢𝑣𝑤𝑥𝑦𝑧', offset: 0x1D434 },
  { name: "Bold Italic", map: '𝒂𝒃𝒄𝒅𝒆𝒇𝒈𝒉𝒊𝒋𝒌𝒍𝒎𝒏𝒐𝒑𝒒𝒓𝒔𝒕𝒖𝒗𝒘𝒙𝒚𝒛', offset: 0x1D468 },
  { name: "Script", map: '𝓪𝓫𝓬𝓭𝓮𝓯𝓰𝓱𝓲𝓳𝓴𝓵𝓶𝓷𝓸𝓹𝓺𝓻𝓼𝓽𝓾𝓿𝔀𝔁𝔂𝔃', offset: 0x1D4B6 },
  { name: "Bold Script", map: '𝓐𝓑𝓒𝓓...', offset: 0x1D4D0 },
  { name: "Fraktur", map: '𝔞𝔟𝔠𝔡𝔢...', offset: 0x1D504 },
  { name: "Bold Fraktur", map: '𝖆𝖇𝖈𝖉...', offset: 0x1D56C },
  { name: "Sans", map: '𝗮𝗯𝗰𝗱...', offset: 0x1D5A0 },
  { name: "Sans Italic", map: '𝘢𝘣𝘤𝘥...', offset: 0x1D608 },
  { name: "Sans Bold Italic", map: '𝙖𝙗𝙘𝙙...', offset: 0x1D63C },
  { name: "Monospace", map: '𝚊𝚋𝚌𝚍...', offset: 0x1D670 },
  { name: "Bubble", map: 'ⓐⓑⓒⓓ...', symbols: true },
  { name: "Square", map: '🄰🄱🄲🄳...', symbols: true },
  { name: "Tiny", map: 'ᵃᵇᶜᵈ...', symbols: true },
  { name: "Upside Down", fn: (t) => t.split('').reverse().map(c => upsideDownMap[c] || c).join('') },
  { name: "Wide", fn: (t) => t.split('').map(c => c === ' ' ? ' ' : String.fromCharCode(0xFF21 + c.charCodeAt(0) - 65)).join('') },
  { name: "Strike", fn: (t) => t.split('').map(c => c + '̶').join('') },
  { name: "Underline", fn: (t) => t.split('').map(c => c + '̲').join('') },
  { name: "Space Letter", fn: (t) => t.split('').join(' ') },
  { name: "Slash", fn: (t) => t.split('').join('/') },
  { name: "Circled", fn: (t) => t.split('').map(c => circled[c] || c).join('') },
  { name: "Tiny Caps", fn: (t) => t.toLowerCase().split('').map(c => tinyCaps[c] || c).join('') },
];

const fancyCommand = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  const args = m.body.slice(prefix.length + cmd.length).trim();

  if (cmd !== 'fancy') return;

  if (!args) {
    return m.reply(`❌ Please provide a name or word.\n\n*Example:* \`${prefix}fancy Popkid\``);
  }

  let result = `╭──「 *Fancy Fonts* 」\n│\n`;

  for (const style of fonts) {
    try {
      let styled = "";

      if (style.fn) {
        styled = style.fn(args);
      } else if (style.symbols) {
        styled = args.split('').map(c => symbolsMap[c] || c).join('');
      } else {
        styled = args
          .toLowerCase()
          .split('')
          .map(c => {
            const index = c.charCodeAt(0) - 97;
            return /[a-z]/.test(c) ? style.map[index] : c;
          }).join('');
      }

      result += `│ 🌟 *${style.name}*: ${styled}\n`;
    } catch (e) {
      // Skip any style that breaks
    }
  }

  result += `│\n╰───────────────`;

  await sock.sendMessage(m.from, {
    text: result,
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      externalAdReply: {
        title: 'POPKID-XTECH Font Generator',
        body: 'Over 30+ fancy styles!',
        mediaType: 1,
        renderLargerThumbnail: true,
        thumbnailUrl: 'https://i.imgur.com/AZklwZL.png',
        mediaUrl: 'https://github.com/poPKiDXmd',
        sourceUrl: 'https://github.com/poPKiDXmd',
      }
    }
  });
};

export default fancyCommand;
