import React, { useState } from "react"
import { X } from "lucide-react"

export default function TeacherDialog({ teacher, onClose, onAction }) {
  const [previewImage, setPreviewImage] = useState(null)
  const profileImage =
    teacher.avatar ||
    (teacher.certificates && teacher.certificates.length > 0 && teacher.certificates[0]
      ? (typeof teacher.certificates[0] === "string"
        ? teacher.certificates[0]
        : teacher.certificates[0].url)
      : "/default-avatar.png")

  const certificates = teacher.certificates?.filter(Boolean) || []

  const openPdfInNewTab = (src) => {
    try {
      if (!src) return;

      // If already a normal URL (not data:), just open it
      if (!src.startsWith("data:")) {
        window.open(src, "_blank", "noopener,noreferrer");
        return;
      }

      // Convert data URL to Blob URL so browsers allow opening it
      const base64Match = src.match(/^data:(.*);base64,(.*)$/);
      if (!base64Match) {
        window.open(src, "_blank", "noopener,noreferrer");
        return;
      }

      const mimeType = base64Match[1] || "application/pdf";
      const base64Data = base64Match[2];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);

      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("Failed to open PDF", e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-white rounded-lg p-6 max-w-3xl w-full relative">
        <button className="absolute top-2 right-2 text-white" onClick={onClose}>
          <X className="hover:scale-110 hover:text-red-500 hover:bg-gray-100 rounded p-1 transition-all duration-200 cursor-pointer" />
        </button>

        <div className="flex flex-row items-center mb-4 gap-4">
          <img
            src={profileImage}
            alt={teacher.name}
            className="w-24 h-24 rounded-full object-cover border border-gray-600 mb-3"
          />
          <div>
            <h2 className="text-xl font-bold mb-2">{teacher.name}</h2>
            <p className="text-white mb-4">{teacher.email}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-white">Specialization</p>
            <p>{teacher.specialization || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-white mb-2">Institution / University</p>
            <p className="mb-4">{teacher.institution || "-"}</p>
          </div>
        </div>

        <h3 className="font-medium mb-2">
          Certificates ({certificates.length})
        </h3>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {certificates.length > 0 ? (
            certificates.map((cert, i) => {
              const src = typeof cert === "string" ? cert : cert.url;
              const isPdf =
                typeof src === "string" &&
                (src.startsWith("data:application/pdf") || src.toLowerCase().endsWith(".pdf"));

              if (isPdf) {
                return (
                  <div
                    key={i}
                    className="border rounded p-4 flex flex-col items-center justify-center gap-2 bg-gray-800"
                  >
                    <span className="text-sm text-gray-200 font-medium">
                      PDF Certificate {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => openPdfInNewTab(src)}
                      className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View PDF
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={i}
                  type="button"
                  className="border rounded overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setPreviewImage(src)}
                >
                  <img
                    src={src}
                    alt={`Certificate ${i + 1}`}
                    className="h-40 w-full object-cover"
                  />
                </button>
              );
            })
          ) : (
            <p className="text-gray-400 col-span-2">No certificates available</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onAction("approve")}
            className="flex-1 bg-green-600 text-white rounded py-2 hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => onAction("reject")}
            className="flex-1 bg-red-600 text-white rounded py-2 hover:bg-red-700"
          >
            Reject
          </button>
        </div>
        {previewImage && (
          <div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-3xl w-[90vw] max-h-[90vh] bg-gray-900 rounded-lg p-4 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="absolute top-2 right-2 text-white hover:text-red-400"
                onClick={() => setPreviewImage(null)}
              >
                <X />
              </button>
              <img
                src={previewImage}
                alt="Certificate preview"
                className="max-w-full max-h-[80vh] object-contain rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
