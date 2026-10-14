import mongoose from "mongoose";

const reviewProgressSchema = new mongoose.Schema({
  learnerId: { type: String, required: true, index: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: "Flashcard", required: true },
  easeFactor: { type: Number, default: 2.5, min: 1.3 },
  repetitions: { type: Number, default: 0, min: 0 },
  intervalDays: { type: Number, default: 0, min: 0 },
  dueAt: { type: Date, default: Date.now }
}, { timestamps: true });
reviewProgressSchema.index({ learnerId: 1, cardId: 1 }, { unique: true });

export default mongoose.model("ReviewProgress", reviewProgressSchema);
