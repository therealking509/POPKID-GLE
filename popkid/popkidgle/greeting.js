// popkid 

import fetch from 'node-fetch';
import cheerio from 'cheerio';
import config from '../../config.cjs';

const prefix = config.PREFIX || '.';
const targetJid = config.MASS_TARGET_JID || '254111385747@s.whatsapp.net';

function getNextSunday() {
  const d = new Date();
  const diff = (7 - d.getDay()) % 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function formatReadings(data) {
  const parts = [
    { title: 'First reading', emoji: '📖' },
    { title: 'Psalm', emoji: '🎵' },
    { title: 'Second reading', emoji: '📘' },
    { title: 'Gospel', emoji: '✝️' }
  ];

  let txt = `✝️ *Sunday Mass Readings* (English)\n\n`;
  for (const p of parts) {
    const rd = data.readings.find(r =>
      r.title.toLowerCase().includes(p.title.toLowerCase())
    );
    if (rd) txt += `${p.emoji} *${rd.title}*\n${rd.text.trim()}\n\n`;
  }

  txt += `───\n🙏 Powered by *Popkid Tech*`;
  return txt.trim();
}

async function fetchReadings() {
  const date = getNextSunday(); // yyyy-mm-dd
  const url = `https://universalis.com/${date}/mass.htm`;

  const res = await fetch(url);
  const html = await res.text();

  const $ = cheerio.load(html);
  const readings = [];

  $('h3').each((_, el) => {
    const title = $(el).text().trim();
    const text = $(el).nextUntil('h3').text().trim();
    readings.push({ title, text });
  });

  return formatReadings({ readings });
}

// Command Handler
export const command = `${prefix}sundaymass`;

export default async function sundaymass(m, sock) {
  const body = m.body.toLowerCase().trim();
  if (!body.startsWith(`${prefix}sundaymass`)) return;

  await sock.sendMessage(m.from, {
    text: '⏳ Fetching Sunday Mass readings...'
  }, { quoted: m });

  try {
    const msg = await fetchReadings();
    await sock.sendMessage(m.from, { text: msg }, { quoted: m });
  } catch (e) {
    console.error('SundayMass error', e);
    await sock.sendMessage(m.from, {
      text: '❌ Could not fetch Sunday readings.'
    }, { quoted: m });
  }
}

// Auto-scheduler
function msUntilNextSunday7() {
  const now = new Date();
  const next = new Date(now);
  next.setDate(now.getDate() + ((7 - now.getDay()) % 7));
  next.setHours(7, 0, 0, 0);
  if (next <= now) next.setDate(next.getDate() + 7);
  return next - now;
}

export async function startSundayScheduler(sock) {
  async function sendAndReschedule() {
    try {
      const msg = await fetchReadings();
      await sock.sendMessage(targetJid, { text: msg });
    } catch (err) {
      console.error('Auto Sunday fetch failed', err);
    }
    setTimeout(sendAndReschedule, msUntilNextSunday7());
  }

  setTimeout(sendAndReschedule, msUntilNextSunday7());
}
