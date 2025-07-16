import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import templateRoute from '../../routes/template';
import mongoose from 'mongoose';

const MONGODB_URI = "mongodb+srv://agent:agent@eprompt.gdos1r8.mongodb.net/Eprompt?retryWrites=true&w=majority&appName=Eprompt";

const app = express();
app.use(express.json());
app.use('/template', templateRoute);

describe('unit: GET /template/all', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should return all public prompt templates', async () => {
    const res = await request(app).get('/template/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Optionally check for at least one template if you know the DB is seeded
    // expect(res.body.length).toBeGreaterThan(0);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('name');
      expect(res.body[0]).toHaveProperty('description');
      expect(res.body[0]).toHaveProperty('template');
      expect(res.body[0]).toHaveProperty('role');
      expect(res.body[0]).toHaveProperty('tags');
      expect(res.body[0]).toHaveProperty('requiredFields');
    }
  });
});
