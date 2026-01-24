import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Code2, Sparkles } from "lucide-react";

export default function AIHtmlGenerateModal({ isOpen, onClose, onSubmit, lessons = [] }) {
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTopic("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errors = [];
    if (!topic || topic.trim().length < 3) {
      errors.push("Topic must be at least 3 characters.");
    }
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
      toast.error(err?.message || "Failed to generate HTML");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Generate HTML Animation</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Create an interactive HTML visualization for your topic. The AI will generate a complete HTML page with animations and interactions.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Topic
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition"
              placeholder="e.g., Data structures: Linked List"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe what you want to visualize or animate
            </p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                <span className="font-semibold">AI will generate:</span> A complete interactive HTML page with CSS and JavaScript for visualization and animation.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate HTML
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
