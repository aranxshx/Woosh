import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api-client";
import type { Subject, SubjectDetail } from "@/types/models";

export function useSubjects() {
  return useQuery<{ subjects: Subject[] }, Error>({
    queryKey: ["subjects"],
    queryFn: () => apiFetch<{ subjects: Subject[] }>("/api/subjects"),
  });
}

export function useSubjectDetail(slug: string | null) {
  return useQuery<{ subject: Subject; items: SubjectDetail["items"] }, Error>({
    queryKey: ["subject", slug],
    enabled: Boolean(slug),
    queryFn: () => apiFetch(`/api/subjects/${slug}`),
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation<{ slug: string }, Error, { name: string }>({
    mutationFn: ({ name }) => apiFetch("/api/subjects", { json: { name }, method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation<{ success: boolean }, Error, { slug: string }>({
    mutationFn: ({ slug }) => apiFetch(`/api/subjects/${slug}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
  });
}
