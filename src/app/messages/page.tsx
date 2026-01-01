"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Image as ImageIcon, Store } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api-config";
import { toast } from "sonner";
import Link from "next/link";

function MessagesContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatUserId = searchParams.get("userId");
  
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [messageText, setMessageText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
    if (session?.user) {
      fetchConversations();
      if (chatUserId) {
        loadChat(chatUserId);
      }
    }
  }, [session, isPending, chatUserId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedUser || !session?.user) return;
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 2000);
    
    return () => clearInterval(interval);
  }, [selectedUser, session?.user]);

  const fetchMessages = async () => {
    if (!selectedUser) return;
    try {
      const res = await apiRequest(`/api/messages?otherUserId=${selectedUser._id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await apiRequest(`/api/messages/conversations`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadChat = async (userId: string) => {
    try {
      const [userRes, messagesRes] = await Promise.all([
        apiRequest(`/api/users/${userId}`),
        apiRequest(`/api/messages?otherUserId=${userId}`)
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setSelectedUser(userData);
      }

      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData);
      }
      
      await apiRequest(`/api/messages/read`, {
        method: "PUT",
        body: JSON.stringify({ otherUserId: userId })
      });
    } catch (error) {
      console.error("Failed to load chat:", error);
    }
  };

  const sendMessage = async (type: 'text' | 'image' | 'salon', content: string, extra?: any) => {
    if (!selectedUser) return;
    if (type === 'text' && !content.trim()) return;

    try {
      const res = await apiRequest(`/api/messages`, {
        method: "POST",
        body: JSON.stringify({
          receiverId: selectedUser._id,
          messageType: type,
          content: content.trim(),
          ...extra
        })
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => [...prev, newMessage]);
        setMessageText("");
        fetchConversations();
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send message");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await sendMessage('image', 'Sent an image', { imageUrl: base64 });
    };
    reader.readAsDataURL(file);
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20">
      {!selectedUser && <Navigation />}
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
        {!selectedUser && <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 luxury-gradient-text">Messages</h1>}

        {!selectedUser ? (
          <Card className="p-4 overflow-y-auto max-w-2xl mx-auto w-full shadow-xl border-2 border-purple-200/50">
            <h2 className="font-semibold mb-4 text-lg">Conversations</h2>
            {conversations.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.user._id}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-accent"
                    onClick={() => router.push(`/messages?userId=${conv.user._id}`)}
                  >
                    <Avatar>
                      <AvatarImage src={conv.user.image} />
                      <AvatarFallback>{conv.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{conv.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage.content}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : (
          <Card className="flex flex-col h-screen shadow-2xl border-2 border-purple-200/50 overflow-hidden">
            <>
                <div className="p-3 sm:p-4 border-b bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-amber-500/10 backdrop-blur-sm flex items-center gap-2 sm:gap-3">
                  <Button variant="ghost" size="icon" onClick={() => {
                    setSelectedUser(null);
                    router.push('/messages');
                  }} className="hover:bg-white/50 rounded-full h-9 w-9 flex-shrink-0">
                    <span className="text-xl">←</span>
                  </Button>
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 ring-2 ring-purple-500/30 flex-shrink-0">
                    <AvatarImage src={selectedUser.image} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">{selectedUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm sm:text-base truncate">{selectedUser.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser.isOnline ? (
                        <span className="flex items-center gap-1">
                          <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                          Online
                        </span>
                      ) : (
                        <span>
                          {(() => {
                            const lastSeen = new Date(selectedUser.lastSeen || selectedUser.updatedAt);
                            const diff = Date.now() - lastSeen.getTime();
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const days = Math.floor(hours / 24);
                            const weeks = Math.floor(days / 7);
                            if (hours < 1) return 'Active recently';
                            if (hours < 24) return `Active ${hours}h ago`;
                            if (days < 7) return `Active ${days}d ago`;
                            return `Active ${weeks}w ago`;
                          })()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gradient-to-br from-amber-50/40 via-purple-50/30 via-pink-50/30 to-blue-50/40 dark:from-gray-900/50 dark:via-purple-900/10 dark:to-pink-900/10">
                  {messages.map((msg, index) => {
                    const timeDiff = index > 0 ? new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() : 0;
                    const messageDiff = index > 0 ? index - messages.slice(0, index).reverse().findIndex((m, i) => {
                      const diff = new Date(messages[index].createdAt).getTime() - new Date(m.createdAt).getTime();
                      return diff > 12 * 60 * 60 * 1000;
                    }) : 0;
                    const showTimeBreak = index > 0 && (timeDiff > 12 * 60 * 60 * 1000 || messageDiff >= 200);
                    
                    return (
                      <div key={msg._id}>
                        {showTimeBreak && (
                          <div className="flex items-center gap-3 my-4">
                            <div className="flex-1 h-[1px] bg-border"></div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <div className="flex-1 h-[1px] bg-border"></div>
                          </div>
                        )}
                        <div className={`flex flex-col ${msg.senderId._id === session.user.id ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[85%] sm:max-w-[70%] ${msg.senderId._id === session.user.id ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg' : 'bg-white/80 backdrop-blur-sm shadow-md border border-purple-200/50'} rounded-2xl p-3`}>
                            {msg.messageType === 'text' && <p className="text-sm">{msg.content}</p>}
                            {msg.messageType === 'image' && (
                              <img src={msg.imageUrl} alt="Shared" className="rounded max-w-full" />
                            )}
                            {msg.messageType === 'salon' && msg.salonId && (
                              <Link href={`/salons/${msg.salonId._id}`}>
                                <div className="bg-white text-black p-3 rounded">
                                  <p className="font-semibold">{msg.salonId.name}</p>
                                  <p className="text-xs">{msg.salonId.address}</p>
                                </div>
                              </Link>
                            )}
                          </div>
                          {msg.senderId._id === session.user.id && msg.isRead && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Seen {Math.floor((Date.now() - new Date(msg.readAt || msg.createdAt).getTime()) / (1000 * 60 * 60))}h ago
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 sm:p-4 border-t bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-amber-500/5 backdrop-blur-sm flex gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="image-upload"
                    onChange={handleImageUpload}
                  />
                  <Button variant="outline" size="icon" onClick={() => document.getElementById('image-upload')?.click()}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && messageText.trim()) {
                        e.preventDefault();
                        sendMessage('text', messageText);
                      }
                    }}
                  />
                  <Button onClick={() => sendMessage('text', messageText)}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
            </>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-[600px] w-full" />
        </div>
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
