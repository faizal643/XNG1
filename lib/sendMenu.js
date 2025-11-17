// sendMenuButtons.js (ESM)

export default async function sendMenuButtons(sock, msg) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');
  const name = msg.pushName || 'kamu';

  const menuText = `╭─〔*XenoviaAI Menu*〕
│ 👋 Selamat datang, ${name}!
│
│ 📌 *Fitur:*
│ 🆔 /cekin — Absen harian
│ 🔥 /streak — Cek streak
│ 🎮 /play — Putar musik
│ 📹 /mp4 — Download video
│ 🖼️ /sticker — Buat stiker
╰──────────────`.trim();

  try {
    if (isGroup) {
      // Grup: tombol normal
      await sock.sendMessage(
        from,
        {
          text: menuText,
          footer: 'XenoviaAI',
          buttons: [
            { buttonId: 'cekin', buttonText: { displayText: '✅ Cekin' }, type: 1 },
            { buttonId: 'streak', buttonText: { displayText: '🔥 Streak' }, type: 1 },
            { buttonId: 'r', buttonText: { displayText: '🕒 Runtime' }, type: 1 }
          ],
          headerType: 1
        },
        { quoted: msg }
      );

    } else {
      // Menu untuk private chat – list message
      const privateMessage = {
        text: menuText,
        footer: 'Xenovia Holdings Ltd.',
        title: '',
        buttonText: 'OPEN MENU',
        sections: [
          {
            title: 'Menu Utama',
            rows: [
              { title: '✅ Cekin', rowId: 'cekin' },
              { title: '🔥 Streak', rowId: 'streak' },
              { title: '🕒 Runtime', rowId: 'r' }
            ]
          }
        ],
        ai: true
      };

      await sock.sendMessage(from, privateMessage, { quoted: msg });
    }

  } catch (err) {
    console.error('❌ Gagal kirim menu:', err);
    await sock.sendMessage(
      from,
      { text: '⚠️ Gagal menampilkan menu.' },
      { quoted: msg }
    );
  }
}