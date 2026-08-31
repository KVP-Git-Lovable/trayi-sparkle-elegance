/**
 * Server-side Chat API Endpoint
 *
 * Handles AI chat requests securely:
 * - Manages Together AI API key (server-side only)
 * - Retrieves trusted catalog context
 * - Implements rate limiting and validation
 * - Returns safe, sanitized responses
 */

import { createFileRoute } from '@tanstack/react-router';
import { buildTrustedContext } from '@/lib/chat-context';
import { cleanText } from '@/lib/text-clean';

const json = (data: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });


// Lovable AI Gateway (server-side only)
const AI_GATEWAY_URL = 'https://ai.gateway.lovable.dev/v1/responses';
const AI_MODEL = 'openai/gpt-5.6-sol';

// Configuration
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_TOKENS = 2000;
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const AI_GATEWAY_MAX_ATTEMPTS = 3;

// Simple in-memory rate limiting (replace with Redis in production)
const rateLimitMap = new Map<string, number[]>();

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  context?: { searchTerm?: string };
}

// Rate limiting check
function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const times = rateLimitMap.get(clientId) || [];

  // Remove old requests outside the window
  const recentRequests = times.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (recentRequests.length >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  recentRequests.push(now);
  rateLimitMap.set(clientId, recentRequests);
  return true;
}

// System prompt with grounding instructions
function buildSystemPrompt(context: Awaited<ReturnType<typeof buildTrustedContext>>): string {
  const contextStr = JSON.stringify(context, null, 2);

  // Build attribute summaries for the prompt
  const attributesSummary = context.globalAttributes
    ? `
CATALOG ATTRIBUTES (Actual Product Data):
- Available Metal Colors: ${context.globalAttributes.colors?.join(', ') || 'Not available'}
- Available Purities: ${context.globalAttributes.purities?.join(', ') || 'Not available'}
- Available Sizes: ${context.globalAttributes.sizes?.join(', ') || 'Not available'}
- Available Carat Ranges: ${context.globalAttributes.caratRanges?.join(', ') || 'Not available'}
`
    : '';

  const collectionsSummary = context.collections
    ? `
COLLECTIONS:
${context.collections
  .map(
    c =>
      `- ${c.name} (${c.productCount} products): ${c.examples.slice(0, 2).join(', ')}${c.examples.length > 2 ? ', and more' : ''}`
  )
  .join('\n')}
`
    : '';

  return `You are a helpful AI assistant for Trayi Jewellery, an exclusive Limelight Diamonds boutique in Mangalore.

CRITICAL RULES:
- ONLY state facts that appear in the trusted context below
- NEVER invent or guess about: prices, discounts, availability, delivery dates, diamond specs, metal types, certifications, return policies, warranty claims
- If information is unavailable, explicitly say: "I don't have that information. Please visit our website or contact us at support@trayi.com"
- Be warm, helpful, and knowledgeable about what IS in the catalog
- Keep responses concise, clear, and respectful
- When answering about product counts or collections, be polite and welcoming

ANSWER PATTERNS:
1. For "How many color variations?" → List the actual unique colors available
2. For "What metals available?" → List unique metals from metalOptions
3. For "What purity options?" → List unique purities (9KT, 14KT, 18KT)
4. For "What size options?" → List unique sizes across products
5. For product-specific questions → Provide details from the product data
6. For collection questions → Describe the collection with product counts
7. For other questions → Use facts from the trusted context${attributesSummary}${collectionsSummary}
TRUSTED CONTEXT:
${contextStr}

END CONTEXT

Answer only using the verified context above. When discussing our collection, speak warmly about the beautiful pieces we offer. Direct customers to contact support for information outside this context.`;
}

// Validate and bound conversation history
function boundHistory(messages: ChatMessage[]): ChatMessage[] {
  // Keep only last N messages
  const bounded = messages.slice(Math.max(0, messages.length - MAX_HISTORY_MESSAGES));

  // Rough token count (approx 1 token = 4 chars)
  let tokenCount = 0;
  const result: ChatMessage[] = [];

  // Always include at least the latest message
  for (let i = bounded.length - 1; i >= 0; i--) {
    const msg = bounded[i];
    const tokens = Math.ceil(msg.content.length / 4);

    if (result.length === 0 || tokenCount + tokens <= MAX_HISTORY_TOKENS) {
      result.unshift(msg);
      tokenCount += tokens;
    }
  }

  return result;
}

type ResponsesOutput = {
  output_text?: string;
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
};

class AiGatewayError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'AiGatewayError';
  }
}

function gatewayErrorMessage(detail: string, status: number): string {
  try {
    const parsed = JSON.parse(detail) as { error?: { message?: unknown }; message?: unknown };
    const message = parsed.error?.message ?? parsed.message;
    if (typeof message === 'string' && message.trim()) return message.trim();
  } catch {
    // Use the response text or status fallback below.
  }

  return detail.trim() || `AI service returned HTTP ${status}`;
}

function retryDelayMs(attempt: number, retryAfterSeconds?: number): number {
  if (retryAfterSeconds !== undefined && Number.isFinite(retryAfterSeconds)) {
    return Math.max(0, retryAfterSeconds * 1000);
  }
  return 500 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
}

// Call Lovable AI Gateway (Responses API)
async function callAiGateway(
  apiKey: string,
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const payload = {
    model: AI_MODEL,
    instructions: systemPrompt,
    input: messages.map((m) => ({
      role: m.role,
      content: [
        { type: m.role === 'user' ? 'input_text' : 'output_text', text: m.content },
      ],
    })),
  };

  for (let attempt = 1; attempt <= AI_GATEWAY_MAX_ATTEMPTS; attempt += 1) {
    const response = await fetch(AI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Lovable-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`AI gateway error ${response.status}: ${detail}`);
      const retryAfterHeader = response.headers.get('retry-after');
      const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : undefined;
      const isRetryable = response.status === 429 || response.status >= 500;

      if (isRetryable && attempt < AI_GATEWAY_MAX_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelayMs(attempt, retryAfterSeconds)),
        );
        continue;
      }

      throw new AiGatewayError(
        gatewayErrorMessage(detail, response.status),
        response.status,
        retryAfterSeconds,
      );
    }

    const data = (await response.json()) as ResponsesOutput;
    const text =
      data.output_text ||
      (data.output ?? [])
        .flatMap((item) => item.content ?? [])
        .filter((c) => c.type === 'output_text' || typeof c.text === 'string')
        .map((c) => c.text ?? '')
        .join('')
        .trim();

    if (!text) {
      throw new Error('Empty response from AI');
    }

    return cleanText(text).trim();
  }

  throw new AiGatewayError('AI service temporarily unavailable', 503);
}

// Main handler
async function handleChat({ request }: { request: Request }): Promise<Response> {

  try {
    // Check prerequisites (read env inside the handler)
    const apiKey = process.env['LOVABLE_API_KEY'];
    if (!apiKey) {
      console.error('LOVABLE_API_KEY not configured');
      return json(
        { error: 'Service not configured' },
        { status: 503 }
      );
    }

    // Parse request
    const body = (await request.json()) as ChatRequest;

    if (!Array.isArray(body.messages)) {
      return json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    // Rate limiting (use client IP or session ID)
    const clientId = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-client-ip') ||
                     'unknown';

    if (!checkRateLimit(clientId)) {
      return json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Validate messages
    const validatedMessages: ChatMessage[] = [];
    for (const msg of body.messages) {
      if (typeof msg.content !== 'string' || msg.content.length === 0) {
        continue;
      }

      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return json(
          { error: 'Message too long. Maximum 500 characters.' },
          { status: 400 }
        );
      }

      validatedMessages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content.trim(),
      });
    }

    if (validatedMessages.length === 0) {
      return json(
        { error: 'No valid messages' },
        { status: 400 }
      );
    }

    // Bound conversation history
    const boundedMessages = boundHistory(validatedMessages);

    // Extract search term from user's latest message for better context
    const lastUserMessage = validatedMessages
      .slice()
      .reverse()
      .find(msg => msg.role === 'user')?.content || '';

    // Use explicit search term or extract from message
    const searchTerm = body.context?.searchTerm || lastUserMessage;

    // Build trusted context with search term from user's question
    const context = await buildTrustedContext(searchTerm);
    const systemPrompt = buildSystemPrompt(context);

    // Call Lovable AI
    const response = await callAiGateway(apiKey, boundedMessages, systemPrompt);

    return json({
      message: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    console.error('Chat API error:', message);

    if (error instanceof AiGatewayError) {
      return json(
        { error: message },
        {
          status: error.status,
          headers:
            error.retryAfterSeconds !== undefined
              ? { 'Retry-After': String(error.retryAfterSeconds) }
              : undefined,
        },
      );
    }

    // Return generic error message (never expose internals)
    return json(
      {
        error: 'I encountered an issue processing your request. Please try again.',
        _debug: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}

export const Route = createFileRoute('/api/chat')({
  server: {
    handlers: {
      POST: handleChat,
    },
  },
});

