import express from 'express';
import dotenv from 'dotenv';
import generateRoute from './routes/generate';
import refineRoute from './routes/refine';

dotenv.config();

const app = express();
app.use(express.json());

app.use('/generate', generateRoute);
app.use('/refine', refineRoute);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`Prompt Engine API listening on port ${PORT}`);
});
