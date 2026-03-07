import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Inbox, MessageCircle, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type ChatThread,
  useGetChatThreads,
  useGetThreadMessages,
  useMarkThreadRead,
  useSendAdminReply,
} from "../hooks/useQueries";

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

interface ThreadDetailProps {
  thread: ChatThread;
  onBack: () => void;
}

function ThreadDetail({ thread, onBack }: ThreadDetailProps) {
  const [replyText, setReplyText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useGetThreadMessages(thread.id);
  const sendReply = useSendAdminReply();
  const markRead = useMarkThreadRead();

  // Mark thread as read when opened
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentionally run only on thread.id change
  useEffect(() => {
    if (thread.unreadCount > 0) {
      markRead.mutate(thread.id);
    }
  }, [thread.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages triggers scroll, no other deps needed
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendReply = async () => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    setReplyText("");
    await sendReply.mutateAsync({
      threadId: thread.id,
      text: trimmed,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  return (
    <div className="flex flex-col h-[600px] rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary">
            {thread.userName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{thread.userName}</p>
          <p className="text-xs text-muted-foreground">
            {messages.length} messages
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => {
            const isAdmin = message.isAdminReply;
            return (
              <div
                key={message.id}
                className={`flex items-end gap-2 ${isAdmin ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isAdmin
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {isAdmin ? "A" : thread.userName.charAt(0).toUpperCase()}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[75%] space-y-1 ${isAdmin ? "items-end" : "items-start"} flex flex-col`}
                >
                  <div
                    className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                      isAdmin
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
          })
        )}
      </div>

      {/* Reply Input */}
      <div className="border-t border-border p-3 bg-background">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
            <User className="w-3.5 h-3.5" />
            <span className="font-medium">Admin</span>
          </div>
          <Input
            placeholder="Type a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-9 text-sm"
            disabled={sendReply.isPending}
          />
          <Button
            size="icon"
            className="h-9 w-9 flex-shrink-0"
            onClick={handleSendReply}
            disabled={!replyText.trim() || sendReply.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminChatInbox() {
  const [selectedThread, setSelectedThread] = useState<ChatThread | null>(null);
  const { data: threads = [] } = useGetChatThreads();

  // Update selected thread when threads data refreshes
  // biome-ignore lint/correctness/useExhaustiveDependencies: selectedThread excluded to avoid infinite loop
  useEffect(() => {
    if (selectedThread) {
      const updated = threads.find((t) => t.id === selectedThread.id);
      if (updated) {
        setSelectedThread(updated);
      }
    }
  }, [threads]);

  const totalUnread = threads.reduce((sum, t) => sum + t.unreadCount, 0);

  if (selectedThread) {
    return (
      <ThreadDetail
        thread={selectedThread}
        onBack={() => setSelectedThread(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Inbox Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Inbox className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold">User Messages</h2>
          {totalUnread > 0 && (
            <Badge variant="default" className="text-xs px-2 py-0.5">
              {totalUnread} new
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Auto-refreshes every 5 seconds
        </p>
      </div>

      {/* Thread List */}
      {threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 rounded-xl border border-dashed border-border">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">No conversations yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              User messages will appear here when they start chatting.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {[...threads]
            .sort((a, b) => b.lastMessageTime - a.lastMessageTime)
            .map((thread) => (
              <button
                type="button"
                key={thread.id}
                onClick={() => setSelectedThread(thread)}
                className={`w-full text-left rounded-xl border p-4 transition-all hover:shadow-md hover:border-primary/30 ${
                  thread.unreadCount > 0
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-base font-bold text-primary">
                      {thread.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-sm truncate ${
                          thread.unreadCount > 0 ? "font-bold" : "font-medium"
                        }`}
                      >
                        {thread.userName}
                      </span>
                      <span className="text-[11px] text-muted-foreground flex-shrink-0">
                        {formatRelativeTime(thread.lastMessageTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      <p
                        className={`text-xs truncate ${
                          thread.unreadCount > 0
                            ? "text-foreground font-medium"
                            : "text-muted-foreground"
                        }`}
                      >
                        {thread.lastMessage}
                      </p>
                      {thread.unreadCount > 0 && (
                        <Badge
                          variant="default"
                          className="text-[10px] px-1.5 py-0 h-4 flex-shrink-0 min-w-[16px] flex items-center justify-center"
                        >
                          {thread.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
