const $ = (id) => document.getElementById(id);
const config = window.ATMOS_CONFIG || {};
const lat = 23.8103, lon = 90.4125;

function weatherInfo(code) {
  if (code === 0) return ["Clear sky", "☀️"];
  if ([1,2].includes(code)) return ["Partly cloudy", "⛅"];
  if (code === 3) return ["Overcast", "☁️"];
  if ([45,48].includes(code)) return ["Foggy", "🌫️"];
  if ([51,53,55,56,57].includes(code)) return ["Drizzle", "🌦️"];
  if ([61,63,65,66,67,80,81,82].includes(code)) return ["Rain", "🌧️"];
  if ([71,73,75,77,85,86].includes(code)) return ["Snow", "🌨️"];
  if ([95,96,99].includes(code)) return ["Thunderstorm", "⛈️"];
  return ["Weather conditions", "🌤️"];
}
function dayName(date, index) {
  return index === 0 ? "Today" : new Date(date + "T12:00:00").toLocaleDateString("en-US", { weekday: "short" });
}
function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}
function setHTML(id, value) {
  const el = $(id);
  if (el) el.innerHTML = value;
}
async function loadWeather() {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,uv_index_max&hourly=visibility&timezone=Asia%2FDhaka&forecast_days=5`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather service unavailable");
    const data = await response.json();
    const c = data.current, d = data.daily;
    const [description, symbol] = weatherInfo(c.weather_code);
    setHTML("weather-temp", `${Math.round(c.temperature_2m)}<sup>°C</sup>`);
    setText("weather-description", description);
    setText("weather-symbol", symbol);
    setText("feels-like", `${Math.round(c.apparent_temperature)}°C`);
    setText("wind-speed", `${Math.round(c.wind_speed_10m)} km/h`);
    setText("wind-speed-copy", `${Math.round(c.wind_speed_10m)} km/h`);
    setText("weather-humidity", `${Math.round(c.relative_humidity_2m)}%`);
    setHTML("precipitation", `${Number(d.precipitation_sum[0]).toFixed(1)} mm`);
    setText("uv-index", Number(d.uv_index_max[0]).toFixed(1));
    setText("uv-label", d.uv_index_max[0] >= 8 ? "Very high" : d.uv_index_max[0] >= 6 ? "High" : "Daily maximum");
    setHTML("pressure", `${Math.round(c.pressure_msl)} hPa`);
    const hourIndex = data.hourly.time.findIndex(t => t.slice(0,13) === c.time.slice(0,13));
    const visibility = hourIndex >= 0 ? data.hourly.visibility[hourIndex] : null;
    setHTML("visibility", visibility == null ? "-- km" : `${(visibility / 1000).toFixed(1)} km`);
    setHTML("forecast-list", d.time.map((date, i) => {
      const [desc, icon] = weatherInfo(d.weather_code[i]);
      return `<div class="forecast-row" title="${desc}"><span class="day">${dayName(date, i)}</span><span class="icon" aria-hidden="true">${icon}</span><span class="range">${Math.round(d.temperature_2m_max[i])}° / ${Math.round(d.temperature_2m_min[i])}°</span><span class="rain">${Number(d.precipitation_sum[i]).toFixed(1)} mm rain</span></div>`;
    }).join(""));
    setText("updated-at", `Updated ${new Date(c.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`);
    setText("system-status", "Weather feed active");
  } catch (err) {
    setText("weather-description", "Unable to load weather");
    setText("updated-at", "Check your internet connection");
    setHTML("forecast-list", '<div class="loading-row">Weather data could not be loaded. Please refresh the page.</div>');
    setText("system-status", "Weather feed unavailable");
  }
}
async function loadSensor() {
  const channel = String(config.thingspeakChannelId || "").trim();
  const key = String(config.thingspeakReadApiKey || "").trim();
  if (!channel) {
    setSensorWaiting("Your dashboard is ready. Add your ThingSpeak channel ID in config.js when the ESP32 is ready.");
    return;
  }
  try {
    const url = `https://api.thingspeak.com/channels/${encodeURIComponent(channel)}/feeds/last.json${key ? `?api_key=${encodeURIComponent(key)}` : ""}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Sensor feed unavailable");
    const feed = await response.json();
    const temp = Number(feed.field1), humidity = Number(feed.field2), pressure = Number(feed.field3);
    if (![temp, humidity, pressure].every(Number.isFinite) || !feed.created_at) throw new Error("No complete sensor reading");
    setHTML("sensor-temp", `${temp.toFixed(1)}<small>°C</small>`);
    setHTML("sensor-humidity", `${humidity.toFixed(1)}<small>%</small>`);
    setHTML("sensor-pressure", `${pressure.toFixed(1)}<small>hPa</small>`);
    setHTML("device-badge", "<i></i> DEVICE CONNECTED");
    $("device-badge").className = "device-badge connected";
    setText("device-state", "Sensor connected");
    setText("device-message", "The dashboard is receiving readings from your ESP32 / BME280.");
    setText("last-received", new Date(feed.created_at).toLocaleString());
    ["temp-live", "humidity-live", "pressure-live"].forEach(id => { if ($(id) ) $(id).style.color = "#35ad7e"; });
    const indicator = document.querySelector(".device-status-indicator");
    if (indicator) indicator.style.background = "#35b893";
  } catch (err) {
    setSensorWaiting("No complete sensor reading received. Check your ESP32 connection and ThingSpeak channel fields.");
  }
}
function setSensorWaiting(message) {
  setHTML("device-badge", "<i></i> WAITING FOR DEVICE");
  $("device-badge").className = "device-badge";
  setText("device-state", "Not connected yet");
  setText("device-message", message);
  setText("last-received", "No data received");
  const indicator = document.querySelector(".device-status-indicator");
  if (indicator) indicator.style.background = "#e3b45f";
}
loadWeather();
loadSensor();
const refreshMs = Math.max(30000, Number(config.refreshIntervalMs) || 60000);
setInterval(loadWeather, refreshMs);
setInterval(loadSensor, refreshMs);
