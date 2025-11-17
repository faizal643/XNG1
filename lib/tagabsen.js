// tagabsen.js (ESM Version)

import { CronJob } from 'cron';
import moment from 'moment-timezone';
import { getAbsentUsers } from './checkin.js';

const groupId = '120363370128156131@g.us'; // ID grup lu

export default function startTagAbsen(sock) {
    const job = new CronJob(
        '0 10 * * *', // Jam 10:00 WIB
        async () => {
            console.log(`[${moment().format()}] 🔎 Mengecek siapa yang belum check-in...`);

            try {
                const groupMetadata = await sock.groupMetadata(groupId);
                const participants = groupMetadata.participants.map(p => p.id);

                // Ambil list absent
                const absentUsers = getAbsentUsers();

                for (const reminder of absentUsers) {
                    await sock.sendMessage(groupId, {
                        text: reminder.message,
                        mentions: reminder.mentions || []
                    });
                }

                console.log('✅ Tag absen selesai.');
            } catch (err) {
                console.error('❌ Gagal mengirim tag absen:', err);
            }
        },
        null,
        true,
        'Asia/Jakarta'
    );

    job.start();
}