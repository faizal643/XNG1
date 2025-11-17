import ytSearch from 'yt-search';
import ytdlp from 'yt-dlp-exec';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';
import ffmpegPath from 'ffmpeg-static';
import { fileURLToPath } from 'url';

// Fix __dirname di ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set path ffmpeg
ffmpeg.setFfmpegPath(ffmpegPath);

const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

const cookiesPath = path.join(__dirname, 'cookies.txt');

// Cek apakah merupakan URL YouTube
function isYouTubeUrl(query) {
  return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(query);
}

// Ambil ID video dari link YouTube
function getVideoId(url) {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/);
  return match ? match[1] : null;
}

/**
 * 🎵 Download & convert ke OPUS (MP3 versi WA)
 */
export async function downloadMp3(query, filename = 'audio') {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error('❌ Query kosong! Masukkan judul atau link YouTube.');
    }

    let video;
    let url = query;

    if (!isYouTubeUrl(query)) {
      const search = await ytSearch(query);
      if (!search.videos || search.videos.length === 0) {
        throw new Error('❌ Video tidak ditemukan di YouTube!');
      }
      video = search.videos[0];
      url = video.url;
    } else {
      const videoId = getVideoId(query);
      if (!videoId) throw new Error('❌ Link YouTube tidak valid!');

      const search = await ytSearch(`https://www.youtube.com/watch?v=${videoId}`);
      if (!search.videos || search.videos.length === 0) {
        throw new Error('❌ Video tidak ditemukan!');
      }
      video = search.videos[0];
      url = video.url;
    }

    const tempFile = path.join(tmpDir, `${filename}.mp4`);
    const outputFile = path.join(tmpDir, `${filename}.opus`);

    await ytdlp(url, {
      output: tempFile,
      format: 'bestaudio/best',
      cookies: cookiesPath,
      userAgent: 'Mozilla/5.0',
      noCheckCertificates: true
    });

    await new Promise((resolve, reject) => {
      ffmpeg(tempFile)
        .audioCodec('libopus')
        .audioBitrate('128')
        .audioFrequency(48000)
        .toFormat('opus')
        .save(outputFile)
        .on('end', resolve)
        .on('error', reject);
    });

    const buffer = fs.readFileSync(outputFile);

    // bersihkan file sementara
    [tempFile, outputFile].forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });

    return {
      title: video.title,
      duration: video.timestamp,
      buffer,
      thumbnail: video.thumbnail,
      mimetype: 'audio/ogg; codecs=opus'
    };

  } catch (err) {
    console.error('[yt.js] Gagal download MP3:', err.message);
    throw err;
  }
}

/**
 * 📹 Download & convert MP4
 */
export async function downloadMp4(query, filename = 'video') {
  try {
    let video;
    let url = query;

    if (!isYouTubeUrl(query)) {
      const search = await ytSearch(query);
      if (!search.videos || search.videos.length === 0) {
        throw new Error('Video tidak ditemukan!');
      }
      video = search.videos[0];
      url = video.url;
    } else {
      const videoId = getVideoId(query);
      if (!videoId) throw new Error('Link YouTube tidak valid!');

      const search = await ytSearch(`https://www.youtube.com/watch?v=${videoId}`);
      if (!search.videos || search.videos.length === 0) {
        throw new Error('Video tidak ditemukan!');
      }
      video = search.videos[0];
      url = video.url;
    }

    const tempFile = path.join(tmpDir, `${filename}_raw.mp4`);
    const outputFile = path.join(tmpDir, `${filename}.mp4`);

    await ytdlp(url, {
      output: tempFile,
      format: 'bestvideo+bestaudio/best',
      cookies: cookiesPath,
      userAgent: 'Mozilla/5.0',
      noCheckCertificates: true
    });

    await new Promise((resolve, reject) => {
      ffmpeg(tempFile)
        .videoBitrate('800k')
        .audioBitrate('128k')
        .save(outputFile)
        .on('end', resolve)
        .on('error', reject);
    });

    const buffer = fs.readFileSync(outputFile);

    [tempFile, outputFile].forEach(file => {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    });

    return {
      title: video.title,
      duration: video.timestamp,
      buffer,
      thumbnail: video.thumbnail
    };

  } catch (err) {
    console.error('Gagal download MP4:', err);
    throw err;
  }
}