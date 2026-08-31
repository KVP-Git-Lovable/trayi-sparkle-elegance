import type { Message } from "./chat";

export interface ChatRequest {
  message: string;
  conversationHistory?: Message[];
}

export interface ChatResponse {
  message: string;
  error?: string;
}

/**
 * Send a message to the AI chat API endpoint
 * This client-side wrapper handles the communication with /api/chat
 */
export async function sendChatMessage(
  request: ChatRequest
): Promise<ChatResponse> {
  try {
    // Build messages array: add new user message to history
    const messages = [
      ...(request.conversationHistory || []).map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: request.message,
      },
    ];

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;

      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch {
        // If response is not JSON, use status-based message
        if (response.status === 429) {
          errorMessage = "Rate limited. Please wait a moment and try again.";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
      }

      return {
        message: "",
        error: errorMessage,
      };
    }

    const data = await response.json();

    if (!data.message) {
      return {
        message: "",
        error: "No response from assistant",
      };
    }

    return {
      message: data.message,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      message: "",
      error: errorMessage,
    };
  }
}

/**
 * Validate that a message is appropriate for sending
 */
export function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || !message.trim()) {
    return { valid: false, error: "Message cannot be empty" };
  }

  if (message.trim().length > 5000) {
    return { valid: false, error: "Message is too long (max 5000 characters)" };
  }

  return { valid: true };
}
