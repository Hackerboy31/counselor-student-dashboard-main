import type { Message } from "@csac/shared";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { formatReceived } from "@/lib/format";
import { MessageCounter } from "./MessageCounter";

export function MessagesPanel({ messages, asOf }: { messages: Message[]; asOf: Date }) {
  const unread = messages.reduce((count, message) => count + (message.read ? 0 : 1), 0);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <span className="section-label">Messages</span>
        <MessageCounter unread={unread} total={messages.length} />
      </CardHeader>
      <CardContent>
        {messages.length === 0 ? (
          <p className="text-sm text-muted">No messages.</p>
        ) : (
          <ul className="flex flex-col">
            {messages.map((message) => (
              <li key={message.id} className="flex items-start gap-2.5 py-2 first:pt-0 last:pb-0">
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    message.read ? "bg-border" : "bg-accent",
                  )}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "truncate text-sm",
                        message.read ? "text-muted" : "font-medium text-ink",
                      )}
                    >
                      {message.subject}
                    </p>
                    <span className="shrink-0 text-2xs text-subtle">
                      {formatReceived(message.receivedAt, asOf)}
                    </span>
                  </div>
                  <p className="truncate text-xs text-subtle">{message.from}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
