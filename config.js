// ATMOS configuration
// Add your ThingSpeak channel details when your ESP32 is ready.
// Use a public ThingSpeak channel where possible. If private, add the READ API key.
// NEVER put the ThingSpeak WRITE API key in this website. Keep it in ESP32 firmware.
window.ATMOS_CONFIG = {
  thingspeakChannelId: "3588046",
  thingspeakReadApiKey: "XZBLC71N5K6K0L69",
  refreshIntervalMs: 60000,
};
