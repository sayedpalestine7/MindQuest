import Lesson from "../models/mongo/lessonModel.js";
import Course from "../models/mongo/courseModel.js";

// 📘 Create a new lesson and link it to a course
export const createLesson = async (req, res) => {
  try {
    // debug: log incoming body and courseId
    console.debug('[createLesson] req.body =', JSON.stringify(req.body));
    const { title, isPreview } = req.body;

    console.debug('[createLesson] req.body.courseId =', req.body.courseId);
    const course = await Course.findById(req.body.courseId);
    console.debug('[createLesson] course found =', course ? course._id.toString() : null);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const createPayload = { 
      title, 
      courseId: course._id, 
      fieldIds: [],
      isPreview: isPreview || false
    };
    console.debug('[createLesson] createPayload =', JSON.stringify(createPayload));

    const lesson = await Lesson.create(createPayload);

    // link lesson to course
    course.lessonIds.push(lesson._id);
    await course.save();

    res.status(201).json({ message: "✅ Lesson created successfully", lesson });
  } catch (err) {
    res.status(500).json({ message: "❌ Error creating lesson", error: err.message });
  }
};

// 📚 Get all lessons in a specific course
export const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.find({ courseId: req.params.courseId })
      .populate("fieldIds")
      .sort({ createdAt: 1 });

    res.status(200).json(lessons);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching lessons", error: err.message });
  }
};

// 🎯 Get a single lesson
export const getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate("fieldIds");
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
    res.status(200).json(lesson);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching lesson", error: err.message });
  }
};

// 🧠 Update lesson title
export const updateLesson = async (req, res) => {
  try {
    const { title, isPreview } = req.body;
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (isPreview !== undefined) updateData.isPreview = isPreview;
    
    const updated = await Lesson.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Lesson not found" });
    res.status(200).json({ message: "✅ Lesson updated successfully", lesson: updated });
  } catch (err) {
    res.status(500).json({ message: "❌ Error updating lesson", error: err.message });
  }
};

// 🗑️ Delete a lesson and unlink from its course
export const deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    await Course.findByIdAndUpdate(lesson.courseId, {
      $pull: { lessonIds: lesson._id },
    });

    await Lesson.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "✅ Lesson deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error deleting lesson", error: err.message });
  }
};
