import Field from "../models/mongo/fieldModel.js";
import Lesson from "../models/mongo/lessonModel.js";

// ➕ Create a new content block (Field)
export const createField = async (req, res) => {
  try {
    const { lessonId, type, content, order, questionId, animationId } = req.body;

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const field = await Field.create({ lessonId, type, content, order, questionId, animationId });

    // link field to lesson
    lesson.fieldIds.push(field._id);
    await lesson.save();

    res.status(201).json({ message: "✅ Field created successfully", field });
  } catch (err) {
    res.status(500).json({ message: "❌ Error creating field", error: err.message });
  }
};

// 📄 Get all fields for a lesson
export const getFieldsByLesson = async (req, res) => {
  try {
    const fields = await Field.find({ lessonId: req.params.lessonId }).sort({ order: 1 });
    res.status(200).json(fields);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching fields", error: err.message });
  }
};

// 🧠 Update field
export const updateField = async (req, res) => {
  try {
    const updated = await Field.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Field not found" });
    res.status(200).json({ message: "✅ Field updated successfully", field: updated });
  } catch (err) {
    res.status(500).json({ message: "❌ Error updating field", error: err.message });
  }
};

// 🗑️ Delete field and unlink from lesson
export const deleteField = async (req, res) => {
  try {
    const field = await Field.findById(req.params.id);
    if (!field) return res.status(404).json({ message: "Field not found" });

    await Lesson.findByIdAndUpdate(field.lessonId, { $pull: { fieldIds: field._id } });
    await Field.findByIdAndDelete(field._id);

    res.status(200).json({ message: "✅ Field deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error deleting field", error: err.message });
  }
};
