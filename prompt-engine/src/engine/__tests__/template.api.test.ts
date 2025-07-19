import { describe, it, expect, afterEach, jest } from '@jest/globals'

import request from "supertest";
import express from "express";
import router from "../../routes/template";

jest.mock("../../models/PromptTemplate", () => ({
  find: jest.fn(),
  findOne: jest.fn(),
}));
jest.mock("../template", () => ({
  createPromptTemplate: jest.fn(),
  updatePromptTemplate: jest.fn(),
  updateEmbeddings: jest.fn(),
}));

const PublicPromptTemplateModel = require("../../models/PromptTemplate");
const { createPromptTemplate, updatePromptTemplate, updateEmbeddings } = require("../template");

const app = express();
app.use(express.json());
app.use("/template", router);

describe("Prompt Template API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /template/all", () => {
    it("should return all templates", async () => {
      PublicPromptTemplateModel.find.mockResolvedValue([{ id: "1" }, { id: "2" }]);
      const res = await request(app).get("/template/all");
      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
    });

    it("should handle errors", async () => {
      PublicPromptTemplateModel.find.mockRejectedValue(new Error("fail"));
      const res = await request(app).get("/template/all");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to fetch templates");
    });
  });

  describe("GET /template/:id", () => {
    it("should return template by id", async () => {
      PublicPromptTemplateModel.findOne.mockResolvedValue({ id: "abc" });
      const res = await request(app).get("/template/abc");
      expect(res.status).toBe(200);
      expect(res.body.id).toBe("abc");
    });

    it("should return 404 if not found", async () => {
      PublicPromptTemplateModel.findOne.mockResolvedValue(null);
      const res = await request(app).get("/template/xyz");
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Template not found");
    });

    it("should handle errors", async () => {
      PublicPromptTemplateModel.findOne.mockRejectedValue(new Error("fail"));
      const res = await request(app).get("/template/abc");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to fetch template");
    });
  });

  describe("POST /template/add", () => {
    it("should create a template", async () => {
      createPromptTemplate.mockResolvedValue({ id: "new" });
      const res = await request(app).post("/template/add").send({ name: "test" });
      expect(res.status).toBe(201);
      expect(res.body.id).toBe("new");
    });

    it("should handle errors", async () => {
      createPromptTemplate.mockRejectedValue(new Error("fail"));
      const res = await request(app).post("/template/add").send({ name: "test" });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to add template");
    });
  });

  describe("POST /template/update", () => {
    it("should update a template", async () => {
      updatePromptTemplate.mockResolvedValue({ id: "upd" });
      const res = await request(app).post("/template/update").send({ id: "upd" });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe("upd");
    });

    it("should return 404 if not found", async () => {
      updatePromptTemplate.mockResolvedValue(null);
      const res = await request(app).post("/template/update").send({ id: "none" });
      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Template not found");
    });

    it("should handle errors", async () => {
      updatePromptTemplate.mockRejectedValue(new Error("fail"));
      const res = await request(app).post("/template/update").send({ id: "err" });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to update template");
    });
  });

  describe("POST /template/update-embedding", () => {
    it("should update embeddings", async () => {
      updateEmbeddings.mockResolvedValue({ total: 2, updated: 1 });
      const res = await request(app).post("/template/update-embedding");
      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Updated embeddings");
      expect(res.body.total).toBe(2);
      expect(res.body.updated).toBe(1);
    });

    it("should handle errors", async () => {
      updateEmbeddings.mockRejectedValue(new Error("fail"));
      const res = await request(app).post("/template/update-embedding");
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Failed to update embeddings");
    });
  });
});
