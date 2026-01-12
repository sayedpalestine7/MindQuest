import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

// Helper to try parse JSON from model output
function extractJSON(text) {
  if (!text || typeof text !== 'string') return null;
  // Try full JSON parse first
  try {
    return JSON.parse(text);
  } catch (e) {}

  // Try to find a JSON array first
  const arrMatch = text.match(/\[[\s\S]*\]/m);
  if (arrMatch) {
    try {
      return JSON.parse(arrMatch[0]);
    } catch (e) {}
  }

  // Try to find first {...} block
  const objMatch = text.match(/\{[\s\S]*\}/m);
  if (objMatch) {
    try {
      return JSON.parse(objMatch[0]);
    } catch (e) {}
  }

  return null;
}

export const generateQuizFromAI = async ({ topic, numQuestions, questionTypes }) => {
  // If no API key, return deterministic mock for local development
  if (!OPENAI_API_KEY) {
    const questions = [];
    for (let i = 1; i <= numQuestions; i++) {
      const qType = (questionTypes && questionTypes[i % questionTypes.length]) || questionTypes[0] || 'mcq';
      const lower = String(qType).toLowerCase();
      if (lower.includes('true') || lower === 'tf' || lower.includes('t/f')) {
        questions.push({ text: `Question ${i}: ${topic} (True/False)`, type: 'tf', options: [], correctAnswer: 'True', points: 1, explanation: 'Auto-generated (mock): assume True.' });
      } else if (lower.includes('short')) {
        questions.push({ text: `Question ${i}: ${topic} (short answer)`, type: 'short', options: [], correctAnswer: 'Short answer example.', points: 2, explanation: 'Auto-generated (mock).' });
      } else {
        questions.push({ text: `Question ${i}: ${topic}`, type: 'mcq', options: ['Option A','Option B','Option C'], correctAnswer: 'Option A', points: 1, explanation: 'Auto-generated (mock).' });
      }
    }
    return { success: true, questions };
  }

  const system = 'You are an expert question generator for university-level engineering students. Return ONLY valid JSON with no markdown, no commentary, and no surrounding text.';
  const user = `Generate exactly ${numQuestions} quiz questions about the topic: "${topic}". Allowed types: ${JSON.stringify(questionTypes)}. Return a JSON ARRAY of question objects OR an object with a top-level "questions" array. EACH question object must exactly follow this schema:
{
  "text": "Question text here",
  "type": "mcq" | "tf" | "short",
  "options": [],            // mcq: 3–5 unique strings; tf/short: []
  "correctAnswer": "",     // exact string matching one option for mcq; "True" or "False" for tf; concise answer for short
  "points": 1,               // integer 1–10
  "explanation": "Brief explanation (1–2 sentences)"
}
Rules:
- Return ONLY valid JSON. No markdown, no prose, no extra fields, no comments in output.
- For "mcq": provide 3–5 unique options and ensure "correctAnswer" exactly equals one option.
- For "tf": set "options": [] and "correctAnswer" must be exactly "True" or "False".
- For "short": set "options": [] and provide a concise correctAnswer.
- Ensure language and domain depth match university-level engineering. Be precise and unambiguous.
Examples (do NOT include these in output):
[
  {"text":"What is fc for R=1kΩ, C=1µF?","type":"mcq","options":["159.15 Hz","1 kHz","10 Hz"],"correctAnswer":"159.15 Hz","points":2,"explanation":"fc=1/(2πRC)."},
  {"text":"Sampling at 8 kHz represents frequencies up to 4 kHz without aliasing. True or False?","type":"tf","options":[],"correctAnswer":"True","points":1,"explanation":"Nyquist frequency = half the sampling rate."},
  {"text":"Why is implicit Euler preferred for stiff ODEs?","type":"short","options":[],"correctAnswer":"Because it is A-stable and allows larger time steps for stiff problems.","points":3,"explanation":"Implicit methods have larger stability regions."}
]
Return ONLY the JSON array (or object with top-level \"questions\").`;

  try {
    const resp = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.2,
        max_tokens: 1500
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const raw = resp.data?.choices?.[0]?.message?.content;
    // Log raw LLM output (truncated) for debugging quality issues
    try {
      console.debug('AI raw response preview:', (raw || '').toString().slice(0, 3000));
    } catch (e) {}
    const parsed = extractJSON(raw || '');

    if (!parsed) {
      return { success: false, error: 'No JSON parsed from AI response', raw };
    }

    // Normalize to an array of questions
    let questions = null;
    if (Array.isArray(parsed)) questions = parsed;
    else if (Array.isArray(parsed.questions)) questions = parsed.questions;
    else if (Array.isArray(parsed.data)) questions = parsed.data;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return { success: false, error: 'No questions returned from AI', raw };
    }

    // Ensure each question has expected keys; map legacy names
    const norm = questions.map(q => {
      const text = q.text || q.question || q.questionText || '';
      const typeRaw = (q.type || '').toString().toLowerCase();
      let type = typeRaw === 'true_false' || typeRaw === 't/f' ? 'tf' : typeRaw;
      if (!['mcq','tf','short'].includes(type)) type = 'mcq';
      const options = Array.isArray(q.options) ? q.options : [];
      const correctAnswer = q.correctAnswer || q.correctAnswerIndex !== undefined ? (q.correctAnswer || (options[q.correctAnswerIndex] || '')) : '';
      const points = Number.isInteger(q.points) ? q.points : (q.points ? parseInt(q.points,10) : 1);
      const explanation = q.explanation || '';
      return { text, type, options, correctAnswer, points, explanation };
    });

    return { success: true, questions: norm };
  } catch (err) {
    return { success: false, error: err.message || String(err) };
  }
};
