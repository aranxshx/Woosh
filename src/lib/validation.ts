import { z } from "zod";

export const subjectNameSchema = z
  .string()
  .min(1, "Subject name is required")
  .max(120, "Subject name is too long");

export const choiceSchema = z
  .string()
  .trim()
  .min(1, "Choices cannot be empty")
  .max(200, "Choice is too long");

export const itemSchema = z.object({
  term: z.string().min(1, "Term is required").max(200),
  definition: z.string().min(1, "Definition is required").max(1000),
  question: z.string().max(400).optional().nullable(),
  choices: z.array(choiceSchema).max(10).default([]),
  answerIndex: z.number().min(0).max(9).nullable().default(null),
});

export const itemUpdateSchema = itemSchema.extend({
  id: z.string().min(1),
});

export const progressPatchSchema = z.object({
  lastSeen: z.string().nullable().optional(),
  lastResult: z.enum(["easy", "medium", "hard"]).nullable().optional(),
  timesSeen: z.number().int().min(0).optional(),
  easyCount: z.number().int().min(0).optional(),
  mediumCount: z.number().int().min(0).optional(),
  hardCount: z.number().int().min(0).optional(),
  nextDue: z.string().nullable().optional(),
});

export const saveProgressSchema = z.object({
  itemId: z.string().min(1),
  statsPatch: progressPatchSchema,
});
