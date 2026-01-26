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
    children: [],
    // Slide mode properties (when used in slides)
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
    visible: { type: Boolean, default: true }
  },
  { _id: false }
);

// Schema for slides (slide mode only)
const SlideSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    time: { type: Number, default: 0 },
    duration: { type: Number, default: 1.0 },
    easing: { type: String, default: 'ease-in-out' },
    objects: [AnimationObjectSchema],
    connections: [
      {
        id: { type: String },
        fromId: { type: String, required: true },
        toId: { type: String, required: true },
        color: { type: String, default: "#facc15" },
        width: { type: Number, default: 2 }
      }
    ]
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
    // Mode: 'timeline' (default/existing) or 'slides' (new)
    mode: { 
      type: String, 
      enum: ['timeline', 'slides'], 
      default: 'timeline' 
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
    // Timeline mode data
    objects: [AnimationObjectSchema],
    // Slide mode data
    slideData: {
      slides: [SlideSchema],
      objectLibrary: [AnimationObjectSchema]
    },
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

