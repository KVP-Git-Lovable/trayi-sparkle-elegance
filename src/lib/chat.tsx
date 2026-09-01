import { createContext, useContext, useCallback, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { sendChatMessage } from "./chat-api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ChatContextType = {
  messages: Message[];
  isOpen: boolean;
  isLoading: boolean;
  setIsOpen: (open: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  sendPriceRequest: (productHandle: string, productName: string) => void;
  clearHistory: () => void;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) {
      toast.error("Please enter a message");
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const result = await sendChatMessage({
        message: content.trim(),
        conversationHistory: messages,
      });

      if (result.error) {
        toast.error(result.error);
        setIsLoading(false);
        return;
      }

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: "assistant",
        content: result.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to get response";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  /**
   * "Ask for Price" flow: opens the chat (or reuses the open window),
   * shows the price question and a canned acknowledgement — no AI call —
   * and records the request in the price_requests table for follow-up.
   */
  const sendPriceRequest = useCallback(
    (productHandle: string, productName: string) => {
      setIsOpen(true);

      const now = Date.now();
      const userMessage: Message = {
        id: `msg-${now}-price-request`,
        role: "user",
        content: `What is the price for ${productName} ?`,
        timestamp: new Date(),
      };
      const assistantMessage: Message = {
        id: `msg-${now}-price-request-reply`,
        role: "assistant",
        content: "Thank you for submitting the price request. We shall get back to you shortly.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage, assistantMessage]);

      // Record the request in the background; the chat reply shows regardless.
      void (async () => {
        const { error } = await supabase.from("price_requests").insert({
          product_handle: productHandle,
          product_name: productName,
          user_id: user?.id ?? null,
        });
        if (error) {
          console.error("Failed to record price request:", error);
        }
      })();
    },
    [user]
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        setIsOpen,
        sendMessage,
        sendPriceRequest,
        clearHistory,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return ctx;
}
