// translate.js (ESM Version)

import translate from 'translate-google';

export async function doTranslate(text, targetLang = 'id') {
  try {
    const res = await translate(text, { to: targetLang });
    return res; // translate-google return string langsung
  } catch (err) {
    console.error("Translate.js error:", err);
    return "❌ Error saat translate.";
  }
}