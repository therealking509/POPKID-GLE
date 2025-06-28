// weather.js
import config from './config.cjs';

const weather = async (m, Matrix) => {
  if (!m || !Matrix || !m.body || !m.from || !m.sender) {
    console.error("Invalid message or Matrix client object provided to weather command.");
    return;
  }

  const prefix = config.PREFIX;
  const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
  const args = m.body.slice(prefix.length).split(' ').slice(1); // Get arguments after the command

  if (cmd === "weather") {
    if (args.length === 0) {
      await Matrix.sendMessage(m.from, {
        text: `Please provide a city name. Example: ${prefix}weather Nairobi`,
        contextInfo: {
          mentionedJid: [m.sender],
          forwardingScore: 999,
          isForwarded: true,
          // Adjust or remove newsletter info if not applicable to your bot's context
          forwardedNewsletterMessageInfo: {
            newsletterJid: '120363290715861418@newsletter',
            newsletterName: "Popkid",
            serverMessageId: 143
          }
        }
      }, { quoted: m });
      return;
    }

    const city = args.join(' '); // Join all arguments to form the city name
    const apiKey = config.OPENWEATHER_API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`; // units=metric for Celsius

    // Emoji options for weather status
    const weatherEmojis = {
      'clear': '☀️',
      'clouds': '☁️',
      'rain': '🌧️',
      'drizzle': ' drizzling ☔',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'mist': '🌫️',
      'fog': '🌫️',
      'haze': ' hazy 💨',
      'smoke': '💨',
      'dust': '🌪️',
      'sand': '🏜️',
      'ash': '🌋',
      'squall': '🌬️',
      'tornado': '🌪️',
      'default': '🌍' // Default emoji if condition not found
    };

    let weatherMessage = `Fetching weather for *${city}*...`;
    let reactionEmoji = '🔍'; // Initial reaction while fetching

    try {
      await m.React(reactionEmoji); // React while fetching

      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.cod === 200) { // Check if API call was successful
        const weatherDescription = data.weather[0].description;
        const mainWeather = data.weather[0].main.toLowerCase(); // e.g., "clouds", "clear", "rain"
        const temp = data.main.temp;
        const feelsLike = data.main.feels_like;
        const humidity = data.main.humidity;
        const windSpeed = data.wind.speed;
        const country = data.sys.country;
        const cityName = data.name; // Use the name returned by API for accuracy

        const emoji = weatherEmojis[mainWeather] || weatherEmojis['default']; // Get relevant emoji

        weatherMessage = `
*Weather in ${cityName}, ${country} ${emoji}*

🌡️ Temperature: *${temp}°C*
🌡️ Feels like: *${feelsLike}°C*
💧 Humidity: *${humidity}%*
💨 Wind Speed: *${windSpeed} m/s*
☁️ Conditions: *${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)}*
        `.trim(); // .trim() removes leading/trailing whitespace

        reactionEmoji = emoji; // Change reaction to a relevant weather emoji
      } else {
        weatherMessage = `*Sorry, I couldn't find weather data for "${city}".* Please check the city name.`;
        reactionEmoji = '❌'; // Error reaction
        console.error(`OpenWeatherMap API error for ${city}: ${data.message}`);
      }
    } catch (error) {
      console.error("Error fetching weather data:", error);
      weatherMessage = `*An error occurred while fetching weather for "${city}".* Please try again later.`;
      reactionEmoji = '⚠️'; // Warning reaction
    } finally {
      // Update the reaction to reflect the outcome (success or error)
      try {
          await m.React(reactionEmoji);
      } catch (reactionError) {
          console.error("Failed to update reaction:", reactionError);
      }

      // Send the final weather message
      try {
        await Matrix.sendMessage(m.from, {
          text: weatherMessage,
          contextInfo: {
            mentionedJid: [m.sender],
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363290715861418@newsletter',
              newsletterName: "Popkid",
              serverMessageId: 143
            }
          }
        }, { quoted: m });
      } catch (sendError) {
        console.error("Failed to send weather message:", sendError);
      }
    }
  }
};

export default weather;

          
