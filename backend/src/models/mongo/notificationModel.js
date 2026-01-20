import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["course_approved", "course_rejected", "enrollment", "review", "report_status", "payment"],
      required: true 
    },
    title: { 
      type: String, 
      required: true 
    },
    message: { 
      type: String, 
      required: true 
    },
    entityId: { 
      type: String, // ID of related entity (course, review, report, etc.)
      required: false 
    },
    metadata: { 
      type: mongoose.Schema.Types.Mixed, // Additional data (courseName, status, etc.)
      default: {} 
    },
    isRead: { 
      type: Boolean, 
      default: false 
    }
  },
  { timestamps: true }
);

// Index for efficient queries by recipient and read status
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, isRead: 1 });

export default mongoose.models.Notification || mongoose.model("Notification", notificationSchema);
