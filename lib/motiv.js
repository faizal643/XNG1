// motiv.js (ESM version)

import { CronJob } from 'cron';
import moment from 'moment-timezone';
import getMotivationFromGemini from './gemini.js';

const groupId = '120363370128156131@g.us'; // ganti sesuai grup lu

export default function runMotivationScheduler(sock) {
  const job = new CronJob(
    '0 8 * * *', // Jam 08:00 WIB
    async () => {
      console.log(`[${moment().format()}] 🔔 Mengirim motivasi pagi...`);

      try {
        const groupMetadata = await sock.groupMetadata(groupId);
        const participants = groupMetadata.participants.map(p => p.id);

        const motivation = await getMotivationFromGemini();

        await sock.sendMessage(groupId, {
          image: { url: './icon.png' },
          caption: `📣 *GOOD MORNING, TEAM!* 📣\n\n${motivation}\n\n_Semangat baru buat hari ini ya guys!_`,
          mentions: participants
        });

        console.log('✅ Motivasi pagi berhasil dikirim.');
      } catch (err) {
        console.error('❌ Gagal kirim motivasi:', err);
      }
    },
    null,
    true,
    'Asia/Jakarta'
  );

  job.start();
}