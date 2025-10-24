import mongoose from 'mongoose';

// Schema for a single animated component
const ComponentSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    type: { type: String, enum: ['circle', 'square', 'triangle', 'text'], required: true },
    style: { type: Object, default: {} }, // CSS styles
    content: { type: String, default: '' } // For text components
  },
  { _id: false }
);

// Schema for a single keyframe/stage
const StageSchema = new mongoose.Schema(
  {
    stageId: { type: Number, required: true },
    duration: { type: Number, default: 1.0 },
    components: [ComponentSchema]
  },
  { _id: false }
);

// Main Animation Schema
const AnimationSchema = new mongoose.Schema({
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  stages: { type: [StageSchema], required: true },
  nextComponentId: { type: Number, default: 1 },
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Animation', AnimationSchema);
