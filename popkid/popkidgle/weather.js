import config from '../../config.cjs';
import axios from 'axios';

const weather = async (m, sock) => {
  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix)
    ? m.body.slice(prefix.length).split(" ")[0].toLowerCase()
    : '';
  const args = m.body.trim().split(" ").slice(1);
  const location = args.join(" ");

  if (cmd !== "weather") return;

  if (!location) {
    await sock.sendMessage(m.from, {
      text: `❌ Please provide a location!\nExample: *${prefix}weather Nairobi*`
    }, { quoted: m });
    return;
  }

  await m.React("⛅"); // React while fetching

  try {
    const apiKey = config.WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${apiKey}&units=metric`;

    const { data } = await axios.get(url);

    const name = data.name;
    const country = data.sys.country;
    const temp = data.main.temp;
    const feels = data.main.feels_like;
    const humidity = data.main.humidity;
    const weatherDesc = data.weather[0].description;
    const wind = data.wind.speed;

    const weatherIcon = data.weather[0].icon;
    const iconURL = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

    const result = `🌍 *Weather in ${name}, ${country}*
🌡️ Temp: *${temp}°C* (Feels like ${feels}°C)
💧 Humidity: *${humidity}%*
💨 Wind: *${wind} m/s*
🌤️ Condition: *${capitalize(weatherDesc)}*`;

    await sock.sendMessage(m.from, {
      image: { url: iconURL },
      caption: result
    }, { quoted: m });

  } catch (error) {
    await sock.sendMessage(m.from, {
      text: `❌ Could not find weather for *${location}*. Please check the name.`
    }, { quoted: m });
  }
};

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default weather;
