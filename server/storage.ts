import { db } from "./db";
import { videoJobs, type InsertVideoJob, type VideoJob } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getJobs(): Promise<VideoJob[]>;
  getJob(id: number): Promise<VideoJob | undefined>;
  createJob(job: InsertVideoJob): Promise<VideoJob>;
  updateJob(id: number, updates: Partial<VideoJob>): Promise<VideoJob>;
}

export class DatabaseStorage implements IStorage {
  async getJobs(): Promise<VideoJob[]> {
    return await db.select().from(videoJobs).orderBy(desc(videoJobs.createdAt));
  }

  async getJob(id: number): Promise<VideoJob | undefined> {
    const [job] = await db.select().from(videoJobs).where(eq(videoJobs.id, id));
    return job;
  }

  async createJob(insertJob: InsertVideoJob): Promise<VideoJob> {
    const [job] = await db.insert(videoJobs).values(insertJob).returning();
    return job;
  }

  async updateJob(id: number, updates: Partial<VideoJob>): Promise<VideoJob> {
    const [updated] = await db.update(videoJobs)
      .set(updates)
      .where(eq(videoJobs.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
