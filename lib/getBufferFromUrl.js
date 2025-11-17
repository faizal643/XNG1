// getBufferFromUrl.js (ESM)

import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

export async function getBufferFromUrl(url) {
  const res = await axios.get(url, { responseType: 'arraybuffer' });
  return Buffer.from(res.data);
}

export async function uploadToCatbox(filePath) {
  const form = new FormData();
  form.append('reqtype', 'fileupload');
  form.append('fileToUpload', fs.createReadStream(filePath));

  try {
    const res = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders(),
    });

    return res.data; // langsung URL dari catbox
  } catch (err) {
    console.error('❌ Error Upload Catbox:', err.response?.data || err.message);
    return null;
  }
}