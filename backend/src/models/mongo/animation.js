import mongoose from "mongoose";

// Schema for individual transitions/keyframes
const TransitionSchema = new mongoose.Schema(
  {
    startTime: { type: Number, required: true },
    duration: { type: Number, required: true },
    x: { type: Number },
    y: { type: Number },
    width: { type: Number },
    height: { type: Number },
    scale: { type: Number, default: 1 },
    rotation: { type: Number, default: 0 },
    color: { type: String },
    fillColor: { type: String },
    strokeColor: { type: String },
    borderWidth: { type: Number, default: 2 },
    openTop: { type: Boolean, default: false },
    text: { type: String },
    opacity: { type: Number, default: 1 },
    easing: { type: String, default: "linear" }
  },
  { _id: false }
);

// Schema for individual animation objects
const AnimationObjectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["circle", "square", "triangle", "rectangle", "text", "group"],
      required: true
    },
    transitions: [TransitionSchema],
    children: []
  },
  { _id: false }
);

// Main Animation Schema
const AnimationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, maxlength: 1000 },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    duration: { type: Number, default: 15 },
    durationOverride: { type: Number, default: null },
    canvasWidth: { type: Number, default: null },
    canvasHeight: { type: Number, default: null },
    connections: [
      {
        fromId: { type: String, required: true },
        toId: { type: String, required: true },
        color: { type: String, default: "#facc15" },
        width: { type: Number, default: 2 }
      }
    ],
    objects: [AnimationObjectSchema],
    isPublished: { type: Boolean, default: false },
    tags: [{ type: String }]
  },
  { timestamps: true }
);

// Add indexes for better query performance
AnimationSchema.index({ authorId: 1 });
AnimationSchema.index({ title: 1 });
AnimationSchema.index({ createdAt: -1 });

export default mongoose.model("Animation", AnimationSchema);

