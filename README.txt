ATMOS WEATHER DASHBOARD - REDESIGNED PROJECT

GETTING STARTED
1. Extract this folder.
2. Open Visual Studio Code.
3. Choose File > Open Folder and select "atmos-weather-dashboard".
4. Install the "Live Server" extension by Ritwick Dey if you have not already.
5. Open index.html, right-click, and choose "Open with Live Server".
6. Keep an internet connection active for Open-Meteo weather data and Google Fonts.

WHAT IS INCLUDED
- Redesigned responsive weather dashboard.
- Live Dhaka weather from Open-Meteo.
- Current conditions, highlights and 5-day forecast.
- ESP32 / BME280 sensor section prepared for ThingSpeak.
- No simulated sensor readings.

ESP32 / THINGSPEAK CONNECTION (WHEN HARDWARE IS READY)
1. Create a ThingSpeak channel with:
   Field 1: Temperature (C)
   Field 2: Humidity (%)
   Field 3: Pressure (hPa)
2. Put the channel ID in config.js as thingspeakChannelId.
3. If the channel is private, put its READ API key in config.js as thingspeakReadApiKey.
4. Configure the ESP32 firmware to send readings using the channel WRITE API key.
5. Do not put the WRITE API key in website files or publish it.

NOTES
- The website reads the latest ThingSpeak feed and displays the timestamp.
- Until a channel is configured and data is sent, the device status remains "Waiting for device".
- This is a static frontend and can be hosted on GitHub Pages for a free public demo.
- Open-Meteo's free API is intended for non-commercial use and subject to its published terms.
