import mongoose from "mongoose";

const reviewReportSchema = new mongoose.Schema(
  {
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
      required: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
      required: true,
      enum: [
        "Spam or misleading",
        "Hate speech or abusive content",
        "Harassment or bullying",
        "Inappropriate content",
        "Other"
      ],
    },
    additionalInfo: {
      type: String,
      maxlength: 500,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to prevent duplicate reports
reviewReportSchema.index({ reviewId: 1, reporterId: 1 }, { unique: true });

const ReviewReport = mongoose.model("ReviewReport", reviewReportSchema);

export default ReviewReport;
