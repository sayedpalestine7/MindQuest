import Question from "../models/mongo/questionModel.js";

// ➕ Create new question
export const createQuestion = async (req, res) => {
  try {
    const { text, type, options, correctAnswer, points, explanation } = req.body;
    const question = await Question.create({
      text,
      type,
      options,
      correctAnswer,
      points,
      explanation,
    });
    res.status(201).json({ message: "✅ Question created", question });
  } catch (err) {
    res.status(500).json({ message: "❌ Error creating question", error: err.message });
  }
};

// 📋 Get all questions
export const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ message: "❌ Error fetching questions", error: err.message });
  }
};

// ✏️ Update question
export const updateQuestion = async (req, res) => {
  try {
    const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Question not found" });
    res.status(200).json({ message: "✅ Question updated", question: updated });
  } catch (err) {
    res.status(500).json({ message: "❌ Error updating question", error: err.message });
  }
};

// 🗑️ Delete question
export const deleteQuestion = async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Question not found" });
    res.status(200).json({ message: "✅ Question deleted" });
  } catch (err) {
    res.status(500).json({ message: "❌ Error deleting question", error: err.message });
  }
};
