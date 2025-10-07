import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import { itemSchema, itemUpdateSchema } from "@/lib/validation";
import type { ItemWithProgress } from "@/types/models";
import { z } from "zod";

type SubjectItemsResponse = {
  item: ItemWithProgress;
};

type DeleteResponse = { success: boolean };

type NewItemInput = z.infer<typeof itemSchema>;
type UpdateItemInput = z.infer<typeof itemUpdateSchema>;

export function useAddItem(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<SubjectItemsResponse, Error, NewItemInput>({
    mutationFn: async (payload) => {
      const parsed = itemSchema.safeParse(payload);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid item");
      }
      return apiFetch(`/api/subjects/${slug}/items`, {
        method: "POST",
        json: parsed.data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject", slug] });
    },
  });
}

export function useUpdateItem(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<SubjectItemsResponse, Error, UpdateItemInput>({
    mutationFn: async (payload) => {
      const parsed = itemUpdateSchema.safeParse(payload);
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? "Invalid update");
      }
      return apiFetch(`/api/subjects/${slug}/items/${payload.id}`, {
        method: "PATCH",
        json: parsed.data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject", slug] });
    },
  });
}

export function useDeleteItem(slug: string) {
  const queryClient = useQueryClient();
  return useMutation<DeleteResponse, Error, string>({
    mutationFn: (itemId) =>
      apiFetch(`/api/subjects/${slug}/items/${itemId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subject", slug] });
    },
  });
}
