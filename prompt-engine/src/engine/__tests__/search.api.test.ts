import { describe, it, expect, afterEach, jest } from '@jest/globals'

import request from "supertest";
import express from "express";
import router from "../../routes/search";

jest.mock("../search", () => ({
  semanticSearch: jest.fn(),
  extractPrefix: jest.fn(() => ({ prefix: ":default ", text: "test" })),
}));

const { semanticSearch } = require("../search");

const app = express();
app.use(express.json());
app.use("/search", router);

describe("Search API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /search/", () => {
    it("should return semantic search results", async () => {
      semanticSearch.mockResolvedValue([{ id: "abc" }]);
      const res = await request(app)
        .post("/search/")
        .send({ query: "test", limit: 3 });
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].id).toBe("abc");
    });

    it("should return 400 if missing query", async () => {
      const res = await request(app)
        .post("/search/")
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Missing text input");
    });

    it("should return 500 on error", async () => {
      semanticSearch.mockRejectedValue(new Error("fail"));
      const res = await request(app)
        .post("/search/")
        .send({ query: "test" });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Internal server error");
    });
  });
});
