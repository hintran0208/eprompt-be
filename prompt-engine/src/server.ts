import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import generateRoute from './routes/generate';
import refineRoute from './routes/refine';

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
if (!process.env.MONGO_URI) {
  throw new Error('❌ MONGO_URI is not found');
}
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

app.use('/generate', generateRoute);
app.use('/refine', refineRoute);
app.get("/health", (req: Request, res: Response) => res.status(200).json({ status: "healthy", service: "ePrompt Backend API" }));

app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Prompt Engine API listening on port ${PORT}`);
});
