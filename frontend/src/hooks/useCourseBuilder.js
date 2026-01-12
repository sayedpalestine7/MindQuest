import { useState, useEffect } from "react";
import courseService from "../services/courseService";
import { generateId, validateCourse } from "../utils/courseBuilderUtils";
import toast from "react-hot-toast";

/**
 * Custom hook to manage course builder state
 * Reduces prop drilling and centralizes state management
 */
export const useCourseBuilder = (courseId) => {
  // Course state
  const [course, setCourse] = useState({
    title: "",
    description: "",
    difficulty: "beginner",
    thumbnail: "",
    finalQuiz: { questions: [], passingScore: 70, points: 100 },
  });

  // UI state
  const [lessons, setLessons] = useState([
    { id: generateId(), title: "Lesson 1", fields: [] },
  ]);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  const [isQuizSectionOpen, setIsQuizSectionOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Drag and drop state
  const [draggedLessonId, setDraggedLessonId] = useState(null);
  const [draggedFieldId, setDraggedFieldId] = useState(null);

  // Loading/Error state
  const [saveStatus, setSaveStatus] = useState("saved");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState([]);

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId);

  // Initialize selected lesson
  useEffect(() => {
    if (lessons.length > 0 && !selectedLessonId) {
      setSelectedLessonId(lessons[0].id);
    }
  }, [lessons, selectedLessonId]);

  // Load existing course
  const loadCourse = async (id) => {
    if (!id || id === "undefined" || id === "null") {
      console.warn('⚠️ loadCourse: Invalid or missing ID provided', id);
      return;
    }

    setIsLoading(true);
    setErrors([]); // Clear previous errors
    
    const result = await courseService.getCourseById(id);
    setIsLoading(false);

    if (result.success) {
      // Verify we got the right course
      if (result.data._id !== id) {
        console.warn('⚠️ WARNING: Course ID mismatch! Expected:', id, 'Got:', result.data._id);
      }
      
      setCourse({
        title: result.data.title,
        description: result.data.description,
        difficulty: result.data.difficulty,
        thumbnail: result.data.thumbnail,
        finalQuiz: { questions: [], passingScore: 70, points: 100 },
      });

      if (result.data.lessonIds && Array.isArray(result.data.lessonIds)) {
        const newLessons = result.data.lessonIds.map((lesson) => ({
          id: lesson._id,
          title: lesson.title,
          fields: (lesson.fieldIds || []).map((f) => ({
            id: f._id || f.id,
            type: f.type,
            content: f.content,
            questionId: f.questionId || null,
            animationId: f.animationId || null,
            order: f.order ?? 0,
          })),
        }));
        setLessons(newLessons);
        // Reset selected lesson to first lesson of loaded course
        setSelectedLessonId(newLessons.length > 0 ? newLessons[0].id : null);
      } else {
        setLessons([{ id: generateId(), title: "Lesson 1", fields: [] }]);
        setSelectedLessonId(null);
      }
    } else {
      console.error('📚 Failed to load course:', result.error);
      setErrors([result.error]);
      toast.error(`Failed to load course: ${result.error}`);
    }
  };

  // LESSON HANDLERS
  const addLesson = () => {
    const newLesson = {
      id: generateId(),
      title: `Lesson ${lessons.length + 1}`,
      fields: [],
    };
    setLessons([...lessons, newLesson]);
    setSelectedLessonId(newLesson.id);
    toast.success("Lesson added");
  };

  const deleteLesson = (id) => {
    if (lessons.length === 1) {
      toast.error("Cannot delete the last lesson");
      return;
    }
    const filtered = lessons.filter((l) => l.id !== id);
    setLessons(filtered);
    if (selectedLessonId === id) setSelectedLessonId(filtered[0].id);
    toast.success("Lesson deleted");
  };

  const updateLessonTitle = (id, title) => {
    setLessons(lessons.map((l) => (l.id === id ? { ...l, title } : l)));
  };

  // FIELD HANDLERS
  const addField = (type) => {
    if (!selectedLesson) {
      toast.error("Please select a lesson first");
      return;
    }
    const newField = { id: generateId(), type, content: "" };
    setLessons(
      lessons.map((l) =>
        l.id === selectedLessonId ? { ...l, fields: [...l.fields, newField] } : l
      )
    );
    toast.success(`${type} block added`);
  };

  const deleteField = (fieldId) => {
    if (!selectedLesson) return;
    const updated = selectedLesson.fields.filter((f) => f.id !== fieldId);
    setLessons(
      lessons.map((l) =>
        l.id === selectedLessonId ? { ...l, fields: updated } : l
      )
    );
    toast.success("Content block deleted");
  };

  const updateField = (fieldId, updates) => {
    setLessons(
      lessons.map((l) =>
        l.id === selectedLessonId
          ? {
              ...l,
              fields: l.fields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
              ),
            }
          : l
      )
    );
  };

  // FILE UPLOAD HANDLERS
  const handleImageUpload = async (file, fieldId) => {
    const result = await courseService.uploadFile(file, "image");
    if (result.success) {
      if (fieldId) {
        updateField(fieldId, { content: result.url });
        toast.success("Image uploaded");
      } else {
        setCourse({ ...course, thumbnail: result.url });
        toast.success("Thumbnail uploaded");
      }
    } else {
      toast.error(`Upload failed: ${result.error}`);
      setErrors([result.error]);
    }
  };

  const handleHtmlFileUpload = async (fieldId, file) => {
    const result = await courseService.uploadFile(file, "htmlFile");
    if (result.success) {
      updateField(fieldId, { content: result.url, htmlContent: file.name });
      toast.success("HTML file uploaded");
    } else {
      toast.error(`Upload failed: ${result.error}`);
      setErrors([result.error]);
    }
  };

  // DRAG AND DROP HANDLERS - LESSONS
  const handleDragStart = (e, lessonId) => {
    setDraggedLessonId(lessonId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, targetLessonId) => {
    e.preventDefault();
    if (!draggedLessonId || draggedLessonId === targetLessonId) return;

    const draggedIndex = lessons.findIndex((l) => l.id === draggedLessonId);
    const targetIndex = lessons.findIndex((l) => l.id === targetLessonId);
    const reordered = [...lessons];
    const [draggedLesson] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedLesson);
    setLessons(reordered);
    setDraggedLessonId(null);
  };

  const handleDragEnd = () => setDraggedLessonId(null);

  // DRAG AND DROP HANDLERS - FIELDS
  const handleFieldDragStart = (e, fieldId) => {
    setDraggedFieldId(fieldId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleFieldDragOver = (e) => e.preventDefault();

  const handleFieldDrop = (e, targetFieldId) => {
    e.preventDefault();
    if (!draggedFieldId || draggedFieldId === targetFieldId || !selectedLesson) return;

    const draggedIndex = selectedLesson.fields.findIndex((f) => f.id === draggedFieldId);
    const targetIndex = selectedLesson.fields.findIndex((f) => f.id === targetFieldId);
    const reordered = [...selectedLesson.fields];
    const [draggedField] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, draggedField);

    setLessons(
      lessons.map((l) =>
        l.id === selectedLessonId ? { ...l, fields: reordered } : l
      )
    );
    setDraggedFieldId(null);
  };

  const handleFieldDragEnd = () => setDraggedFieldId(null);

  // QUIZ HANDLERS
  const addQuizQuestion = () => {
    const newQ = {
      id: `quiz-${Date.now()}`,
      type: "mcq",
      question: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      correctAnswer: "",
    };
    setCourse((prev) => ({
      ...prev,
      finalQuiz: {
        ...prev.finalQuiz,
        questions: [...(prev.finalQuiz?.questions || []), newQ],
      },
    }));
    toast.success("Question added");
  };

  const updateQuizQuestion = (id, field, value) => {
    setCourse((prev) => ({
      ...prev,
      finalQuiz: {
        ...prev.finalQuiz,
        questions: (prev.finalQuiz?.questions || []).map((q) =>
          q.id === id ? { ...q, [field]: value } : q
        ),
      },
    }));
  };

  const updateQuizOption = (id, optIndex, value) => {
    setCourse((prev) => ({
      ...prev,
      finalQuiz: {
        ...prev.finalQuiz,
        questions: (prev.finalQuiz?.questions || []).map((q) =>
          q.id === id
            ? {
                ...q,
                options: (Array.isArray(q.options) ? q.options : []).map((opt, i) =>
                  i === optIndex ? value : opt
                ),
              }
            : q
        ),
      },
    }));
  };

  const deleteQuizQuestion = (id) => {
    setCourse((prev) => ({
      ...prev,
      finalQuiz: {
        ...prev.finalQuiz,
        questions: (prev.finalQuiz?.questions || []).filter((q) => q.id !== id),
      },
    }));
    toast.success("Question deleted");
  };

  // Insert generated questions (from AI) into builder state
  const insertGeneratedQuestions = (questions) => {
    if (!questions || !Array.isArray(questions) || questions.length === 0) return;

    const mapped = questions.map((q, idx) => {
      const typeRaw = (q.type || '').toString().toLowerCase().trim();
      const type = (typeRaw === 't/f' || typeRaw === 'true_false' || typeRaw === 'truefalse') ? 'tf' : typeRaw;
      const normalizedType = ['mcq', 'tf', 'short'].includes(type) ? type : 'mcq';

      const questionText = q.question || q.text || "";
      const options = Array.isArray(q.options) ? q.options : [];
      const correctAnswer = (q.correctAnswer || '').toString();

      if (normalizedType === 'mcq') {
        const finalOptions = options.length > 0 ? options : ["", "", "", ""];
        const idxFromCorrectAnswer = correctAnswer ? finalOptions.indexOf(correctAnswer) : -1;
        const correctAnswerIndex = typeof q.correctAnswerIndex === 'number'
          ? q.correctAnswerIndex
          : (idxFromCorrectAnswer >= 0 ? idxFromCorrectAnswer : 0);
        return {
          id: `quiz-${Date.now()}-${idx}-${Math.random().toString(36).slice(2,8)}`,
          type: 'mcq',
          question: questionText,
          options: finalOptions,
          correctAnswerIndex,
          correctAnswer: "",
        };
      }

      if (normalizedType === 'tf') {
        return {
          id: `quiz-${Date.now()}-${idx}-${Math.random().toString(36).slice(2,8)}`,
          type: 'tf',
          question: questionText,
          options: ['True', 'False'],
          correctAnswerIndex: 0,
          correctAnswer: correctAnswer === 'False' ? 'False' : 'True',
        };
      }

      return {
        id: `quiz-${Date.now()}-${idx}-${Math.random().toString(36).slice(2,8)}`,
        type: 'short',
        question: questionText,
        options: [],
        correctAnswerIndex: 0,
        correctAnswer,
      };
    });

    setCourse((prev) => ({
      ...prev,
      finalQuiz: {
        ...prev.finalQuiz,
        questions: [...(prev.finalQuiz?.questions || []), ...mapped],
      },
    }));

    toast.success(`${mapped.length} AI-generated question(s) added`);
  };

  const updateQuizSettings = (field, value) => {
    setCourse((prev) => ({
      ...prev,
      finalQuiz: { ...prev.finalQuiz, [field]: value },
    }));
  };

  return {
    // State
    course,
    setCourse,
    lessons,
    setLessons,
    selectedLesson,
    selectedLessonId,
    setSelectedLessonId,
    isQuizSectionOpen,
    setIsQuizSectionOpen,
    isPreviewOpen,
    setIsPreviewOpen,
    draggedLessonId,
    draggedFieldId,
    saveStatus,
    setSaveStatus,
    isLoading,
    isSaving,
    setIsSaving,
    errors,
    setErrors,

    // Methods
    loadCourse,
    addLesson,
    deleteLesson,
    updateLessonTitle,
    addField,
    deleteField,
    updateField,
    handleImageUpload,
    handleHtmlFileUpload,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    handleFieldDragStart,
    handleFieldDragOver,
    handleFieldDrop,
    handleFieldDragEnd,
    addQuizQuestion,
    updateQuizQuestion,
    updateQuizOption,
    deleteQuizQuestion,
    insertGeneratedQuestions,
    updateQuizSettings,
  };
};

export default useCourseBuilder;
