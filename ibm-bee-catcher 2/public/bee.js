// Shared helpers for the game, leaderboard and admin pages.
// Bee artwork lives in /img (cut from the Eye-Bee-M rebus supplied for this project).

window.IBMBee = (() => {
  // Tier badge: hexagon in the tier colour with the bee inside
  function badge(color, size = 120) {
    return `<svg viewBox="0 0 120 120" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <polygon points="60,4 108,32 108,88 60,116 12,88 12,32" fill="#0b1226" stroke="${color}" stroke-width="5"/>
  <polygon points="60,14 99,37 99,83 60,106 21,83 21,37" fill="${color}" opacity=".16"/>
  <image href="/img/bee.png" x="26" y="33" width="68" height="50"/>
</svg>`;
  }

  const esc = s =>
    String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  return { badge, esc };
})();
