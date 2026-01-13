import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    mimetype: { type: String, default: "image/png" },
    data: { 
      type: Buffer, 
      required: true,
      get: function(value) {
        // Ensure data is returned as Buffer
        return value instanceof Buffer ? value : Buffer.from(value);
      }
    },
    size: { type: Number, required: true }, // File size in bytes
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Who uploaded
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" }, // Associated course (optional)
    fieldId: { type: String }, // Associated field ID (optional)
  },
  { 
    timestamps: true,
    // Don't select data by default for list operations
    toJSON: { 
      transform: function(doc, ret) {
        // Remove data from JSON representation unless specifically requested
        if (ret.data && !this.__selectingData) {
          delete ret.data;
        }
        return ret;
      }
    }
  }
);

// Index for quick lookups
imageSchema.index({ filename: 1 });
imageSchema.index({ courseId: 1 });
imageSchema.index({ createdAt: 1 });

export default mongoose.models.Image || mongoose.model("Image", imageSchema);
