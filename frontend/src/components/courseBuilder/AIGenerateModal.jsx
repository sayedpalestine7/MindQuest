import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AIGenerateModal({ isOpen, onClose, onSubmit, lessons = [] }) {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionTypes, setQuestionTypes] = useState(["mcq"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [persist, setPersist] = useState(false);
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setTopic("");
      setNumQuestions(5);
      setQuestionTypes(["mcq"]);
      setIsSubmitting(false);
      setSelectedLessonIds([]);
    }
  }, [isOpen]);

  // Auto-fill topic when lessons are selected
  const handleLessonToggle = (lessonId) => {
    setSelectedLessonIds((prev) => {
      const newIds = prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId];
      
      // Update topic with all selected lesson titles
      if (newIds.length > 0) {
          const selectedTitles = newIds
            .map((id) => lessons.find((l) => l.id === id)?.title)
          .filter(Boolean);
        setTopic(selectedTitles.join(", "));
      } else {
        setTopic("");
      }
      
      return newIds;
    });
  };

  if (!isOpen) return null;

  const validate = () => {
    const errors = [];
    if (!topic || topic.trim().length < 5) errors.push("Topic must be at least 5 characters.");
    if (!Number.isInteger(Number(numQuestions)) || numQuestions < 1 || numQuestions > 50) errors.push("Number of questions must be between 1 and 50.");
    if (!Array.isArray(questionTypes) || questionTypes.length === 0) errors.push("Select at least one question type.");
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validate();
    if (errors.length > 0) {
      errors.forEach((e) => toast.error(e));
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        topic: topic.trim(),
        numQuestions: Number(numQuestions),
        questionTypes,
        persist,
      };

      // Allow caller to return a promise for awaiting
      const maybePromise = onSubmit(payload);
      if (maybePromise && typeof maybePromise.then === "function") {
        await maybePromise;
      }

      setIsSubmitting(false);
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err?.message || "Failed to generate questions");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Generate Quiz with AI</h3>
        <div className="space-y-3">
          {/* Lesson selector - only shown when lessons exist */}
          {lessons.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Use lesson titles as topic (optional)
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded p-2 space-y-1">
                {lessons.map((lesson) => (
                  <label key={lesson.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedLessonIds.includes(lesson.id)}
                      onChange={() => handleLessonToggle(lesson.id)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{lesson.title || "Untitled Lesson"}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Topic</label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded p-2"
              placeholder="e.g. Linear algebra: eigenvalues"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of questions</label>
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                className="mt-1 block w-full border-gray-200 rounded p-2"
                min={1}
                max={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Question types (choose one or more)</label>
              <div className="mt-1 space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={questionTypes.includes("mcq")}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setQuestionTypes((prev) => {
                        if (checked) return Array.from(new Set([...prev, "mcq"]));
                        return prev.filter((t) => t !== "mcq");
                      });
                    }}
                  />
                  Multiple Choice
                </label>

                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={questionTypes.includes("t/f")}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setQuestionTypes((prev) => {
                        if (checked) return Array.from(new Set([...prev, "t/f"]));
                        return prev.filter((t) => t !== "t/f");
                      });
                    }}
                  />
                  True / False
                </label>

                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={questionTypes.includes("short")}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setQuestionTypes((prev) => {
                        if (checked) return Array.from(new Set([...prev, "short"]));
                        return prev.filter((t) => t !== "short");
                      });
                    }}
                  />
                  Short Answer
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <label className="inline-flex items-center mr-3">
              <input type="checkbox" className="mr-2" checked={persist} onChange={(e) => setPersist(e.target.checked)} />
              <span className="text-sm">Persist to course quiz</span>
            </label>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
