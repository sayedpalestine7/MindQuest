# AI Quiz Generation Implementation Guide

## Overview
This guide explains how to implement the AI-powered quiz generation feature that automatically creates quiz questions from course content.

## Architecture

```
Frontend (React)
    ↓
User clicks "Generate Quiz from AI" button
    ↓
API Request to Backend
    ↓
Backend Service (Node.js)
    ↓
Call AI Provider (OpenAI/Claude/Gemini)
    ↓
Parse & Validate Response
    ↓
Return Generated Quiz Questions
    ↓
Display in Frontend
```

## Step 1: Choose an AI Provider

### Option A: OpenAI GPT (Recommended for accuracy)
- **Cost**: $0.50-2.00 per 1M tokens
- **Speed**: Fast (2-5 seconds)
- **Quality**: Excellent
- **Setup**: https://platform.openai.com

### Option B: Google Gemini (Most cost-effective)
- **Cost**: $0.075-0.30 per 1M tokens  
- **Speed**: Fast (2-5 seconds)
- **Quality**: Very Good
- **Setup**: https://makersuite.google.com

### Option C: Claude (Anthropic)
- **Cost**: $0.80-3.00 per 1M tokens
- **Speed**: Medium (3-8 seconds)
- **Quality**: Excellent
- **Setup**: https://console.anthropic.com

**Recommendation**: Start with **Google Gemini** (cheapest) or **OpenAI** (most reliable).

---

## Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install openai dotenv axios
```

### 2.2 Create AI Service File

Create `src/services/aiService.js`:

```javascript
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = 'gpt-3.5-turbo'; // or 'gpt-4' for better quality

/**
 * Generate quiz questions from course content using OpenAI
 * @param {string} courseTitle - Title of the course
 * @param {array} lessons - Array of lessons with content
 * @param {number} questionCount - Number of questions to generate (default: 10)
 * @returns {Promise<array>} - Generated quiz questions
 */
export const generateQuizFromAI = async (courseTitle, lessons, questionCount = 10) => {
  try {
    // 1. Extract all content from lessons
    const courseContent = lessons
      .map((lesson) => `Lesson: ${lesson.title}\n${extractFieldsContent(lesson.fields)}`)
      .join('\n\n');

    // 2. Create prompt for AI
    const prompt = createQuizPrompt(courseTitle, courseContent, questionCount);

    // 3. Call OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational assessment creator. Generate high-quality multiple-choice quiz questions based on course content.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7, // Balance between creativity and consistency
        max_tokens: 2000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // 4. Parse response
    const generatedText = response.data.choices[0].message.content;
    const questions = parseQuizResponse(generatedText);

    return {
      success: true,
      questions,
      messageCount: response.data.usage.total_tokens,
    };
  } catch (error) {
    console.error('Error generating quiz:', error.message);
    return {
      success: false,
      error: error.message || 'Failed to generate quiz',
    };
  }
};

/**
 * Extract text content from lesson fields
 */
function extractFieldsContent(fields) {
  if (!fields || fields.length === 0) return '';

  return fields
    .map((field) => {
      switch (field.type) {
        case 'paragraph':
          return field.content;
        case 'image':
          return `[Image: ${field.content}]`;
        case 'youtube':
          return `[Video: ${field.content}]`;
        case 'code':
          return `\`\`\`\n${field.content}\n\`\`\``;
        default:
          return field.content;
      }
    })
    .join('\n');
}

/**
 * Create a detailed prompt for quiz generation
 */
function createQuizPrompt(courseTitle, content, count) {
  return `
Based on the following course content for "${courseTitle}", generate exactly ${count} multiple-choice quiz questions.

COURSE CONTENT:
${content}

REQUIREMENTS:
1. Each question must be challenging but fair
2. Each question should have 4 options (A, B, C, D)
3. Clearly mark the correct answer
4. Include explanations for why the correct answer is right
5. Vary question types (conceptual, practical, analytical)
6. Questions should test understanding, not just memorization

FORMAT YOUR RESPONSE AS JSON:
{
  "questions": [
    {
      "question": "Question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this is correct..."
    }
  ]
}

Generate the quiz now:
`;
}

/**
 * Parse AI response into quiz question format
 */
function parseQuizResponse(text) {
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in response');

    const parsed = JSON.parse(jsonMatch[0]);
    
    // Validate and format questions
    return parsed.questions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      type: 'multiple-choice',
      points: 1,
    }));
  } catch (error) {
    console.error('Error parsing quiz response:', error);
    throw new Error('Failed to parse AI response');
  }
}
```

### 2.3 Create API Endpoint

Update `src/routes/courseRoutes.js`:

```javascript
import { generateQuizFromAI } from '../services/aiService.js';

// Add this route
router.post('/:courseId/generate-quiz', authMiddleware, async (req, res) => {
  try {
    const { courseId } = req.params;
    const { questionCount = 10 } = req.body;

    // Fetch course with lessons
    const course = await Course.findById(courseId).populate('lessonIds');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Generate quiz
    const result = await generateQuizFromAI(
      course.title,
      course.lessonIds,
      questionCount
    );

    if (!result.success) {
      return res.status(500).json({ message: result.error });
    }

    // Save generated questions to database
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { quizId: { questions: result.questions } },
      { new: true }
    );

    res.json({
      success: true,
      questions: result.questions,
      course: updatedCourse,
    });
  } catch (error) {
    console.error('Error generating quiz:', error);
    res.status(500).json({ message: 'Failed to generate quiz' });
  }
});
```

### 2.4 Environment Variables

Create/update `.env` in backend:

```env
# AI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=gpt-3.5-turbo

# OR for Google Gemini
GOOGLE_AI_API_KEY=your-google-api-key
GOOGLE_AI_MODEL=gemini-pro

# OR for Claude
ANTHROPIC_API_KEY=your-anthropic-key
```

---

## Step 3: Frontend Implementation

### 3.1 Add Generate Button to QuizSection

Update `src/components/courseBuilder/QuizSection.jsx`:

```jsx
import { Sparkles } from 'lucide-react'; // Already imported

// Add this state in your component
const [isGenerating, setIsGenerating] = useState(false);

// Add this function
const handleGenerateQuiz = async () => {
  setIsGenerating(true);
  try {
    const response = await fetch(
      `http://localhost:5000/api/courses/${courseId}/generate-quiz`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ questionCount: 10 }),
      }
    );

    const data = await response.json();

    if (data.success) {
      // Update course with generated questions
      setCourse((prev) => ({
        ...prev,
        quiz: { questions: data.questions, passingScore: 70, points: 100 },
      }));
      toast.success(`Generated ${data.questions.length} questions!`);
    } else {
      toast.error(data.message || 'Failed to generate quiz');
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Error generating quiz');
  } finally {
    setIsGenerating(false);
  }
};

// Add button in JSX
<Button
  onClick={handleGenerateQuiz}
  disabled={isGenerating}
  className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
>
  <Sparkles className="w-4 h-4" />
  {isGenerating ? 'Generating...' : 'Generate Quiz with AI'}
</Button>
```

### 3.2 Add Loading State

```jsx
{isGenerating && (
  <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
    <div className="flex items-center gap-2">
      <div className="animate-spin">
        <Sparkles className="w-5 h-5 text-purple-600" />
      </div>
      <p className="text-sm text-purple-700 font-semibold">
        Generating quiz questions with AI...
      </p>
    </div>
  </div>
)}
```

---

## Step 4: Testing

### Test Locally

```bash
# 1. Start backend
cd backend
npm start

# 2. Start frontend  
cd frontend
npm run dev

# 3. Create a course with some lessons
# 4. Click "Generate Quiz with AI" button
# 5. Watch magic happen! ✨
```

### Expected Response Time
- **First call**: 3-8 seconds (AI thinking)
- **Subsequent calls**: 2-5 seconds (cached)

---

## Step 5: Cost Estimation

### Monthly Cost (100 generated quizzes)

| Provider | Per Quiz | 100 Quizzes/Month |
|----------|----------|------------------|
| OpenAI GPT-3.5 | ~$0.02 | ~$2-3 |
| Google Gemini | ~$0.005 | ~$0.50-1 |
| Claude | ~$0.05 | ~$5-10 |

---

## Step 6: Optimization & Best Practices

### 6.1 Cache Generated Questions
```javascript
// Store in Redis to avoid regenerating same content
const cacheKey = `quiz:${courseId}:${contentHash}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);
```

### 6.2 Rate Limiting
```javascript
// Prevent abuse - max 5 generations per course per day
const generationCount = await Quiz.countDocuments({
  courseId,
  createdAt: { $gte: new Date(Date.now() - 24*60*60*1000) }
});

if (generationCount >= 5) {
  return res.status(429).json({ message: 'Rate limit exceeded' });
}
```

### 6.3 Streaming Response (for better UX)
```javascript
// Use streaming to show questions as they're generated
response.data.stream // use in frontend
```

### 6.4 Error Handling
```javascript
- Validate API keys before requests
- Add retry logic with exponential backoff
- Fallback to manual question creation
- Log all AI API calls for monitoring
```

---

## Step 7: Advanced Features

### Add Difficulty Settings
```javascript
const prompt = `Generate ${count} questions at ${difficulty} level...`;
```

### Add Question Type Selection
```javascript
{
  type: 'multiple-choice', // or 'true-false', 'short-answer'
  ...
}
```

### Human Review Before Saving
```jsx
// Show generated questions for review before saving
<QuizReviewModal 
  questions={generatedQuestions}
  onApprove={saveQuestions}
  onReject={discardQuestions}
/>
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API Key Invalid | Check `.env` file, recreate key on provider dashboard |
| Rate Limited | Wait 1 minute, upgrade API plan |
| Malformed JSON | Update prompt format, check API response |
| Timeout | Increase timeout to 30s, use streaming |
| Expensive | Use Gemini instead of GPT-4, implement caching |

---

## Next Steps

1. ✅ Set up API key with chosen provider
2. ✅ Create `aiService.js` file
3. ✅ Add backend endpoint
4. ✅ Update frontend button
5. ✅ Test with sample course
6. ✅ Deploy to production
7. ✅ Monitor costs and usage
8. ✅ Iterate based on results

---

## Resources

- [OpenAI API Docs](https://platform.openai.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [Claude API](https://docs.anthropic.com/)
- [Best Practices for LLMs](https://help.openai.com/en/articles/6907257-best-practices-for-api-key-safety)

Good luck! 🚀
