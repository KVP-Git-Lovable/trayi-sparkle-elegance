import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/lib/chat";
import { validateMessage } from "@/lib/chat-api";
import { cn } from "@/lib/utils";

const WELCOME_MESSAGE = "Welcome to Trayi's AI Assistant! How may I help you today?";

export function ChatWidget() {
  const { messages, isOpen, isLoading, setIsOpen, sendMessage } =
    useChatContext();
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Keep the composer focused while the panel is open
  useEffect(() => {
    if (isOpen && !isLoading) {
      inputRef.current?.focus();
    }
  }, [isOpen, isLoading]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

  const handleSend = useCallback(async () => {
    const validation = validateMessage(inputValue);
    if (!validation.valid) {
      return;
    }

    const messageToSend = inputValue;
    setInputValue("");

    await sendMessage(messageToSend);
  }, [inputValue, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !isLoading) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend, isLoading]
  );

  const showWelcome = messages.length === 0;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Anchored Chat Panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="AI Assistant"
          className={cn(
            "flex w-[min(22rem,calc(100vw-3rem))] flex-col overflow-hidden rounded-xl border border-border/60",
            "bg-background shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200",
            "h-[min(30rem,70vh)]"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/40 bg-background/50 px-5 py-3">
            <h2 className="text-base font-semibold tracking-tight">AI Assistant</h2>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat assistant"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="space-y-4">
              {showWelcome && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-lg bg-muted px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      {WELCOME_MESSAGE}
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-lg px-4 py-3 text-sm",
                      message.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-lg bg-muted px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Typing...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-border/40 bg-background/50 px-5 py-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="text"
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !inputValue.trim()}
                size="sm"
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground/60">
              This conversation includes AI assistant and all responses may not
              be accurate
            </p>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat assistant" : "Open chat assistant"}
        className={cn(
          "rounded-full p-3 shadow-lg transition-all duration-200",
          "bg-accent hover:bg-accent/90 text-accent-foreground",
          "hover:shadow-xl hover:scale-110 active:scale-95",
          "flex items-center justify-center"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
