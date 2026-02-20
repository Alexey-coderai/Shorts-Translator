import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import ytdl from "@distube/ytdl-core";
import { openai } from "./replit_integrations/audio/client";
import fs from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { randomUUID } from "crypto";

async function processVideoJob(jobId: number, youtubeUrl: string) {
  let tmpFilePath = "";
  try {
    await storage.updateJob(jobId, { status: "processing" });

    // Download audio from youtube
    const info = await ytdl.getInfo(youtubeUrl);
    const format = ytdl.chooseFormat(info.formats, { quality: "highestaudio" });
    
    if (!format) {
      throw new Error("No audio format found");
    }

    const container = format.container || "mp4";
    tmpFilePath = join(tmpdir(), `${randomUUID()}.${container}`);
    const writeStream = fs.createWriteStream(tmpFilePath);
    
    await new Promise<void>((resolve, reject) => {
      ytdl.downloadFromInfo(info, { format })
        .pipe(writeStream)
        .on("finish", () => resolve())
        .on("error", reject);
    });

    const file = fs.createReadStream(tmpFilePath);
    
    const transcription = await openai.audio.transcriptions.create({
      file: file as any,
      model: "gpt-4o-mini-transcribe",
      language: "zh",
    });

    const chineseText = transcription.text;
    
    // Updated prompt for alignment
    const alignmentRes = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        { 
          role: "system", 
          content: `You are a professional translator and linguist. 
          Translate the following Chinese text into Russian. 
          Also, provide a word-level or phrase-level alignment mapping between the Chinese and Russian text.
          Return a JSON object with:
          - "translation": The full Russian translation string.
          - "alignment": An array of objects: { "zh": "Chinese word/phrase", "ru": "Corresponding Russian word/phrase" }.
          The alignment should cover the entire text sequentially.` 
        },
        { role: "user", content: chineseText }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(alignmentRes.choices[0]?.message?.content || "{}");

    await storage.updateJob(jobId, {
      status: "completed",
      transcript: chineseText,
      translation: result.translation || "",
      alignment: result.alignment || [],
    });
  } catch (error) {
    console.error("Job failed:", error);
    await storage.updateJob(jobId, {
      status: "failed",
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    if (tmpFilePath && fs.existsSync(tmpFilePath)) {
      fs.unlinkSync(tmpFilePath);
    }
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get(api.jobs.list.path, async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.get(api.jobs.get.path, async (req, res) => {
    const job = await storage.getJob(Number(req.params.id));
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  });

  app.post(api.jobs.create.path, async (req, res) => {
    try {
      const input = api.jobs.create.input.parse(req.body);
      const job = await storage.createJob(input);
      processVideoJob(job.id, job.youtubeUrl).catch(console.error);
      res.status(201).json(job);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
