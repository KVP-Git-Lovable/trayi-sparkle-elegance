# Plan: AI Chat Assistant Widget for trayi-sparkle-elegance

## Context
Add a persistent AI chat assistant to the trayi-sparkle-elegance website that:
- Appears as a fixed icon in the bottom-right corner on all pages
- Works for both logged-in and logged-out users
- Uses Together.AI API for conversation
- Helps users answer questions about the website and products
- Doesn't interfere with any existing business logic or features

This feature improves user experience by providing instant help without requiring login.

## Requirements
✅ **Persistent UI**: Bottom-right chat icon visible on ALL pages  
✅ **Auth-Agnostic**: Works whether user is logged in or not  
✅ **Chat Interface**: Expandable chat box with welcome message  
✅ **Disclaimer**: Small gray text warning about AI response accuracy  
✅ **API Integration**: Use Together.AI (API key: tgp_v1_bZPrgdYW7ZkNQ-LRBc0Lr9K0BYBv3B7uJxgIIbIU6R0)  
✅ **Zero Business Logic Changes**: Isolated implementation only  

## Implementation Architecture

### Critical Security Requirements (MUST IMPLEMENT)

⚠️ **1. Server-Side API Key Only**
- ❌ DO NOT use `VITE_TOGETHER_AI_KEY` (client-side exposure)
- ✅ DO store Together AI API key as server-side secret only
- ✅ Browser NEVER receives API credential
- Architecture: Browser → `/api/chat` endpoint → Server → Together AI

⚠️ **2. Grounded in Trusted Catalog Data**
- ❌ DO NOT rely on generic system prompt alone
- ✅ DO retrieve actual product data from catalog before calling Together AI
- ✅ Search catalog for relevant products (don't send all 750 on every request)
- ✅ Include verified website info: policies, shipping, payment, collections
- ✅ Strict instruction: Never invent prices, availability, specs, certifications
- For missing info: Clearly state unavailability, direct to contact channel

⚠️ **3. Server-Side Protection & Validation**
- Rate limiting per IP/session
- Maximum message length validation
- Bounded conversation history (not unlimited)
- Maximum output tokens
- Request timeouts
- Input/output validation and sanitization
- Safe error handling (no API keys, stack traces, or internal details to browser)
- Concurrent request protection

### Overview
1. Create `ChatProvider` context (pattern: similar to `CartProvider`, `AuthProvider`)
2. Create `ChatWidget` component (persistent floating button + modal chat)
3. Create **Server-side `/api/chat` endpoint** for Together.AI integration (NEW - CRITICAL)
4. Create server-side catalog/context retrieval utility (NEW - CRITICAL)
5. Mount in root layout in `RootComponent`

### Key Files to Create

#### 1. Server-Side Chat Endpoint (CRITICAL)
**File**: `src/routes/api/chat.ts` (or backend equivalent)

Purpose: Handle chat requests securely with Together AI, grounded in catalog data

Implementation:
```typescript
// POST /api/chat
interface ChatRequest {
  messages: Array<{role: "user" | "assistant", content: string}>;
  context?: {searchTerm?: string, productId?: string};
}

export async function POST(request: Request) {
  // 1. Validate & rate limit (per IP/session)
  // 2. Enforce max message length, max history size
  // 3. If user asks about product, search catalog for relevant data
  // 4. Build trusted context from catalog/website info
  // 5. Call Together AI with system prompt + context + conversation
  // 6. Validate response, sanitize output
  // 7. Return safe response to browser (no API keys/errors)
}
```

**Responsibilities**:
- Rate limiting by IP/session ID
- Message length validation
- Conversation history bounds (last N messages, not unlimited)
- Catalog context retrieval (product search, policy retrieval)
- Together AI API call (server-side only - key never leaves server)
- Response validation & sanitization
- Error handling (safe user-facing messages)

#### 2. Server-Side Catalog Context Retrieval (CRITICAL)
**File**: `src/lib/chat-context.ts` (server utility)

Purpose: Retrieve grounded facts from catalog and website

Provides:
```typescript
interface TrustedContext {
  productFacts?: {
    name: string;
    description: string;
    price: number;
    metal: string;
    purity: string;
    attributes: Record<string, string>;
    url: string;
  }[];
  collectionInfo?: string[];
  shippingInfo?: string;
  returnPolicy?: string;
  paymentInfo?: string;
}

export async function buildTrustedContext(
  searchTerm?: string,
  productId?: string
): Promise<TrustedContext>
```

**System Instruction with Context**:
```
You are a helpful AI assistant for Trayi Jewellery, an exclusive Limelight Diamonds boutique.

IMPORTANT: You have access to verified product catalog and website information below.
ONLY state facts that appear in this context. NEVER invent:
- Prices, discounts, promotions
- Product availability or stock
- Delivery dates or timelines
- Diamond grades, certifications, specifications
- Metal types or purities (unless stated)
- Return/refund terms (unless stated)
- Warranty or guarantee claims

If information is unavailable in the catalog, explicitly say so and direct the user to contact support or visit the website.

Verified Context:
[Catalog data inserted here]
[Policies inserted here]

User Question: [user message]

Answer only using the verified context above.
```

#### 3. Chat Context & State Management
**File**: `src/lib/chat.tsx`

Purpose: Manage global chat state (messages, loading, open/closed)

Structure:
```typescript
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  openChat: () => void;
  closeChat: () => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => void;
}

// ChatProvider component
// useChatContext() hook
```

#### 4. Client-Side Chat API Wrapper
**File**: `src/lib/chat-api.ts`

Purpose: Communicate with server-side `/api/chat` endpoint (no Together AI key exposed)

Implementation:
```typescript
interface ChatRequest {
  messages: Array<{role: "user" | "assistant", content: string}>;
  context?: {searchTerm?: string};
}

interface ChatResponse {
  message: string;
  error?: string;
}

export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  // 1. Validate message length client-side
  // 2. POST to /api/chat (server handles Together AI)
  // 3. Handle response or errors
  // 4. Return response text
  // Note: Together.AI key NEVER visible to browser
}
```

**Key Difference**: This wrapper sends to YOUR server endpoint, not directly to Together AI. Server handles all API credentials and catalog retrieval.

#### 3. Chat Widget Component
**File**: `src/components/chat-widget.tsx`

Purpose: Floating chat button and expandable chat interface

Features:
- **Floating Icon** (bottom-right):
  - Fixed position: `fixed bottom-4 right-4 z-50`
  - Click to open chat
  - Shows unread indicator if messages pending

- **Chat Modal** (when expanded):
  - Radix Dialog or custom overlay (z-50)
  - Welcome message: "Welcome to Trayi's AI Assistant! How may I help you today?"
  - Message history display
  - Message input box
  - Disclaimer text below input: "This conversation includes AI assistant and all responses may not be accurate" (small, gray)
  - Close button (X)
  - Loading indicator while waiting for response

- **Styling**:
  - Use project's Tailwind theme variables
  - Consistent with existing UI (header, footer, toaster)
  - Responsive: properly sized on mobile/desktop
  - Match color scheme from `/src/styles.css`

#### 4. Root Layout Integration
**File**: `src/routes/__root.tsx` (MODIFY)

Changes:
1. Import `ChatProvider` and `ChatWidget`
2. Wrap `<Outlet />` with `<ChatProvider>`
3. Add `<ChatWidget />` after `<Toaster />`

Before:
```typescript
<PriceVisibilityProvider>
  <FilterVisibilityProvider>
    <Outlet />
    <Toaster position="bottom-right" theme="light" />
  </FilterVisibilityProvider>
</PriceVisibilityProvider>
```

After:
```typescript
<PriceVisibilityProvider>
  <FilterVisibilityProvider>
    <ChatProvider>
      <Outlet />
      <Toaster position="bottom-right" theme="light" />
      <ChatWidget />
    </ChatProvider>
  </FilterVisibilityProvider>
</PriceVisibilityProvider>
```

### Environment Configuration

⚠️ **CRITICAL: API Key Server-Side Only**

**File**: `.env.local` (Server environment - NOT visible to browser)

Add:
```
# Server-side only - NEVER expose to browser
TOGETHER_AI_KEY=<new-api-key-from-together-ai>
TOGETHER_AI_ENDPOINT=https://api.together.xyz/inference
TOGETHER_AI_MODEL=meta-llama/Meta-Llama-3-8B-Instruct-Turbo
```

**⚠️ IMPORTANT**: 
- The API key `tgp_v1_bZPrgdYW7ZkNQ-LRBc0Lr9K0BYBv3B7uJxgIIbIU6R0` should be **revoked/rotated** as it was mentioned in plaintext
- Get a new API key from Together AI
- Store only in server environment (`.env.local` for local dev, server secrets in production)
- NEVER use `VITE_` prefix (that exposes to browser)
- NEVER reference in client-side code

## Technical Details

### Chat Message Flow
1. User clicks chat icon → `openChat()` sets `isOpen = true`
2. Chat widget displays with welcome message
3. User types message → submits
4. `sendMessage()` is called:
   - Add message to history (UI update)
   - Set `isLoading = true`
   - Call `getChatResponse(messages)` via Together.AI API
   - Add response to history
   - Set `isLoading = false`
5. Display continues showing messages

### API Response Format
Together.AI expects request like:
```json
{
  "model": "meta-llama/Meta-Llama-3-8B-Instruct-Turbo",
  "messages": [
    {"role": "system", "content": "..."},
    {"role": "user", "content": "What's your return policy?"},
    {"role": "assistant", "content": "..."}
  ],
  "max_tokens": 512,
  "temperature": 0.7
}
```

Response format:
```json
{
  "output": {
    "choices": [
      {"text": "...response text..."}
    ]
  }
}
```

### Auth-Agnostic Design
- Chat works without `useAuth()`
- Optional: could include `user.id` from auth in API request for analytics
- If user logs in mid-chat, conversation continues
- No login required to use chat

### Storage & Persistence
**Option 1**: In-memory (session only) - messages lost on refresh
**Option 2**: localStorage - persist messages locally
**Recommendation**: In-memory for now (simpler, less data), can upgrade later

## Styling Guidelines

### Color Scheme (from `/src/styles.css`)
- Background: Use CSS variable `--background` (off-white)
- Text: `--foreground` (dark)
- Accent: `--accent` (coral/orange)
- Border: `--border` (light gray)

### Chat Widget Styling
```css
/* Floating button */
.chat-icon-button {
  @apply fixed bottom-4 right-4 z-50 rounded-full shadow-lg hover:shadow-xl transition-shadow;
  /* Size: 56x56px (14 lucide icon in center) */
}

/* Chat modal */
.chat-modal {
  @apply fixed bottom-20 right-4 z-50 rounded-lg shadow-lg bg-background border border-border w-96 max-h-96;
  /* Responsive: 80vw on mobile */
}

/* Messages */
.message-user {
  @apply bg-accent text-accent-foreground rounded-lg px-4 py-2;
}

.message-assistant {
  @apply bg-secondary text-foreground rounded-lg px-4 py-2;
}

/* Disclaimer */
.disclaimer {
  @apply text-[10px] text-muted-foreground italic mt-2;
}
```

## Files Summary

| File | Type | Purpose |
|------|------|---------|
| **Server-Side (CRITICAL)** | | |
| `src/routes/api/chat.ts` | **NEW** | Secure chat endpoint, Together.AI call, rate limiting |
| `src/lib/chat-context.ts` | **NEW** | Catalog context retrieval, fact grounding |
| **Client-Side** | | |
| `src/lib/chat.tsx` | **NEW** | Chat context, state, provider |
| `src/lib/chat-api.ts` | **NEW** | API wrapper (calls `/api/chat` server endpoint) |
| `src/components/chat-widget.tsx` | **NEW** | Chat UI (button + modal) |
| **Config & Layout** | | |
| `src/routes/__root.tsx` | **MODIFY** | Add ChatProvider + ChatWidget |
| `.env.local` | **UPDATE** | Add server-side secrets (NOT client-side) |

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `chat.tsx` with ChatProvider context
- [ ] Create `chat-api.ts` with Together.AI integration
- [ ] Add environment variable for API key

### Phase 2: UI Component
- [ ] Create `chat-widget.tsx` with floating button
- [ ] Implement chat modal with messages display
- [ ] Add welcome message and disclaimer
- [ ] Style with Tailwind to match theme

### Phase 3: Integration
- [ ] Update `__root.tsx` with ChatProvider wrapper
- [ ] Mount ChatWidget in RootComponent
- [ ] Test persistence across pages

### Phase 4: Testing
- [ ] Test on desktop & mobile
- [ ] Test with logged-in user
- [ ] Test with logged-out user
- [ ] Test Together.AI API responses
- [ ] Test error handling
- [ ] Verify no interference with existing features

## Server-Side Protection Implementation

### Rate Limiting & Validation
```typescript
// In /api/chat endpoint
- Identify client: IP address or session ID
- Rate limit: Max N requests per minute per IP
- Message length: Max 500 chars per message
- History size: Keep last 10 messages only (bounded context)
- Conversation size: Max 2000 tokens total in history
- Request timeout: 30-second max for Together AI response
```

### Safe Error Handling
```typescript
// Errors returned to browser should be generic
Safe responses:
- "I'm having trouble processing your request. Please try again."
- "That question is outside my knowledge. Please contact support."

NEVER expose to browser:
- API key values
- Stack traces
- Database errors
- Together AI provider details
- Internal server structure
```

### Catalog Context Bounds
```typescript
// Don't send entire 750-product catalog on every request
// For product searches:
if (searchTerm) {
  relevantProducts = searchCatalog(searchTerm); // Max 3-5 results
} else {
  // Generic context only (policies, shipping, collections)
}

// System prompt includes only retrieved context, not full catalog
```

### Validation Checklist Before Launch
- [ ] No `VITE_TOGETHER_AI_KEY` in codebase
- [ ] Together.AI key stored server-side only (`.env.local`, not `.env`)
- [ ] Browser network requests don't include API key
- [ ] `/api/chat` endpoint implements rate limiting
- [ ] Input validation: message length, history size bounds
- [ ] Response sanitization: no API keys or stack traces to browser
- [ ] Catalog context retrieval working: products/policies/shipping
- [ ] System prompt includes strict "don't invent" instructions
- [ ] Error messages are generic (no internal details)
- [ ] Tests verify secure error handling

## Testing & Verification

### Functional Testing
1. **Visibility**: Chat icon visible on all pages (collections, product, checkout, etc.)
2. **Opening**: Click icon opens chat modal
3. **Welcome**: Modal shows welcome message
4. **Input**: Can type message in input box
5. **Send**: Submit sends message and shows response
6. **Loading**: Loading state shows while waiting for response
7. **History**: Multiple messages displayed in conversation
8. **Disclaimer**: Gray disclaimer text visible below input
9. **Closing**: X button closes modal
10. **Persistence**: Icon remains visible when modal closed

### Auth Testing
- [ ] Chat works for logged-out users
- [ ] Chat works for logged-in users
- [ ] User can stay in chat while logging in (if applicable)

### API Testing
- [ ] Together.AI API key is correctly configured
- [ ] API responses are received and displayed
- [ ] Error responses handled gracefully
- [ ] Rate limiting/quota handled

### UI/UX Testing
- [ ] Chat modal doesn't overlap important content
- [ ] Mobile responsive design
- [ ] Chat doesn't interfere with other floating elements (e.g., toaster)
- [ ] Styling matches website theme
- [ ] Accessibility: keyboard navigation, screen reader support

### Regression Testing
- [ ] Existing features work: cart, wishlist, search, filters
- [ ] No performance degradation
- [ ] No JavaScript errors in console
- [ ] Header/footer/toaster still work correctly

## Notes

### Key Design Decisions
1. **Context Pattern**: Using ChatProvider (not global store) because chat state is UI-level
2. **In-Memory Messages**: Simpler for MVP, can upgrade to persistence later
3. **No Login Required**: Accessible to all users
4. **Isolated Implementation**: Completely separate from existing features

### Future Enhancements (Phase 2)
- Store conversation history in Supabase
- User-specific chat history for logged-in users
- Typing indicator ("Assistant is typing...")
- Message reactions/ratings
- Conversation analytics
- Multiple AI models selection

### Security Considerations
- ⚠️ **API key in server environment variables only** (never client-side, never hardcoded)
- No sensitive data in prompts (no password hints, etc.)
- Rate limiting on API calls (mandatory server-side)
- Content filtering for inappropriate requests
- No internal errors or stack traces to browser
- Bounded conversation history (not unlimited)
- Input validation on message length and frequency

## Acceptance Criteria (MUST PASS BEFORE LAUNCH)

### 1. Security: API Credential Protection ✓
- [ ] No `VITE_TOGETHER_AI_KEY` exists in codebase
- [ ] Together.AI API key stored only in server-side secrets (`.env.local`, production secrets manager)
- [ ] Browser code NEVER references the API key
- [ ] Network inspection shows no API key in requests from browser
- [ ] `/api/chat` endpoint handles all Together.AI communication server-side
- [ ] Old API key `tgp_v1_bZPrgdYW7ZkNQ-LRBc0Lr9K0BYBv3B7uJxgIIbIU6R0` is revoked/rotated

### 2. Grounding: Trusted Catalog Facts ✓
- [ ] Assistant answers product questions using actual catalog data (not invented)
- [ ] Catalog context retrieval implemented: `src/lib/chat-context.ts`
- [ ] System prompt includes strict "don't invent" instructions
- [ ] For missing info, assistant explicitly says "I don't have that information" and directs to contact/website
- [ ] Assistant never invents: prices, discounts, availability, specs, certifications, return terms, delivery dates, warranty
- [ ] Test cases verify fact-grounding (positive: catalog fact returns correctly, negative: missing fact returns "unavailable")

### 3. Protection: Server-Side Defense ✓
- [ ] `/api/chat` endpoint has rate limiting per IP/session
- [ ] Message length validation (max 500 chars)
- [ ] Conversation history bounded (max 10 messages, max 2000 tokens)
- [ ] Request timeout (max 30s)
- [ ] Concurrent request protection
- [ ] Input sanitization and output validation
- [ ] Error handling returns generic messages (no API keys, stack traces, internal details)
- [ ] Together.AI errors are caught and converted to safe user-facing messages

### Scope: No Changes to Existing
- Keep ChatProvider and ChatWidget UI unchanged
- Keep floating launcher position and behavior
- Keep in-memory conversation (no persistence yet)
- Keep anonymous and authenticated access patterns
- Keep clear-history functionality
- Don't modify other storefront features
