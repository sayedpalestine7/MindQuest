import Course from "../models/mongo/courseModel.js";
import User from "../models/mongo/userModel.js";
import Lesson from "../models/mongo/lessonModel.js";
import Quiz from "../models/mongo/quizModel.js";
import Field from "../models/mongo/fieldModel.js";
import Question from "../models/mongo/questionModel.js";
import { generateQuizFromAI } from "../services/aiService.js";

// 🧠 CREATE a new course
export const createCourse = async (req, res) => {
  try {
    const { title, description, difficulty, thumbnail, teacherId, scoreOnFinish, lessons, quiz } = req.body;

    try {
      console.log('createCourse payload lessons (full):', JSON.stringify(lessons, null, 2))
    } catch (e) {
      console.log('createCourse payload lessons preview:', Array.isArray(lessons) ? lessons.map(l => ({ title: l.title, fieldsCount: l.fields?.length || 0, fieldsPreview: (l.fields||[]).slice(0,5) })) : lessons)
    }

    // Validate teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({ message: "Invalid teacher ID or user is not a teacher" });
    }

    // Create the course first (without lessons/quiz)
    const course = await Course.create({
      title,
      description,
      difficulty,
      thumbnail,
      teacherId,
      scoreOnFinish: scoreOnFinish || 0,
    });

    // Create lessons if provided
    let lessonIds = [];
    if (lessons && Array.isArray(lessons) && lessons.length > 0) {
      // Create lessons and their fields properly (Fields are separate documents)
      const createdLessonIds = [];
      for (const lesson of lessons) {
        const createdLesson = await Lesson.create({ title: lesson.title, courseId: course._id });

        // If the lesson contains fields, create Field documents and attach their ids
        let fieldIds = [];
        if (lesson.fields && Array.isArray(lesson.fields) && lesson.fields.length > 0) {
          const createdFields = await Field.insertMany(
            lesson.fields.map((f, idx) => ({
              lessonId: createdLesson._id,
              type: f.type,
              content: f.content,
              questionId: f.questionId || null,
              animationId: f.animationId || null,
              order: idx,
            }))
          );
          fieldIds = createdFields.map((cf) => cf._id);
        }

        // Update lesson with fieldIds
        if (fieldIds.length > 0) {
          createdLesson.fieldIds = fieldIds;
          await createdLesson.save();
        }

        createdLessonIds.push(createdLesson._id);
      }

      lessonIds = createdLessonIds;
    }

    // Create quiz if provided
    let quizId = null;
    if (quiz) {
      const createdQuiz = await Quiz.create({
        ...quiz,
        courseId: course._id, // Now we have the course ID
      });
      quizId = createdQuiz._id;
    }

    // Update the course with lesson and quiz IDs
    const updatedCourse = await Course.findByIdAndUpdate(
      course._id,
      {
        lessonIds,
        quizId,
        lessonsCount: lessonIds.length,
      },
      { new: true }
    );

    res.status(201).json({ message: "✅ Course created successfully", course: updatedCourse });
  } catch (err) {
    res.status(500).json({ message: "❌ Error creating course", error: err.message });
  }
};

// 📚 GET all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacherId", "name email profileImage")
      .select("-__v");
    res.status(200).json(courses);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching courses", error: err.message });
  }
};

// 🎯 GET single course by ID (with lessons + quiz)
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacherId", "name email profileImage")
      .populate({
        path: "lessonIds",
        model: "Lesson",
        select: "title fieldIds",
        populate: {
          path: "fieldIds",
          model: "Field",
        },
      })
      .populate({
        path: "quizId",
        model: "Quiz",
        populate: {
          path: "questionIds",
          model: "Question",
        },
      });

    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json(course);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching course", error: err.message });
  }
};

// 🧱 UPDATE course
export const updateCourse = async (req, res) => {
  try {
    const { title, description, difficulty, thumbnail, scoreOnFinish, quizId, lessons, quiz } = req.body;

    try {
      console.log('updateCourse payload lessons (full):', JSON.stringify(lessons, null, 2))
    } catch (e) {
      console.log('updateCourse payload lessons preview:', Array.isArray(lessons) ? lessons.map(l => ({ title: l.title, fieldsCount: l.fields?.length || 0, firstFields: (l.fields||[]).slice(0,3) })) : lessons)
    }

    // Find the current course
    const currentCourse = await Course.findById(req.params.id);
    if (!currentCourse) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Update lessons if provided
    let lessonIds = currentCourse.lessonIds;
    if (lessons && Array.isArray(lessons)) {
      // Delete old lessons
      // Delete old lessons and their fields
      await Field.deleteMany({ lessonId: { $in: currentCourse.lessonIds } });
      await Lesson.deleteMany({ _id: { $in: currentCourse.lessonIds } });

      // Create new lessons
      if (lessons.length > 0) {
        const createdLessonIds = [];
        for (const lesson of lessons) {
          const createdLesson = await Lesson.create({ title: lesson.title, courseId: req.params.id });

          let fieldIds = [];
          if (lesson.fields && Array.isArray(lesson.fields) && lesson.fields.length > 0) {
            const createdFields = await Field.insertMany(
              lesson.fields.map((f, idx) => ({
                lessonId: createdLesson._id,
                type: f.type,
                content: f.content,
                questionId: f.questionId || null,
                animationId: f.animationId || null,
                order: idx,
              }))
            );
            fieldIds = createdFields.map((cf) => cf._id);
          }

          if (fieldIds.length > 0) {
            createdLesson.fieldIds = fieldIds;
            await createdLesson.save();
          }

          createdLessonIds.push(createdLesson._id);
        }

        lessonIds = createdLessonIds;
      } else {
        lessonIds = [];
      }
    }

    // Update quiz if provided
    let newQuizId = quizId || currentCourse.quizId;
    if (quiz) {
      // Delete old quiz if exists
      if (currentCourse.quizId) {
        await Quiz.findByIdAndDelete(currentCourse.quizId);
      }
      const createdQuiz = await Quiz.create({
        ...quiz,
        courseId: req.params.id,
      });
      newQuizId = createdQuiz._id;
    }

    // Update the course
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        difficulty,
        thumbnail,
        scoreOnFinish,
        quizId: newQuizId,
        lessonIds,
        lessonsCount: lessonIds.length,
      },
      { new: true }
    );

    res.status(200).json({ message: "✅ Course updated successfully", course: updatedCourse });
  } catch (err) {
    res.status(500).json({ message: "❌ Error updating course", error: err.message });
  }
};

// 🗑️ DELETE course (and its lessons + quiz)
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Delete related lessons
    await Field.deleteMany({ lessonId: { $in: course.lessonIds } });
    await Lesson.deleteMany({ _id: { $in: course.lessonIds } });

    // Delete related quiz
    if (course.quizId) {
      await Quiz.findByIdAndDelete(course.quizId);
    }

    // Delete the course itself
    await Course.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "✅ Course and related data deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error deleting course", error: err.message });
  }
};

// 🔮 Generate quiz using AI (calls aiService). Returns structured questions (does not persist by default).
export const generateQuiz = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { topic, numQuestions } = req.body;
    let questionTypes = req.body.questionTypes || req.body.types || req.body.typesArray || [];

    // Normalize incoming type tokens to canonical values used by backend and AI: mcq, tf, short
    if (!Array.isArray(questionTypes)) questionTypes = [questionTypes];
    questionTypes = questionTypes.map(t => {
      const s = String(t || '').toLowerCase().trim();
      if (['t/f','tf','true_false','truefalse','true','false'].includes(s)) return 'tf';
      if (['short','short_answer','short-answer','shortanswer'].includes(s)) return 'short';
      if (['mcq','multiple','multiple_choice','multiple-choice','multiplechoice'].includes(s)) return 'mcq';
      return 'mcq';
    });
    // dedupe
    questionTypes = [...new Set(questionTypes)];

    console.debug('generateQuiz: normalized questionTypes=', questionTypes);

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found", data: { questions: [] }, error: "CourseNotFound" });
    }

    // Basic validation
    if (!topic || typeof topic !== 'string' || topic.trim() === '' || !Number.isInteger(numQuestions) || numQuestions < 1 || numQuestions > 50 || !Array.isArray(questionTypes) || questionTypes.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid payload", data: { questions: [] }, error: "ValidationError" });
    }

    // Try AI service
    const aiResult = await generateQuizFromAI({ topic: topic.trim(), numQuestions, questionTypes });
    // if (!aiResult.success) {
    //   // Fallback to deterministic mock so frontend still gets results
    //   const questions = [];
    //   for (let i = 1; i <= numQuestions; i++) {
    //     const qType = questionTypes[(i - 1) % questionTypes.length];
    //     const lower = String(qType).toLowerCase();
    //     let options = [];
    //     if (lower.includes('multiple')) options = ['Option A', 'Option B', 'Option C', 'Option D'];
    //     else if (lower.includes('true')) options = ['True', 'False'];
    //     questions.push({ question: `Question ${i}: ${topic}`, type: qType, options, correctAnswerIndex: 0 });
    //   }
    //   return res.status(200).json({ success: true, message: "AI not available — returning mock questions", data: { questions }, error: null });
    // }

    return res.status(200).json({ success: true, message: "AI generated questions", data: { questions: aiResult.questions }, error: null });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Error generating quiz", data: { questions: [] }, error: err.message });
  }
};

// 📨 Import questions (from n8n or external webhook) and optionally create/attach a Quiz
export const importQuestions = async (req, res) => {
  try {
    const courseId = req.params.id;
    const { questions, createQuiz = true, quizTitle } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "Invalid payload: questions array required" });
    }

    // Validate & normalize incoming questions
    const normalized = [];
    for (const q of questions) {
      const text = (q.text || q.questionText || q.question || '').toString().trim();
      let type = (q.type || '').toString().toLowerCase().trim();
      const options = Array.isArray(q.options) ? q.options.map(o => o.toString()) : [];
      const correctAnswer = (q.correctAnswer || '').toString();
      const explanation = (q.explanation || '').toString();
      const points = Number.isInteger(q.points) ? q.points : (q.points ? parseInt(q.points, 10) : 1);

      if (!text || !correctAnswer) {
        return res.status(400).json({ success: false, message: "Invalid question: text and correctAnswer required", example: q });
      }

      // normalize types: allow 'true_false' or 't/f' -> model uses 'tf'
      if (type === 'true_false' || type === 't/f' || type === 'truefalse') type = 'tf';
      if (type === 'true' || type === 'false') type = 'tf';
      if (!['mcq','tf','short'].includes(type)) {
        // default to mcq if options present, else short
        type = options.length > 0 ? 'mcq' : 'short';
      }

      // enforce MCQ options count
      if (type === 'mcq') {
        if (!Array.isArray(options) || options.length < 3) {
          return res.status(400).json({ success: false, message: "MCQ questions must have 3–5 options", question: text });
        }
      }

      // for tf and short, force empty options
      const finalOptions = (type === 'mcq') ? options.slice(0,5) : [];

      normalized.push({ text, type, options: finalOptions, correctAnswer, points: points || 1, explanation });
    }

    // Insert questions
    const created = await Question.insertMany(normalized.map(q => ({
      text: q.text,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      points: q.points,
      explanation: q.explanation
    })));

    let createdQuiz = null;
    if (createQuiz) {
      if (course.quizId) {
        // Append (prepend new items so they appear above previous questions)
        const existingQuiz = await Quiz.findById(course.quizId);
        if (existingQuiz) {
          const newIds = created.map(c => c._id);
          existingQuiz.questionIds = [...newIds, ...(existingQuiz.questionIds || [])];
          await existingQuiz.save();
          createdQuiz = existingQuiz;
        } else {
          const quiz = await Quiz.create({
            title: quizTitle || `Generated: ${course.title}`,
            courseId: course._id,
            questionIds: created.map(c => c._id)
          });
          course.quizId = quiz._id;
          await course.save();
          createdQuiz = quiz;
        }
      } else {
        const quiz = await Quiz.create({
          title: quizTitle || `Generated: ${course.title}`,
          courseId: course._id,
          questionIds: created.map(c => c._id)
        });
        // attach to course
        course.quizId = quiz._id;
        await course.save();
        createdQuiz = quiz;
      }
    }

    return res.status(201).json({ success: true, message: 'Imported questions', data: { questions: created, quiz: createdQuiz } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error importing questions', error: err.message });
  }
};
