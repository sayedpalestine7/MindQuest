import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

// Helper to try parse JSON from model output
function extractJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {}

  // Try to find first {...} block
  const m = text.match(/\{[\s\S]*\}/m);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch (e) {}
  }
  return null;
}

export const generateQuizFromAI = async ({ topic, numQuestions, questionTypes }) => {
  if (!OPENAI_API_KEY) {
    return { success: false, error: 'OPENAI_API_KEY not configured' };
  }

  const system = 'You are an assistant that returns a JSON object only.';
  const user = `Generate ${numQuestions} quiz questions about the following topic: "${topic}".\n\nReturn a JSON object with a top-level "questions" array. Each question must include: "question" (string), "type" (one of ${JSON.stringify(questionTypes)}), "options" (array), and "correctAnswerIndex" (integer). Use concise text.`;

  try {
    const resp = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.2,
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const raw = resp.data?.choices?.[0]?.message?.content;
    const parsed = extractJSON(raw || '');
    if (!parsed || !Array.isArray(parsed.questions)) {
      return { success: false, error: 'Invalid AI response format', raw };
    }

    return { success: true, questions: parsed.questions };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
};
