import { Router } from "express";
import Flashcard from "../models/Flashcard.js";
import ReviewProgress from "../models/ReviewProgress.js";

const router = Router();

router.get("/health", (_req, res) => res.json({ ok: true, service: "slate-api" }));

router.get("/flashcards", async (req, res, next) => {
  try {
    const filter = req.query.topic ? { topic: req.query.topic } : {};
    res.json(await Flashcard.find(filter).sort({ topic: 1, createdAt: 1 }).lean());
  } catch (err) { next(err); }
});

router.post("/flashcards", async (req, res, next) => {
  try {
    const { topic, question, answer, code = "" } = req.body;
    if (![topic, question, answer].every(v => typeof v === "string" && v.trim())) {
      return res.status(400).json({ error: "topic, question and answer are required strings" });
    }
    res.status(201).json(await Flashcard.create({ topic, question, answer, code }));
  } catch (err) { next(err); }
});

router.get("/progress/:learnerId", async (req, res, next) => {
  try {
    res.json(await ReviewProgress.find({ learnerId: req.params.learnerId }).populate("cardId").lean());
  } catch (err) { next(err); }
});

router.put("/progress/:learnerId/:cardId", async (req, res, next) => {
  try {
    const { easeFactor, repetitions, intervalDays, dueAt } = req.body;
    const updated = await ReviewProgress.findOneAndUpdate(
      { learnerId: req.params.learnerId, cardId: req.params.cardId },
      { $set: { easeFactor, repetitions, intervalDays, dueAt } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
