import Course from "../models/mongo/courseModel.js";
import User from "../models/mongo/userModel.js";
import Lesson from "../models/mongo/lessonModel.js";
import Quiz from "../models/mongo/quizModel.js";
import Field from "../models/mongo/fieldModel.js";
import Question from "../models/mongo/questionModel.js";
import { Teacher } from "../models/mongo/teacherSchema.js";
import { generateQuizFromAI } from "../services/aiService.js";
import { sanitizeLessons } from "../services/sanitizationService.js";
import { createNotification } from "../services/notificationService.js";

// 🧠 CREATE a new course
export const createCourse = async (req, res) => {
  try {
    const { title, description, difficulty, category, thumbnail, teacherId, scoreOnFinish, price, lessons, quiz } = req.body;

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
      category: category || "General",
      thumbnail,
      teacherId,
      scoreOnFinish: scoreOnFinish || 0,
      price: price !== undefined ? Number(price) : 0,
    });

    // Create lessons if provided
    let lessonIds = [];
    if (lessons && Array.isArray(lessons) && lessons.length > 0) {
      // Sanitize lessons content first
      const sanitizedLessons = sanitizeLessons(lessons);
      
      // Create lessons and their fields properly (Fields are separate documents)
      const createdLessonIds = [];
      for (const lesson of sanitizedLessons) {
        const createdLesson = await Lesson.create({ 
          title: lesson.title, 
          courseId: course._id,
          isPreview: lesson.isPreview || false
        });

        // If the lesson contains fields, create Field documents and attach their ids
        let fieldIds = [];
        if (lesson.fields && Array.isArray(lesson.fields) && lesson.fields.length > 0) {
          // Prepare fields to create. For question-type fields, store question data inline on Field.
          const fieldsToCreate = [];
          for (let idx = 0; idx < lesson.fields.length; idx++) {
            const f = lesson.fields[idx];
            const questionId = f.questionId || null; // keep legacy reference if present
            let questionType = f.questionType || (f.type === 'question' ? 'short' : null);
            const options = Array.isArray(f.options) ? f.options : [];
            const correctAnswer = (f.correctAnswer ?? f.answer ?? null);
            const correctAnswerIndex = f.correctAnswerIndex !== undefined ? f.correctAnswerIndex : null;
            const points = f.points !== undefined ? f.points : 1;
            const explanation = f.explanation || "";

            const fieldObj = {
              lessonId: createdLesson._id,
              type: f.type,
              content: f.content,
              questionId: questionId,
              questionType: questionType,
              options: options,
              correctAnswer: correctAnswer,
              correctAnswerIndex: correctAnswerIndex,
              points: points,
              explanation: explanation,
              migratedFromQuestionId: null,
              animationId: f.animationId || null,
              animationPreviewMode: f.animationPreviewMode || "start-stop",
              order: idx,
            };

            fieldsToCreate.push(fieldObj);
          }
          const createdFields = await Field.insertMany(fieldsToCreate);
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
      // Create Question documents if questions are provided
      let questionIds = [];
      if (quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
        console.log(`🧪 createCourse: Processing ${quiz.questions.length} quiz questions...`);
        
        // Validate and map questions
        const questionsToInsert = quiz.questions
          .map((q, idx) => {
            // Skip if no question text
            if (!q || !q.question) {
              console.warn(`⚠️ Question ${idx + 1}: Skipped - Missing question text`);
              return null;
            }

            const options = Array.isArray(q.options) ? q.options.filter(opt => opt !== undefined && opt !== null && String(opt).trim() !== "") : [];
            
            // Try to get correctAnswer from various sources
            let correctAnswer = (q.correctAnswer || '').toString().trim();
            
            // If no explicit correctAnswer but we have a valid correctAnswerIndex, derive from options
            if (!correctAnswer && q.correctAnswerIndex !== undefined && q.correctAnswerIndex !== null) {
              const idx = Number(q.correctAnswerIndex);
              if (Array.isArray(options) && idx >= 0 && idx < options.length) {
                correctAnswer = String(options[idx]).trim();
              }
            }

            // Validate that we have a correct answer
            if (!correctAnswer) {
              console.warn(`⚠️ Question "${q.question.substring(0, 50)}...": Skipped - No correct answer provided`);
              return null;
            }

            console.log(`✅ Question ${idx + 1}: Valid - "${q.question.substring(0, 50)}..."`);

            return {
              text: q.question.trim(),
              type: q.type || 'mcq',
              options: options,
              correctAnswer: correctAnswer,
              correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : null,
              points: q.points || 1,
              explanation: (q.explanation || '').toString()
            };
          })
          .filter(q => q !== null); // Remove null entries (skipped questions)

        console.log(`📊 Questions processed: ${questionsToInsert.length} of ${quiz.questions.length} passed validation`);

        if (questionsToInsert.length > 0) {
          const createdQuestions = await Question.insertMany(questionsToInsert);
          questionIds = createdQuestions.map((q) => q._id);
        }
      }

      const createdQuiz = await Quiz.create({
        title: quiz.title || 'Final Quiz',
        courseId: course._id,
        questionIds: questionIds,
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
    console.error('createCourse error:', err);
    res.status(500).json({ message: "❌ Error creating course", error: err.message });
  }
};

// 📚 GET all courses with pagination and filtering
export const getCourses = async (req, res) => {
  try {
    // Pagination - support "all" for admin views
    const page = parseInt(req.query.page) || 1;
    const limitParam = req.query.limit;
    const limit = limitParam === "all" ? null : (parseInt(limitParam) || 12);
    const skip = limit ? (page - 1) * limit : 0;

    // Build filter
    const filter = {};
    
    // Handle approval status filtering
    if (req.query.approvalStatus !== undefined) {
      const statusValue = req.query.approvalStatus;
      if (statusValue === 'all') {
        // Don't filter by approval status - show all courses
        // (used by admin to see all courses)
      } else if (statusValue === 'draft') {
        filter.$or = [
          { approvalStatus: 'draft' },
          { approvalStatus: { $in: [null, undefined] } }
        ];
      } else {
        filter.approvalStatus = statusValue;
      }
    } else {
      // Default: only approved courses (for public browse)
      filter.approvalStatus = 'approved';
    }

    // Archived filter (exclude archived courses by default unless explicitly requested)
    if (req.query.archived !== undefined) {
      if (req.query.archived === 'all') {
        // Don't filter by archived status - show all (used by admin)
      } else {
        const archivedValue = req.query.archived === 'true';
        filter.archived = archivedValue;
      }
    } else {
      // Default: exclude archived courses from public/teacher views
      filter.archived = { $ne: true };
    }

    // Category filter
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }

    // Difficulty filter
    if (req.query.difficulty && req.query.difficulty !== 'all') {
      filter.difficulty = req.query.difficulty;
    }

    // Price filter
    if (req.query.price === 'free') {
      filter.$or = [
        { price: 0 },
        { price: 'Free' },
        { price: null }
      ];
    } else if (req.query.price === 'paid') {
      filter.price = { $nin: [0, 'Free', null] };
    }

    // Search filter
    if (req.query.search) {
      const searchRegex = { $regex: req.query.search, $options: 'i' };
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Published filter (for admin/teacher views)
    if (req.query.published !== undefined) {
      const publishedValue = req.query.published === 'true';
      filter.published = publishedValue;
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (req.query.sortBy === 'popular') {
      sortOption = { enrollmentCount: -1 };
    } else if (req.query.sortBy === 'rating') {
      sortOption = { averageRating: -1 };
    } else if (req.query.sortBy === 'title') {
      sortOption = { title: 1 };
    }

    // Execute query with pagination (or all results if limit=all)
    const query = Course.find(filter)
      .populate("teacherId", "name email profileImage avatar")
      .select("-__v")
      .sort(sortOption);
    
    if (limit) {
      query.skip(skip).limit(limit);
    }
    
    const [courses, total] = await Promise.all([
      query.lean(),
      Course.countDocuments(filter)
    ]);

    // Attach lesson meta (count + first 3 titles) for course cards
    if (Array.isArray(courses) && courses.length > 0) {
      const courseIds = courses.map((c) => c._id);
      const lessons = await Lesson.find({ courseId: { $in: courseIds } })
        .select("title courseId createdAt")
        .sort({ createdAt: 1 })
        .lean();

      const lessonTitlesByCourse = new Map();
      const lessonCountByCourse = new Map();

      for (const lesson of lessons) {
        const key = String(lesson.courseId);
        const currentCount = lessonCountByCourse.get(key) || 0;
        lessonCountByCourse.set(key, currentCount + 1);

        const titles = lessonTitlesByCourse.get(key) || [];
        if (titles.length < 3) {
          titles.push(lesson.title);
          lessonTitlesByCourse.set(key, titles);
        }
      }

      for (const course of courses) {
        const key = String(course._id);
        const count = lessonCountByCourse.get(key) || 0;
        course.lessons = count;
        course.lessonsCount = count;
        course.lessonTitles = lessonTitlesByCourse.get(key) || [];
      }
    }

    // Return different format based on whether pagination is used
    if (limit) {
      res.status(200).json({
        courses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page < Math.ceil(total / limit)
        }
      });
    } else {
      // No pagination - return array directly for backward compatibility
      res.status(200).json(courses);
    }
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching courses", error: err.message });
  }
};

// 📂 GET unique course categories
export const getCourseCategories = async (req, res) => {
  try {
    const categories = await Course.distinct('category', { approvalStatus: 'approved', archived: { $ne: true } });
    res.status(200).json(['all', ...categories.filter(Boolean).sort()]);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching categories", error: err.message });
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
        select: "title fieldIds isPreview",
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

    // Normalize populated lesson/field objects to ensure frontend receives
    // the new inline question properties regardless of storage quirks.
    let courseObj = course.toObject ? course.toObject() : JSON.parse(JSON.stringify(course));
    if (Array.isArray(courseObj.lessonIds)) {
      courseObj.lessonIds = courseObj.lessonIds.map((lesson) => {
        if (Array.isArray(lesson.fieldIds)) {
          lesson.fieldIds = lesson.fieldIds.map((f) => ({
            _id: f._id || f.id,
            id: f._id || f.id,
            type: f.type,
            content: f.content,
            questionId: f.questionId || null,
            questionType: f.questionType || null,
            options: Array.isArray(f.options) ? f.options : [],
            correctAnswer: (f.correctAnswer ?? f.answer) ?? "",
            correctAnswerIndex: f.correctAnswerIndex !== undefined ? f.correctAnswerIndex : null,
            points: f.points ?? 1,
            explanation: f.explanation ?? "",
            migratedFromQuestionId: f.migratedFromQuestionId ?? null,
            animationId: f.animationId || null,
            animationPreviewMode: f.animationPreviewMode || "start-stop",
            order: f.order ?? 0,
          }));
        }
        return lesson;
      });
    }

    res.status(200).json(courseObj);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching course", error: err.message });
  }
};

// 🧱 UPDATE course
export const updateCourse = async (req, res) => {
  try {
    const { title, description, difficulty, category, thumbnail, scoreOnFinish, price, quizId, lessons, quiz } = req.body;

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
      // Sanitize lessons content first
      const sanitizedLessons = sanitizeLessons(lessons);

      // Fetch existing fields so we can preserve question data if incoming payload lacks it
      const existingFields = await Field.find({ lessonId: { $in: currentCourse.lessonIds } });
      const existingFieldMap = {};
      existingFields.forEach((ef) => {
        existingFieldMap[String(ef._id)] = ef;
      });

      // Delete old lessons and their fields (we will recreate, but try to preserve values above)
      await Field.deleteMany({ lessonId: { $in: currentCourse.lessonIds } });
      await Lesson.deleteMany({ _id: { $in: currentCourse.lessonIds } });

      // Create new lessons
      if (sanitizedLessons.length > 0) {
        const createdLessonIds = [];
        for (const lesson of sanitizedLessons) {
          const createdLesson = await Lesson.create({ 
            title: lesson.title, 
            courseId: req.params.id,
            isPreview: lesson.isPreview || false
          });

          let fieldIds = [];
          if (lesson.fields && Array.isArray(lesson.fields) && lesson.fields.length > 0) {
            const fieldsToCreate = [];
            for (let idx = 0; idx < lesson.fields.length; idx++) {
              const f = lesson.fields[idx];
              const questionId = f.questionId || null;
              const questionType = f.questionType || (f.type === 'question' ? 'short' : null);
              const options = Array.isArray(f.options) ? f.options : [];

              // Prefer incoming correctAnswer; if empty, try to preserve from existing field with same id
              let correctAnswer = (f.correctAnswer ?? f.answer ?? null);
              if ((correctAnswer === null || String(correctAnswer).trim() === "") && f.id && existingFieldMap[f.id]) {
                correctAnswer = existingFieldMap[f.id].correctAnswer ?? existingFieldMap[f.id].answer ?? null;
              }

              const correctAnswerIndex = f.correctAnswerIndex !== undefined ? f.correctAnswerIndex : null;
              const points = f.points !== undefined ? f.points : 1;

              let explanation = f.explanation || "";
              if ((!explanation || String(explanation).trim() === "") && f.id && existingFieldMap[f.id]) {
                explanation = existingFieldMap[f.id].explanation ?? "";
              }

              fieldsToCreate.push({
                lessonId: createdLesson._id,
                type: f.type,
                content: f.content,
                questionId: questionId,
                questionType: questionType,
                options: options,
                correctAnswer: correctAnswer,
                correctAnswerIndex: correctAnswerIndex,
                points: points,
                explanation: explanation,
                migratedFromQuestionId: null,
                animationId: f.animationId || null,
                animationPreviewMode: f.animationPreviewMode || "start-stop",
                order: idx,
              });
            }
            const createdFields = await Field.insertMany(fieldsToCreate);
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
    let newQuizId = currentCourse.quizId;
    if (quiz) {
      // Delete old quiz if exists
      if (currentCourse.quizId) {
        // Also delete associated questions
        const oldQuiz = await Quiz.findById(currentCourse.quizId);
        if (oldQuiz && oldQuiz.questionIds) {
          await Question.deleteMany({ _id: { $in: oldQuiz.questionIds } });
        }
        await Quiz.findByIdAndDelete(currentCourse.quizId);
      }
      
      // Create Question documents if questions are provided
      let questionIds = [];
      if (quiz.questions && Array.isArray(quiz.questions) && quiz.questions.length > 0) {
        console.log(`🧪 updateCourse: Processing ${quiz.questions.length} quiz questions...`);
        
        // Validate and map questions
        const questionsToInsert = quiz.questions
          .map((q, idx) => {
            // Skip if no question text
            if (!q || !q.question) {
              console.warn(`⚠️ Question ${idx + 1}: Skipped - Missing question text`);
              return null;
            }

            const options = Array.isArray(q.options) ? q.options.filter(opt => opt !== undefined && opt !== null && String(opt).trim() !== "") : [];
            
            // Try to get correctAnswer from various sources
            let correctAnswer = (q.correctAnswer || '').toString().trim();
            
            // If no explicit correctAnswer but we have a valid correctAnswerIndex, derive from options
            if (!correctAnswer && q.correctAnswerIndex !== undefined && q.correctAnswerIndex !== null) {
              const idx = Number(q.correctAnswerIndex);
              if (Array.isArray(options) && idx >= 0 && idx < options.length) {
                correctAnswer = String(options[idx]).trim();
              }
            }

            // Validate that we have a correct answer
            if (!correctAnswer) {
              console.warn(`⚠️ Question "${q.question.substring(0, 50)}...": Skipped - No correct answer provided`);
              return null;
            }

            console.log(`✅ Question ${idx + 1}: Valid - "${q.question.substring(0, 50)}..."`);

            return {
              text: q.question.trim(),
              type: q.type || 'mcq',
              options: options,
              correctAnswer: correctAnswer,
              correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : null,
              points: q.points || 1,
              explanation: (q.explanation || '').toString()
            };
          })
          .filter(q => q !== null); // Remove null entries (skipped questions)

        console.log(`📊 Questions processed: ${questionsToInsert.length} of ${quiz.questions.length} passed validation`);

        if (questionsToInsert.length > 0) {
          const createdQuestions = await Question.insertMany(questionsToInsert);
          questionIds = createdQuestions.map((q) => q._id);
        }
      }

      const createdQuiz = await Quiz.create({
        title: quiz.title || 'Final Quiz',
        courseId: req.params.id,
        questionIds: questionIds,
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
        category: category || "General",
        thumbnail,
        scoreOnFinish,
        price: price !== undefined ? Number(price) : 0,
        quizId: newQuizId,
        lessonIds,
        lessonsCount: lessonIds.length,
      },
      { new: true }
    );

    res.status(200).json({ message: "✅ Course updated successfully", course: updatedCourse });
  } catch (err) {
    console.error('updateCourse error:', err);
    res.status(500).json({ message: "❌ Error updating course", error: err.message });
  }
};

// 🗑️ DELETE/ARCHIVE course based on approval status and enrollments
export const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    // Verify ownership (only course creator or admin can delete)
    const userId = req.user?._id || req.user?.id;
    const userRole = req.user?.role;
    const courseTeacherId = course.teacherId?._id || course.teacherId;
    
    if (userRole !== "admin" && String(userId) !== String(courseTeacherId)) {
      return res.status(403).json({ message: "You don't have permission to delete this course" });
    }

    const approvalStatus = course.approvalStatus || "draft";
    const enrollmentCount = course.enrollmentCount || course.students || 0;

    // Admin bypass: Admin can hard delete any course
    if (userRole === "admin") {
      // Delete related lessons and fields
      await Field.deleteMany({ lessonId: { $in: course.lessonIds } });
      await Lesson.deleteMany({ _id: { $in: course.lessonIds } });

      // Delete related quiz
      if (course.quizId) {
        await Quiz.findByIdAndDelete(course.quizId);
      }

      // Delete the course itself
      await Course.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        message: "✅ Course deleted successfully by admin",
        action: "deleted"
      });
    }

    // Business Rules for Teachers:
    // 1. Draft/Rejected courses → Hard delete (safe to remove)
    // 2. Approved courses with enrollments → Block deletion (protect students)
    // 3. Approved courses without enrollments → Archive (set archived=true, published=false)

    if (approvalStatus === "approved") {
      if (enrollmentCount > 0) {
        // Block deletion of courses with enrolled students
        return res.status(403).json({
          message: "Cannot delete approved course with enrolled students. Please contact support if you need to remove this course.",
          action: "blocked",
          enrollmentCount
        });
      } else {
        // Archive approved courses with no enrollments
        course.archived = true;
        course.published = false;
        await course.save();
        
        return res.status(200).json({
          message: "✅ Course archived successfully",
          action: "archived",
          course: course
        });
      }
    } else {
      // Hard delete for Draft/Rejected courses
      // Delete related lessons
      await Field.deleteMany({ lessonId: { $in: course.lessonIds } });
      await Lesson.deleteMany({ _id: { $in: course.lessonIds } });

      // Delete related quiz
      if (course.quizId) {
        await Quiz.findByIdAndDelete(course.quizId);
      }

      // Delete the course itself
      await Course.findByIdAndDelete(req.params.id);

      return res.status(200).json({
        message: "✅ Course deleted successfully",
        action: "deleted"
      });
    }
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

// � SUBMIT course for admin review
export const submitCourseForReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    // Check if course belongs to the teacher
    if (course.teacherId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized to submit this course" });
    }
    
    // Only draft or rejected courses can be submitted
    if (course.approvalStatus !== "draft" && course.approvalStatus !== "rejected") {
      return res.status(400).json({ message: `Course is already ${course.approvalStatus}` });
    }
    
    course.approvalStatus = "pending";
    course.submittedAt = new Date();
    course.rejectionReason = undefined; // Clear previous rejection reason
    await course.save();
    
    res.status(200).json({ 
      message: "Course submitted for review successfully", 
      course 
    });
  } catch (err) {
    console.error("Error submitting course for review:", err);
    res.status(500).json({ message: "Error submitting course for review", error: err.message });
  }
};

// ✅ APPROVE course (admin only)
export const approveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    if (course.approvalStatus !== "pending") {
      return res.status(400).json({ message: "Only pending courses can be approved" });
    }
    
    course.approvalStatus = "approved";
    course.published = true; // Auto-publish when approved
    course.reviewedAt = new Date();
    course.reviewedBy = req.user.id;
    course.rejectionReason = null;
    
    // Increment teacher's points by 10 for approved course
    const teacher = await Teacher.findOne({ userId: course.teacherId });
    if (teacher) {
      teacher.totalPoints = (teacher.totalPoints || 0) + 10;
      await teacher.save();
    }
    
    await course.save();
    
    // Send notification to teacher
    await createNotification({
      recipientId: course.teacherId,
      type: "course_approved",
      title: "Course Approved!",
      message: `Your course "${course.title}" has been approved and published.`,
      entityId: course._id.toString(),
      metadata: { courseName: course.title }
    });
    
    res.status(200).json({ 
      message: "Course approved and published successfully", 
      course 
    });
  } catch (err) {
    console.error("Error approving course:", err);
    res.status(500).json({ message: "Error approving course", error: err.message });
  }
};

// ❌ REJECT course (admin only)
export const rejectCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { reason } = req.body;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    if (course.approvalStatus !== "pending") {
      return res.status(400).json({ message: "Only pending courses can be rejected" });
    }
    
    course.approvalStatus = "rejected";
    course.published = false;
    course.reviewedAt = new Date();
    course.reviewedBy = req.user.id;
    course.rejectionReason = reason || "No reason provided";
    await course.save();
    
    // Send notification to teacher
    await createNotification({
      recipientId: course.teacherId,
      type: "course_rejected",
      title: "Course Rejected",
      message: `Your course "${course.title}" was rejected. Reason: ${course.rejectionReason}`,
      entityId: course._id.toString(),
      metadata: { courseName: course.title, reason: course.rejectionReason }
    });
    
    res.status(200).json({ 
      message: "Course rejected successfully", 
      course 
    });
  } catch (err) {
    console.error("Error rejecting course:", err);
    res.status(500).json({ message: "Error rejecting course", error: err.message });
  }
};

// 📢 TOGGLE course publish status (kept for backward compatibility, admin only now)
export const togglePublishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }
    
    // Toggle the published status
    course.published = !course.published;
    await course.save();
    
    res.status(200).json({ 
      message: course.published ? "Course published successfully" : "Course unpublished successfully", 
      course 
    });
  } catch (err) {
    console.error("Error toggling publish status:", err);
    res.status(500).json({ message: "Error toggling publish status", error: err.message });
  }
};

