import { useMutation } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { saveProgressSchema } from "@/lib/validation";
import { z } from "zod";

type SaveProgressInput = z.infer<typeof saveProgressSchema>;

type SaveProgressResponse = {
  success: boolean;
};

export function useSaveProgress() {
  return useMutation<SaveProgressResponse, Error, SaveProgressInput>({
    mutationFn: async (payload) => {
      const parsed = saveProgressSchema.safeParse(payload);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid progress data");
      }
      return apiFetch("/api/progress", {
        method: "POST",
        json: parsed.data,
      });
    },
  });
}
