import React from "react"
import { Upload, FileText, CheckCircle2, X } from "lucide-react"

/**
 * Reusable file upload component for teaching certifications
 * 
 * Props:
 * - file: the current uploaded file object
 * - setFile: function to set the file
 * - uploading: boolean for loading state
 * - setUploading: function to toggle uploading state
 * - handleFileUpload: function to handle file upload logic
 * - handleRemoveFile: function to remove file
 */
function CertificationUpload({
  file,
  setFile,
  uploading,
  setUploading,
  handleFileUpload,
  handleRemoveFile,
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="certification" className="text-sm font-medium">
        Teaching Certification <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-muted-foreground mb-2">
        Upload your teaching certificate, degree, or professional credentials
      </p>

      {!file ? (
        <label
          htmlFor="certification"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, or PNG (max 5MB)
                </p>
              </>
            )}
          </div>
          <input
            id="certification"
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,application/pdf"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0]
              if (selectedFile) {
                handleFileUpload(selectedFile, setFile, setUploading)
              }
            }}
            disabled={uploading}
          />
        </label>
      ) : (
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <button
              type="button"
              onClick={() => handleRemoveFile(setFile, file.url)}
              className="text-destructive hover:text-destructive/80"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CertificationUpload
