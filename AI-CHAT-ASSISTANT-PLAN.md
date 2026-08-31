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

### Overview
1. Create `ChatProvider` context (pattern: similar to `CartProvider`, `AuthProvider`)
2. Create `ChatWidget` component (persistent floating button + modal chat)
3. Create `ChatAPI` utility for Together.AI integration
4. Mount in root layout in `RootComponent`

### Key Files to Create

#### 1. Chat Context & State Management
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

#### 2. Together.AI Integration
**File**: `src/lib/chat-api.ts`

Purpose: Handle API communication with Together.AI

Implementation:
- Accept Together.AI API key as environment variable: `VITE_TOGETHER_AI_KEY`
- Fetch function to send message and get response
- Error handling and retry logic
- System prompt to keep assistant focused on website/product questions

```typescript
const TOGETHER_API_URL = "https://api.together.xyz/inference";
const SYSTEM_PROMPT = "You are a helpful AI assistant for Trayi Jewellery...";

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  // Format messages for Together.AI
  // Call API
  // Return response text
  // Handle errors with toast notification
}
```

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

**File**: `.env` (or `.env.local`)

Add:
```
VITE_TOGETHER_AI_KEY=tgp_v1_bZPrgdYW7ZkNQ-LRBc0Lr9K0BYBv3B7uJxgIIbIU6R0
```

**File**: `src/config/env.ts` (if exists, or create)

```typescript
export const TOGETHER_AI_KEY = import.meta.env.VITE_TOGETHER_AI_KEY;
```

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
| `src/lib/chat.tsx` | **NEW** | Chat context, state, provider |
| `src/lib/chat-api.ts` | **NEW** | Together.AI API integration |
| `src/components/chat-widget.tsx` | **NEW** | Chat UI (button + modal) |
| `src/routes/__root.tsx` | **MODIFY** | Add ChatProvider + ChatWidget |
| `.env` | **UPDATE** | Add Together.AI API key |

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
- API key in environment variables (never hardcoded)
- No sensitive data in prompts (no password hints, etc.)
- Rate limiting on API calls (server-side when backend available)
- Content filtering for inappropriate requests
