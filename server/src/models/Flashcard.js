import mongoose from "mongoose";

const flashcardSchema = new mongoose.Schema({
  topic: { type: String, required: true, trim: true, index: true },
  question: { type: String, required: true, trim: true },
  answer: { type: String, required: true, trim: true },
  code: { type: String, default: "" }
}, { timestamps: true });

export default mongoose.model("Flashcard", flashcardSchema);
