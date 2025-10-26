import type { OllamaModel, ChatMessage } from '@/types';

const OLLAMA_BASE_URL = 'http://localhost:11434';

export interface OllamaGenerateOptions {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
  };
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Check if Ollama is running
 */
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * List all available models
 */
export async function listModels(): Promise<OllamaModel[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }

    const data = await response.json();
    return data.models || [];
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
}

/**
 * Pull a model from Ollama registry
 */
export async function pullModel(
  modelName: string,
  onProgress?: (progress: { status: string; completed?: number; total?: number }) => void
): Promise<void> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/pull`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: modelName }),
    });

    if (!response.ok) {
      throw new Error('Failed to pull model');
    }

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data = JSON.parse(line);
          if (onProgress) {
            onProgress({
              status: data.status || 'downloading',
              completed: data.completed,
              total: data.total,
            });
          }
        } catch {
          // Ignore JSON parse errors
        }
      }
    }
  } catch (error) {
    console.error('Error pulling model:', error);
    throw error;
  }
}

/**
 * Delete a model
 */
export async function deleteModel(modelName: string): Promise<void> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: modelName }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete model');
    }
  } catch (error) {
    console.error('Error deleting model:', error);
    throw error;
  }
}

/**
 * Generate a chat response with streaming support
 */
export async function generateChatResponse(
  options: OllamaGenerateOptions,
  onChunk?: (chunk: string) => void
): Promise<OllamaResponse> {
  const startTime = Date.now();

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model,
        messages: options.messages,
        stream: options.stream ?? true,
        options: options.options,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    if (!options.stream) {
      const data = await response.json();
      return data;
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let fullContent = '';
    let lastResponse: OllamaResponse | null = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(Boolean);

      for (const line of lines) {
        try {
          const data: OllamaResponse = JSON.parse(line);
          lastResponse = data;

          if (data.message?.content) {
            fullContent += data.message.content;
            if (onChunk) {
              onChunk(data.message.content);
            }
          }

          if (data.done) {
            const responseTime = Date.now() - startTime;
            return {
              ...data,
              message: {
                role: 'assistant',
                content: fullContent,
              },
              total_duration: responseTime,
            };
          }
        } catch (error) {
          console.error('Error parsing JSON chunk:', error);
        }
      }
    }

    // Fallback if we didn't get a done signal
    if (lastResponse) {
      return {
        ...lastResponse,
        message: {
          role: 'assistant',
          content: fullContent,
        },
        done: true,
      };
    }

    throw new Error('No response received from Ollama');
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw error;
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatModelSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
