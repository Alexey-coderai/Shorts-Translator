import { z } from "zod";
import { insertVideoJobSchema, videoJobs } from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  jobs: {
    list: {
      method: "GET" as const,
      path: "/api/jobs" as const,
      responses: {
        200: z.array(z.custom<typeof videoJobs.$inferSelect>()),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/jobs/:id" as const,
      responses: {
        200: z.custom<typeof videoJobs.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/jobs" as const,
      input: insertVideoJobSchema,
      responses: {
        201: z.custom<typeof videoJobs.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type JobInput = z.infer<typeof api.jobs.create.input>;
export type JobResponse = z.infer<typeof api.jobs.create.responses[201]>;
export type JobListResponse = z.infer<typeof api.jobs.list.responses[200]>;
