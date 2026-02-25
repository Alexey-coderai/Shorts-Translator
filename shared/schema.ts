import { pgTable, text, serial, timestamp, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const videoJobs = pgTable("video_jobs", {
  id: serial("id").primaryKey(),
  youtubeUrl: text("youtube_url").notNull(),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // pending, processing, completed, failed
  transcript: text("transcript"), // Original Chinese transcript
  translation: text("translation"), // Russian translation
  translationEn: text("translation_en"), // English translation
  alignment: jsonb("alignment"), // Word-level mapping: Array<{ zh: string, ru: string, pinyin: string, en: string }>
  error: text("error"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVideoJobSchema = createInsertSchema(videoJobs).pick({
  youtubeUrl: true,
}).extend({
  youtubeUrl: z.string().url("Must be a valid URL").regex(/youtube\.com|youtu\.be/, "Must be a YouTube URL"),
});

export type VideoJob = typeof videoJobs.$inferSelect;
export type InsertVideoJob = z.infer<typeof insertVideoJobSchema>;
