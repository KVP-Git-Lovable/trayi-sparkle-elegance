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


// Environment variables (server-side only)
const TOGETHER_AI_KEY = process.env.TOGETHER_AI_KEY;
const TOGETHER_API_URL = 'https://api.together.xyz/inference';
const TOGETHER_MODEL = 'meta-llama/Meta-Llama-3-8B-Instruct-Turbo';

// Configuration
const MAX_MESSAGE_LENGTH = 500;
const MAX_HISTORY_MESSAGES = 10;
const MAX_HISTORY_TOKENS = 2000;
const REQUEST_TIMEOUT_MS = 30000;
const RATE_LIMIT_REQUESTS = 10;
const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute

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

  return `You are a helpful AI assistant for Trayi Jewellery, an exclusive Limelight Diamonds boutique in Mangalore.

CRITICAL RULES:
- ONLY state facts that appear in the trusted context below
- NEVER invent or guess about: prices, discounts, availability, delivery dates, diamond specs, metal types, certifications, return policies, warranty claims
- If information is unavailable, explicitly say: "I don't have that information. Please visit our website or contact us at support@trayi.com"
- Be warm, helpful, and knowledgeable about what IS in the catalog
- Keep responses concise and clear

TRUSTED CONTEXT:
${contextStr}

END CONTEXT

Answer only using the verified context above. Direct customers to contact support for information outside this context.`;
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

// Call Together AI API
async function callTogetherAI(
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const payload = {
    model: TOGETHER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    max_tokens: 512,
    temperature: 0.7,
    top_p: 0.9,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(TOGETHER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOGETHER_AI_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      console.error(`Together AI error: ${response.status}`);
      throw new Error('AI service error');
    }

    const data = await response.json() as any;
    const text = data?.output?.choices?.[0]?.text || '';

    if (!text) {
      throw new Error('Empty response from AI');
    }

    return cleanText(text).trim();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Together AI request timeout');
      throw new Error('Request timeout');
    }
    console.error('Together AI error:', error);
    throw new Error('AI service unavailable');
  } finally {
    clearTimeout(timeout);
  }
}

// Main handler
export const POST: RequestHandler = async ({ request }) => {
  try {
    // Check prerequisites
    if (!TOGETHER_AI_KEY) {
      console.error('TOGETHER_AI_KEY not configured');
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

    // Build trusted context
    const context = await buildTrustedContext(body.context?.searchTerm);
    const systemPrompt = buildSystemPrompt(context);

    // Call Together AI
    const response = await callTogetherAI(boundedMessages, systemPrompt);

    return json({
      message: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';

    console.error('Chat API error:', message);

    // Return generic error message (never expose internals)
    return json(
      {
        error: 'I encountered an issue processing your request. Please try again.',
        _debug: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
};
