import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useGetThreadMessages, useSendUserMessage } from "../hooks/useQueries";

const CHAT_USER_NAME_KEY = "itmp_chat_user_name";
const CHAT_THREAD_ID_KEY = "itmp_chat_thread_id";

function generateThreadId(name: string): string {
  const sanitized = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  const random = Math.random().toString(36).slice(2, 8);
  return `user-${sanitized}-${random}`;
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function UserChatPanel() {
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem(CHAT_USER_NAME_KEY) || "";
  });
  const [threadId, setThreadId] = useState<string>(() => {
    return localStorage.getItem(CHAT_THREAD_ID_KEY) || "";
  });
  const [nameInput, setNameInput] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [nameError, setNameError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useGetThreadMessages(threadId);
  const sendMessage = useSendUserMessage();

  // Auto-scroll to bottom when new messages arrive
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages triggers scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSetName = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setNameError("Please enter your name to start chatting.");
      return;
    }
    if (trimmed.length < 2) {
      setNameError("Name must be at least 2 characters.");
      return;
    }
    const newThreadId = generateThreadId(trimmed);
    localStorage.setItem(CHAT_USER_NAME_KEY, trimmed);
    localStorage.setItem(CHAT_THREAD_ID_KEY, newThreadId);
    setUserName(trimmed);
    setThreadId(newThreadId);
    setNameError("");
  };

  const handleSendMessage = async () => {
    const trimmed = messageInput.trim();
    if (!trimmed || !threadId || !userName) return;

    setMessageInput("");
    await sendMessage.mutateAsync({
      threadId,
      userName,
      text: trimmed,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Name setup screen
  if (!userName || !threadId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Chat with Admin</h2>
            <p className="text-muted-foreground text-sm">
              Enter your name to start a conversation with our admin team. We'll
              get back to you as soon as possible.
            </p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="chat-name-input" className="text-sm font-medium">
                Your Name
              </label>
              <Input
                id="chat-name-input"
                placeholder="Enter your name..."
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  setNameError("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSetName();
                }}
                className="w-full"
              />
              {nameError && (
                <p className="text-destructive text-xs">{nameError}</p>
              )}
            </div>
            <Button
              onClick={handleSetName}
              className="w-full"
              disabled={!nameInput.trim()}
            >
              Start Chatting
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasAdminReply = messages.some((m) => m.isAdminReply);

  return (
    <div className="flex flex-col h-[600px] rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">ITMP Support</p>
          <p className="text-xs text-muted-foreground">Admin Team</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-muted-foreground">Online</span>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-3 py-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-sm">Start the conversation</p>
              <p className="text-xs text-muted-foreground mt-1">
                Send a message and our admin team will reply shortly.
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isUser = !message.isAdminReply;
              return (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {isUser ? userName.charAt(0).toUpperCase() : "A"}
                  </div>

                  {/* Bubble */}
                  <div
                    className={`max-w-[75%] space-y-1 ${isUser ? "items-end" : "items-start"} flex flex-col`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {message.text}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Placeholder if no admin reply yet */}
            {!hasAdminReply && messages.length > 0 && (
              <div className="flex items-center gap-2 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground px-2 whitespace-nowrap">
                  Waiting for admin reply...
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-3 bg-background">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium">{userName}</span>
          </div>
          <Input
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-9 text-sm"
            disabled={sendMessage.isPending}
          />
          <Button
            size="icon"
            className="h-9 w-9 flex-shrink-0"
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || sendMessage.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
