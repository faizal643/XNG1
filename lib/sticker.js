// sticker.js (ESM Version)

import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import Crypto from 'crypto';
import ff from 'fluent-ffmpeg';
import FileType from 'file-type';
import webp from 'node-webpmux';

const randomFile = (ext) =>
  path.join(tmpdir(), `${Crypto.randomBytes(6).readUIntLE(0, 6).toString(36)}.${ext}`);

export async function gifToWebp(media) {
  const tmpIn = randomFile('gif');
  const tmpOut = randomFile('webp');
  fs.writeFileSync(tmpIn, media);

  await new Promise((resolve, reject) => {
    ff(tmpIn)
      .on('error', reject)
      .on('end', resolve)
      .addOutputOptions([
        '-vf', 'scale=512:512:force_original_aspect_ratio=decrease',
        '-loop', '0',
        '-preset', 'default',
        '-an', '-vsync', '0'
      ])
      .toFormat('webp')
      .save(tmpOut);
  });

  const buff = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpIn);
  fs.unlinkSync(tmpOut);
  return buff;
}

export async function imageToWebp(media) {
  const tmpIn = randomFile('jpg');
  const tmpOut = randomFile('webp');
  fs.writeFileSync(tmpIn, media);

  await new Promise((resolve, reject) => {
    ff(tmpIn)
      .on('error', reject)
      .on('end', resolve)
      .addOutputOptions([
        '-vcodec', 'libwebp', 
        '-vf',
        'scale=500:500:force_original_aspect_ratio=decrease,setsar=1,' +
        'pad=500:500:-1:-1:color=white@0.0, split [a][b];' +
        '[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];' +
        '[b][p] paletteuse',
        '-loop', '0', '-preset', 'default'
      ])
      .toFormat('webp')
      .save(tmpOut);
  });

  const buff = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpIn);
  fs.unlinkSync(tmpOut);
  return buff;
}

export async function videoToWebp(media) {
  const tmpIn = randomFile('mp4');
  const tmpOut = randomFile('webp');
  fs.writeFileSync(tmpIn, media);

  await new Promise((resolve, reject) => {
    ff(tmpIn)
      .on('error', reject)
      .on('end', resolve)
      .addOutputOptions([
        '-vcodec', 'libwebp',
        '-vf',
        "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease," +
        "fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b];" +
        "[a] palettegen=reserve_transparent=on:transparency_color=ffffff [p];" +
        "[b][p] paletteuse",
        '-loop', '0',
        '-ss', '00:00:00',
        '-t', '00:00:05',
        '-preset', 'default',
        '-an',
        '-vsync', '0'
      ])
      .toFormat('webp')
      .save(tmpOut);
  });

  const buff = fs.readFileSync(tmpOut);
  fs.unlinkSync(tmpIn);
  fs.unlinkSync(tmpOut);
  return buff;
}

export async function writeExif(media, data = {}) {
  const type = await FileType.fromBuffer(media);

  const wMedia =
    /webp/.test(type.mime) ? media :
    /image\/gif/.test(type.mime) ? await gifToWebp(media) :
    /jpe?g|png/.test(type.mime) ? await imageToWebp(media) :
    /video/.test(type.mime) ? await videoToWebp(media) :
    null;

  if (!wMedia) return null;

  const tmpIn = randomFile('webp');
  const tmpOut = randomFile('webp');

  fs.writeFileSync(tmpIn, wMedia);

  const img = new webp.Image();

  const {
    pack_id = data.pack_id ?? global.author ?? 'xeno-dev',
    packname = data.packname ?? global.packname ?? 'Xenovia Sticker',
    author = data.author ?? global.author ?? 'Xenovia',
    categories = data.categories ?? [''],
    isAvatar = data.isAvatar ?? 0,
    ...extra
  } = data;

  const json = {
    'sticker-pack-id': pack_id,
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': categories,
    'is-avatar-sticker': isAvatar,
    ...extra
  };

  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00,
    0x08, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x41, 0x57, 0x07, 0x00,
    0x00, 0x00, 0x00, 0x00,
    0x16, 0x00, 0x00, 0x00
  ]);

  const jsonBuff = Buffer.from(JSON.stringify(json), 'utf-8');
  const exif = Buffer.concat([exifAttr, jsonBuff]);

  exif.writeUIntLE(jsonBuff.length, 14, 4);

  await img.load(tmpIn);
  fs.unlinkSync(tmpIn);
  img.exif = exif;

  await img.save(tmpOut);
  return tmpOut;
}