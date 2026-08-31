import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [hasWelcome, setHasWelcome] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Show welcome message on first open
  useEffect(() => {
    if (isOpen && !hasWelcome && messages.length === 0) {
      setHasWelcome(true);
    }
  }, [isOpen, hasWelcome, messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const displayMessages = messages.length === 0 && hasWelcome ? [] : messages;
  const showWelcome = messages.length === 0 && hasWelcome;

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open chat assistant"
        className={cn(
          "fixed bottom-6 right-6 z-40 rounded-full p-3 shadow-lg transition-all duration-200",
          "bg-accent hover:bg-accent/90 text-accent-foreground",
          "hover:shadow-xl hover:scale-110 active:scale-95",
          "flex items-center justify-center"
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className={cn(
            "flex flex-col gap-0 p-0 sm:rounded-lg",
            "h-[600px] max-h-[90vh] w-full sm:max-w-md"
          )}
        >
          {/* Header */}
          <DialogHeader className="border-b border-border/40 px-6 py-4 rounded-t-lg bg-background/50">
            <DialogTitle className="text-lg font-semibold tracking-tight">
              AI Assistant
            </DialogTitle>
          </DialogHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="space-y-4">
              {/* Welcome Message */}
              {showWelcome && (
                <div className="flex justify-start mb-6">
                  <div className="max-w-xs rounded-lg bg-muted px-4 py-3">
                    <p className="text-sm text-muted-foreground">
                      {WELCOME_MESSAGE}
                    </p>
                  </div>
                </div>
              )}

              {/* Conversation Messages */}
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 mb-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-xs rounded-lg px-4 py-3 text-sm",
                      message.role === "user"
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <p className="break-words">{message.content}</p>
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
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
          <div className="border-t border-border/40 bg-background/50 px-6 py-4">
            {/* Input Box */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask me anything..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 text-sm"
                autoFocus
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

            {/* Disclaimer */}
            <p className="mt-3 text-xs text-muted-foreground/60 leading-relaxed">
              This conversation includes AI assistant and all responses may not
              be accurate
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
