"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, Send, Minimize2 } from "lucide-react";
import { apiRequest } from "@/lib/api-config";
import { toast } from "sonner";

interface ChatPopupProps {
  user: any;
  onClose: () => void;
}

export default function ChatPopup({ user, onClose }: ChatPopupProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && session?.user) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 2000);
      return () => clearInterval(interval);
    }
  }, [user, session?.user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await apiRequest(`/api/messages?userId=${session?.user?.id}&otherUserId=${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
      
      await apiRequest(`/api/messages/read`, {
        method: "PUT",
        body: JSON.stringify({ userId: session?.user?.id, otherUserId: user._id })
      });
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!messageText.trim()) return;

    try {
      const res = await apiRequest(`/api/messages`, {
        method: "POST",
        body: JSON.stringify({
          senderId: session?.user?.id,
          receiverId: user._id,
          messageType: 'text',
          content: messageText.trim()
        })
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => [...prev, newMessage]);
        setMessageText("");
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-2xl z-50 flex flex-col" style={{ height: minimized ? 'auto' : '500px' }}>
      <div className="p-3 border-b flex items-center justify-between bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-semibold text-sm">
            {user.name[0]}
          </div>
          <span className="font-semibold text-sm">{user.name}</span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setMinimized(!minimized)}>
            <Minimize2 className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20" onClick={onClose}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {!minimized && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/30">
            {messages.map((msg, index) => {
              const showTimeBreak = index > 0 && 
                (new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime()) > 5 * 60 * 1000;
              
              return (
                <div key={msg._id}>
                  {showTimeBreak && (
                    <div className="flex items-center gap-2 my-3">
                      <div className="flex-1 h-[1px] bg-border"></div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex-1 h-[1px] bg-border"></div>
                    </div>
                  )}
                  <div className={`flex ${msg.senderId._id === session?.user?.id ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] ${msg.senderId._id === session?.user?.id ? 'bg-primary text-primary-foreground' : 'bg-white'} rounded-lg p-2 shadow-sm`}>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && messageText.trim()) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="text-sm"
            />
            <Button size="icon" onClick={sendMessage}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
