import Dedalus, { DedalusRunner } from "dedalus-labs";
import "dotenv/config";
import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

/* ----------------------------- CONFIG ----------------------------- */

const ALLOWED_TAGS = [
  "transport",
  "food",
  "shopping",
  "home",
  "energy",
  "water",
  "waste",
  "reusable",
  "community",
  "education",
  "daily",
  "habit",
  "low-emission",
  "high-emission",
  "eco-friendly",
  "convenience",
] as const;

type AutofillResponse = {
  title: string;
  tags: string[];
  notes: string;
};

const client = new Dedalus({
  apiKey: process.env.DEDALUS_API_KEY,
});

const runner = new DedalusRunner(client);

/* ----------------------------- ROUTE ----------------------------- */

app.post("/autofill", async (req: Request, res: Response) => {
  try {
    const { text } = req.body as { text: string };

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const prompt = `
You are filling a sustainability event log form.

Return ONLY valid JSON (no markdown, no backticks) with EXACTLY these keys:
title, tags, notes

- title: short title
- tags: array of 1-5 tags chosen ONLY from: ${ALLOWED_TAGS.join(", ")}
- notes: 1-2 sentence description

User input:
"${text}"
`;

    const result = await runner.run({
      input: prompt,
      model: "anthropic/claude-opus-4-5",
    });

    // Dedalus typing fix (handles union type)
    const rawOutput =
      typeof result === "object" && "finalOutput" in result
        ? result.finalOutput
        : "";

    let raw = (rawOutput ?? "").trim();

    console.log("RAW MODEL OUTPUT:", raw);

    // Strip accidental markdown fences
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/```$/i, "").trim();

    const parsed: AutofillResponse = JSON.parse(raw);

    // Optional safety: filter tags to allowed list
    parsed.tags = parsed.tags.filter((tag) =>
      ALLOWED_TAGS.includes(tag as any)
    );

    res.json(parsed);
  } catch (err) {
    console.error("Autofill error:", err);
    res.status(500).json({ error: "AI failed" });
  }
});

/* ----------------------------- SERVER ----------------------------- */

app.listen(8080, "0.0.0.0", () => {
  console.log("Server running on http://localhost:8080");
});
