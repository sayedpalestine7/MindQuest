/**
 * Generate a unique ID (simple UUID-like format)
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate course data
 */
export const validateCourse = (course) => {
  const errors = [];

  if (!course.title?.trim()) {
    errors.push("Course title is required");
  }
  if (!course.description?.trim()) {
    errors.push("Course description is required");
  }
  if (!course.difficulty) {
    errors.push("Course difficulty is required");
  }
  
  // Price validation
  const price = Number(course.price);
  if (isNaN(price)) {
    errors.push("Price must be a valid number");
  } else if (price < 0) {
    errors.push("Price cannot be negative");
  } else if (price > 0 && price < 1) {
    errors.push("Paid courses must have a price of at least $1");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate lesson data
 */
export const validateLesson = (lesson) => {
  const errors = [];

  if (!lesson.title?.trim()) {
    errors.push("Lesson title is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Strip HTML tags from content to get plain text
 */
const stripHtmlTags = (html) => {
  if (!html) return "";
  // Remove HTML tags and decode entities
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
};

/**
 * Validate field data based on type
 */
export const validateField = (field) => {
  const errors = [];

  if (!field.type) {
    errors.push("Field type is required");
  }

  // Type-specific validation
  switch (field.type) {
    case "paragraph":
      // For paragraph, check if there's actual content (strip HTML tags first)
      const plainContent = stripHtmlTags(field.content);
      if (!plainContent) {
        errors.push("Paragraph content is required");
      }
      break;
    case "image":
      if (!field.content) {
        errors.push("Image URL or file is required");
      }
      break;
    case "youtube":
      if (!field.content?.trim()) {
        errors.push("YouTube URL is required");
      }
      break;
    case "code":
      if (!field.content?.trim()) {
        errors.push("Code content is required");
      }
      if (!field.language) {
        errors.push("Programming language is required");
      }
      break;
    case "question":
      if (!field.content?.trim()) {
        errors.push("Question text is required");
      }
      // Accept either field.correctAnswer (new key) or field.answer (legacy)
      if (!((field.correctAnswer && String(field.correctAnswer).trim()) || (field.answer && String(field.answer).trim()))) {
        errors.push("Answer is required");
      }
      break;
    case "table":
      // Short-circuit if data is missing or empty
      if (!field.content || !Array.isArray(field.content.data) || field.content.data.length === 0) {
        errors.push("Table must have at least one row");
        break;
      }
      // Check if table has any content (with safe guards)
      const hasContent = field.content.data.some(row => 
        Array.isArray(row) && row.some(cell => cell != null && String(cell).trim() !== "")
      );
      if (!hasContent) {
        errors.push("Table must have at least one cell with content");
      }
      break;
    default:
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate quiz data
 */
export const validateQuiz = (quiz) => {
  const errors = [];

  if (!quiz.questions || quiz.questions.length === 0) {
    errors.push("Quiz must have at least one question");
  }

  quiz.questions?.forEach((q, idx) => {
    if (!q.question?.trim()) {
      errors.push(`Question ${idx + 1}: Question text is required`);
    }

    const type = (q.type || "mcq").toString().toLowerCase().trim();

    if (type === "mcq") {
      if (!q.options || q.options.length < 2) {
        errors.push(`Question ${idx + 1}: Must have at least 2 options`);
      }
      q.options?.forEach((opt, optIdx) => {
        if (!opt?.trim()) {
          errors.push(`Question ${idx + 1}, Option ${optIdx + 1}: Cannot be empty`);
        }
      });
      if (q.correctAnswerIndex === undefined || q.correctAnswerIndex === null) {
        errors.push(`Question ${idx + 1}: Correct answer is required`);
      }
    } else if (type === "tf") {
      const a = (q.correctAnswer || "").toString();
      if (a !== "True" && a !== "False") {
        errors.push(`Question ${idx + 1}: Correct answer must be True or False`);
      }
    } else if (type === "short") {
      if (!q.correctAnswer || !q.correctAnswer.toString().trim()) {
        errors.push(`Question ${idx + 1}: Correct answer is required`);
      }
    }
  });

  if (quiz.passingScore < 0 || quiz.passingScore > 100) {
    errors.push("Passing score must be between 0 and 100");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Sanitize course data for API (remove client-only fields)
 */
export const sanitizeCourseForAPI = (course) => {
  const { title, description, difficulty, category, thumbnail, scoreOnFinish, price } = course;
  // Map frontend difficulty values to backend enum values (capitalize)
  const mapDifficulty = (d) => {
    if (!d) return "Beginner";
    const normalized = String(d).toLowerCase();
    if (normalized === "beginner") return "Beginner";
    if (normalized === "intermediate") return "Intermediate";
    if (normalized === "advanced") return "Advanced";
    // Fallback to capitalized first letter
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  };

  return {
    title,
    description,
    difficulty: mapDifficulty(difficulty),
    category: category || "General",
    thumbnail,
    scoreOnFinish: scoreOnFinish || 0,
    price: Number(price) || 0,
  };
};

/**
 * Sanitize lesson data for API
 */
export const sanitizeLessonForAPI = (lesson) => {
  const { title, fields, isPreview } = lesson;
  return {
    title,
    isPreview: isPreview || false,
    fields: fields.map((f) => sanitizeFieldForAPI(f)),
  };
};

/**
 * Sanitize field data based on type
 */
export const sanitizeFieldForAPI = (field) => {
  const base = {
    id: field.id,
    type: field.type,
  };

  switch (field.type) {
    case "paragraph":
      return { ...base, content: field.content };
    case "image":
      return { ...base, content: field.content };
    case "youtube":
      return { ...base, content: field.content };
    case "code":
      return { ...base, content: field.content, language: field.language };
    case "question":
      return {
        ...base,
        content: field.content,
        // new inline question fields
        questionType: field.questionType || (field.type === 'question' ? 'short' : null),
        options: Array.isArray(field.options) ? field.options : [],
        correctAnswer: field.correctAnswer ?? field.answer ?? "",
        correctAnswerIndex: field.correctAnswerIndex !== undefined ? field.correctAnswerIndex : null,
        points: field.points !== undefined ? field.points : 1,
        explanation: field.explanation || "",
        // keep legacy answer key for compatibility
        answer: field.answer,
      };
    case "minigame":
      return { ...base, content: field.content };
    case "animation":
      return { ...base, content: field.content, animationId: field.animationId, animationPreviewMode: field.animationPreviewMode || "start-stop" };
    case "table":
      return { ...base, content: field.content };
    default:
      return base;
  }
};

/**
 * Sanitize quiz data for API
 */
export const sanitizeQuizForAPI = (quiz) => {
  return {
    title: quiz.title || "Final Quiz",
    questions: quiz.questions.map((q) => {
      const type = q.type || "mcq";
      const options = Array.isArray(q.options) ? q.options : [];
      
      // For MCQ questions, derive correctAnswer from options if not explicitly set
      let correctAnswer = q.correctAnswer || "";
      if (type === "mcq" && !correctAnswer && q.correctAnswerIndex !== undefined && q.correctAnswerIndex !== null) {
        // Get the answer text from the options array using the index
        if (options[q.correctAnswerIndex]) {
          correctAnswer = String(options[q.correctAnswerIndex]);
        }
      }
      
      return {
        type,
        question: q.question,
        options,
        correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : null,
        correctAnswer,
        points: q.points || 1,
        explanation: q.explanation || "",
      };
    }),
    passingScore: quiz.passingScore || 70,
    points: quiz.points || 100,
  };
};

/**
 * Download HTML content as a file
 * @param {string} htmlContent - The HTML content to download
 * @param {string} filename - The filename (defaults to 'animation.html')
 */
export const downloadHtml = (htmlContent, filename = 'animation.html') => {
  try {
    // Create a blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element and trigger download
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    
    // Cleanup
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading HTML:', error);
    throw new Error('Failed to download HTML file');
  }
};
