import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  "AIzaSyDK-JvMJG3KFWWJ_-rmaQS-IYzHhrQUNAA"
);

export default async function getMotivationFromGemini() {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash'
    });

    const prompt = `Give me 1 short and energetic morning message in English for a work team WhatsApp group. Keep it uplifting and inspiring.`;

    const result = await model.generateContent(prompt);
    const text = result?.response?.text() ?? "You're amazing, keep going!";

    return text.trim();
  } catch (err) {
    console.error("❌ Gemini Error:", err.message || err);
    return "Let's do our best today, team! 💪";
  }
}