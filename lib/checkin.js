import fs from 'fs';
import path from 'path';
import moment from 'moment-timezone';
import { fileURLToPath } from 'url';

// Fix __dirname untuk ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHECKIN_PATH = path.join(__dirname, 'data', 'checkin.json');

// Pastikan folder data ada
if (!fs.existsSync(path.dirname(CHECKIN_PATH))) {
    fs.mkdirSync(path.dirname(CHECKIN_PATH), { recursive: true });
}

// Pastikan file checkin.json ada
if (!fs.existsSync(CHECKIN_PATH)) {
    fs.writeFileSync(CHECKIN_PATH, '{}');
}

const loadCheckin = () => JSON.parse(fs.readFileSync(CHECKIN_PATH));
const saveCheckin = (data) =>
    fs.writeFileSync(CHECKIN_PATH, JSON.stringify(data, null, 2));

// =================================
// ✅ Check-in harian
// =================================

export function checkIn(userId) {
    const db = loadCheckin();
    const today = moment().tz('Asia/Jakarta').format('YYYY-MM-DD');

    if (!db[userId]) db[userId] = { checkins: [] };

    if (db[userId].checkins.includes(today))
        return `LU UDAH CHECKIN KONTOL`;

    db[userId].checkins.push(today);
    saveCheckin(db);

    return `✅ Check-in berhasil untuk ${today}!`;
}

// =================================
// 🔥 Hitung streak
// =================================

export function getStreak(userId) {
    const db = loadCheckin();
    const list = db[userId]?.checkins || [];

    if (list.length === 0) return `😴 Belum ada check-in.`;

    const sorted = [...list].sort();
    let streak = 0;
    let today = moment().tz('Asia/Jakarta');

    for (let i = sorted.length - 1; i >= 0; i--) {
        const date = moment(sorted[i]);
        const diff = today.diff(date, 'days');

        if (diff === 0 || diff === 1) {
            streak++;
            today = date;
        } else break;
    }

    return `🔥 Streak kamu: *${streak} hari berturut-turut!*`;
}

// =================================
// ❗ Cek user yg absen lama
// =================================

export function getAbsentUsers() {
    const db = loadCheckin();
    const now = moment().tz('Asia/Jakarta');
    const reminders = [];

    for (const [userId, data] of Object.entries(db)) {
        const list = data.checkins || [];

        if (list.length === 0) {
            reminders.push({
                userId,
                message: `📛 @${userId.split('@')[0]} belum pernah check-in!`
            });
            continue;
        }

        const last = moment(list[list.length - 1]);
        const diff = now.diff(last, 'days');

        if (diff >= 1) {
            reminders.push({
                userId,
                message: `👀 @${userId.split('@')[0]}, kamu belum check-in selama ${diff} hari! Yuk semangat lagi hari ini!`,
                mentions: [userId]
            });
        }
    }

    return reminders;
}