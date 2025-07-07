// powered by popkid gle

import fetch from 'node-fetch';
import config from '../../config.cjs';

const prefix = config.PREFIX || '.';
const targetJid = config.MASS_TARGET_JID || 'YOUR_NUMBER_OR_GROUP@jid';

function getNextSunday() {
  const d = new Date();
  const diff = (7 - d.getDay()) % 7;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split('T')[0];
}

function formatReadings(data, lang = 'en') {
  const suffix = lang === 'sw' ? '_sw' : '';
  const parts = [
    { title: `First Reading${suffix}`, emoji: '📖' },
    { title: `Responsorial Psalm${suffix}`, emoji: '🎵' },
    { title: `Second Reading${suffix}`, emoji: '📘' },
    { title: `Gospel${suffix}`, emoji: '✝️' }
  ];

  let txt = `✝️ *Sunday Mass Readings* (${lang === 'sw' ? 'Kiswahili' : 'English'})\n\n`;
  for (const p of parts) {
    const rd = data.readings.find(r =>
      r.title.toLowerCase().includes(p.title.toLowerCase())
    );
    if (rd) txt += `${p.emoji} *${rd.title}*\n${rd.text.trim()}\n\n`;
  }

  txt += `───\n🙏 Powered by *Popkid Tech*`;
  return txt.trim();
}

async function fetchReadings(lang = 'en') {
  const date = getNextSunday();
  const res = await fetch(`https://api.universalis.app/api/daily-readings?date=${date}`);
  const data = await res.json();
  return formatReadings(data, lang);
}

// Command handler
export const command = `${prefix}sundaymass`;

export default async function sundaymass(m, sock) {
  const body = m.body.toLowerCase().trim();
  if (!body.startsWith(`${prefix}sundaymass`)) return;

  const lang = body.endsWith(' sw') ? 'sw' : 'en';
  await sock.sendMessage(m.from, {
    text: `⏳ Fetching Sunday readings in ${lang === 'sw' ? 'Kiswahili' : 'English'}...`
  }, { quoted: m });

  try {
    const msg = await fetchReadings(lang);
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
      const msg = await fetchReadings('en');
      await sock.sendMessage(targetJid, { text: msg });
    } catch (err) {
      console.error('Auto Sunday fetch failed', err);
    }
    setTimeout(sendAndReschedule, msUntilNextSunday7());
  }

  setTimeout(sendAndReschedule, msUntilNextSunday7());
}
