import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '1mb' }));

const progressSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'default' },
  progress: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
const Progress = mongoose.model('Progress', progressSchema);

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'slate-api' }));
app.get('/api/progress', async (_req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.json({ progress: {} });
    const record = await Progress.findOne({ key: 'default' }).lean();
    res.json({ progress: record?.progress || {} });
  } catch (error) { next(error); }
});
app.put('/api/progress', async (req, res, next) => {
  try {
    const progress = req.body?.progress;
    if (!progress || typeof progress !== 'object' || Array.isArray(progress)) {
      return res.status(400).json({ error: 'progress must be an object' });
    }
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database is not connected; browser backup was saved.' });
    }
    await Progress.findOneAndUpdate({ key: 'default' }, { $set: { progress } }, { upsert: true, new: true });
    res.json({ ok: true });
  } catch (error) { next(error); }
});
app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

const port = Number(process.env.PORT || 5000);
try {
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } else {
    console.warn('MONGO_URI not set. API health works; progress uses browser localStorage until MongoDB is configured.');
  }
} catch (error) {
  console.error('MongoDB connection failed:', error.message);
  console.warn('Server will run without MongoDB; flashcard progress remains in browser localStorage.');
}
app.listen(port, () => console.log(`Slate API listening on http://localhost:${port}`));
