import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  checkOllamaStatus,
  listModels,
  pullModel,
  deleteModel,
  type OllamaModel,
} from '@/lib/ollama';

/**
 * React Query hooks for Ollama API
 *
 * These hooks manage server state with automatic:
 * - Caching
 * - Background refetching
 * - Deduplication
 * - Stale-while-revalidate
 */

// Query Keys
export const ollamaKeys = {
  all: ['ollama'] as const,
  status: () => [...ollamaKeys.all, 'status'] as const,
  models: () => [...ollamaKeys.all, 'models'] as const,
};

/**
 * Check if Ollama server is running
 */
export function useOllamaStatus() {
  return useQuery({
    queryKey: ollamaKeys.status(),
    queryFn: checkOllamaStatus,
    staleTime: 30 * 1000, // Consider fresh for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 60 seconds in background
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

/**
 * List all available Ollama models
 */
export function useOllamaModels() {
  return useQuery({
    queryKey: ollamaKeys.models(),
    queryFn: listModels,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });
}

/**
 * Pull a model from Ollama registry
 */
export function usePullModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      modelName,
      onProgress,
    }: {
      modelName: string;
      onProgress?: (progress: { status: string; completed?: number; total?: number }) => void;
    }) => {
      await pullModel(modelName, onProgress);
    },
    onSuccess: () => {
      // Invalidate models list to refetch with new model
      queryClient.invalidateQueries({ queryKey: ollamaKeys.models() });
    },
  });
}

/**
 * Delete a model
 */
export function useDeleteModel() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteModel,
    onSuccess: (_, deletedModelName) => {
      // Optimistically update the models list
      queryClient.setQueryData<OllamaModel[]>(ollamaKeys.models(), (old) =>
        old ? old.filter((m) => m.name !== deletedModelName) : []
      );
      // Then invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ollamaKeys.models() });
    },
  });
}
