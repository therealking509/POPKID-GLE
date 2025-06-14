import config from '../../config.cjs';

const fonts = [ (text) => text, // normal (text) => [...text].map(c => String.fromCodePoint(0x1D400 + c.charCodeAt(0) - 65)).join(''), // bold (text) => [...text].map(c => String.fromCodePoint(0x1D434 + c.charCodeAt(0) - 65)).join(''), // italic (text) => [...text].map(c => String.fromCodePoint(0x1D468 + c.charCodeAt(0) - 65)).join(''), // bold italic (text) => [...text].map(c => String.fromCodePoint(0x1D670 + c.charCodeAt(0) - 65)).join(''), // monospace (text) => text.split('').map(c => fancyMap1[c] || c).join(''), // circle (text) => text.split('').map(c => fancyMap2[c] || c).join(''), // square (text) => text.split('').map(c => fancyMap3[c] || c).join(''), // bubble // Add more stylized maps here if desired ];

const fancyMap1 = { A: 'Ⓐ', B: 'Ⓑ', C: 'Ⓒ', D: 'Ⓓ', E: 'Ⓔ', F: 'Ⓕ', G: 'Ⓖ', H: 'Ⓗ', I: 'Ⓘ', J: 'Ⓙ', K: 'Ⓚ', L: 'Ⓛ', M: 'Ⓜ', N: 'Ⓝ', O: 'Ⓞ', P: 'Ⓟ', Q: 'Ⓠ', R: 'Ⓡ', S: 'Ⓢ', T: 'Ⓣ', U: 'Ⓤ', V: 'Ⓥ', W: 'Ⓦ', X: 'Ⓧ', Y: 'Ⓨ', Z: 'Ⓩ', a: 'ⓐ', b: 'ⓑ', c: 'ⓒ', d: 'ⓓ', e: 'ⓔ', f: 'ⓕ', g: 'ⓖ', h: 'ⓗ', i: 'ⓘ', j: 'ⓙ', k: 'ⓚ', l: 'ⓛ', m: 'ⓜ', n: 'ⓝ', o: 'ⓞ', p: 'ⓟ', q: 'ⓠ', r: 'ⓡ', s: 'ⓢ', t: 'ⓣ', u: 'ⓤ', v: 'ⓥ', w: 'ⓦ', x: 'ⓧ', y: 'ⓨ', z: 'ⓩ' };

const fancyMap2 = Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map((l, i) => [l, String.fromCharCode(0x1F130 + i)])); const fancyMap3 = Object.fromEntries('abcdefghijklmnopqrstuvwxyz'.split('').map((l, i) => [l, String.fromCharCode(0x1F170 + i)]));

const fancyCmd = async (m, sock) => { const prefix = config.PREFIX; const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : ''; const text = m.body.slice(prefix.length + cmd.length).trim();

if (cmd !== 'fancy' || !text) return;

let result = *Stylish Fonts for:* _${text}_\n\n; let count = 1; for (const transform of fonts) { try { const styled = transform(text.toUpperCase()); result += *${count++}.* ${styled}\n; } catch (e) { result += *${count++}.* ⚠️ Not supported on this device\n; } }

await sock.sendMessage(m.from, { text: result.trim(), contextInfo: { forwardingScore: 5, isForwarded: true, } }, { quoted: m }); };

export default fancyCmd;

