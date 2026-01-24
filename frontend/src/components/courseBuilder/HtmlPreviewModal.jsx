import React, { useRef } from "react";
import { X, Download, Plus, Maximize2 } from "lucide-react";
import { downloadHtml } from "../../utils/courseBuilderUtils";
import toast from "react-hot-toast";

export default function HtmlPreviewModal({ isOpen, onClose, htmlContent, filename, onAddToLesson }) {
  const iframeRef = useRef(null);

  if (!isOpen || !htmlContent) return null;

  const handleDownload = () => {
    try {
      downloadHtml(htmlContent, filename);
      toast.success("HTML file downloaded");
    } catch (err) {
      toast.error("Failed to download HTML");
    }
  };

  const handleFullscreen = () => {
    const el = iframeRef.current;
    if (!el) return;
    const request = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (request) request.call(el);
  };

  const handleAddToLesson = () => {
    if (onAddToLesson) {
      onAddToLesson();
    }
  };

  // Create data URL for preview (avoids blob iframe restrictions)
  const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">HTML</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Generated HTML Preview</h3>
              <p className="text-sm text-gray-600">{filename}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden relative bg-gray-100">
          <div className="absolute top-2 right-2 z-10">
            <button
              onClick={handleFullscreen}
              className="bg-black/60 hover:bg-black/75 text-white px-3 py-2 rounded-lg shadow-md transition flex items-center gap-2"
            >
              <Maximize2 className="w-4 h-4" />
              Fullscreen
            </button>
          </div>
          <iframe
            ref={iframeRef}
            src={dataUrl}
            className="w-full h-full bg-white"
            title="HTML Preview"
            sandbox="allow-scripts allow-same-origin"
            allow="fullscreen"
          />
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
          >
            Close
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download HTML
          </button>
          {onAddToLesson && (
            <button
              onClick={handleAddToLesson}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to Lesson
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
