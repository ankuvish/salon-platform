"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { Sparkles, MapPin, Menu, X, Bell, Check, MessageCircle, RefreshCw } from "lucide-react";
import ProfileMenu from "@/components/ProfileMenu";
import AuthDialog from "@/components/AuthDialog";


export default function Navigation() {
  const { data: session, isPending } = useSession();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [messageCount, setMessageCount] = useState(0);
  
  // Cache session for instant display
  const cachedSession = session || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('cached_session') || 'null') : null);
  if (session && typeof window !== 'undefined') {
    localStorage.setItem('cached_session', JSON.stringify(session));
  }

  // Fetch notification count
  useEffect(() => {
    if (session?.user?.id) {
      fetchNotifCount();
      fetchMessageCount();
      const interval = setInterval(() => {
        fetchNotifCount();
        fetchMessageCount();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [notifOpen]);

  const fetchNotifCount = async () => {
    try {
      const [countRes, notifsRes] = await Promise.all([
        fetch(`http://localhost:4000/api/notifications/unread/count?userId=${session?.user?.id}`),
        fetch(`http://localhost:4000/api/notifications?userId=${session?.user?.id}&limit=10`)
      ]);
      if (countRes.ok) {
        const data = await countRes.json();
        setNotifCount(data.count);
      }
      if (notifsRes.ok) {
        const data = await notifsRes.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/notifications/${id}/read`, { method: 'PUT' });
      if (res.ok) {
        fetchNotifCount();
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const fetchMessageCount = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/messages/unread/count`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setMessageCount(data.count);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  return (
    <>
      <nav className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg shadow-purple-500/5 sticky top-0 z-50">
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500"></div>
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl sm:text-2xl font-bold luxury-gradient-text">
              SalonBook
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/nearby">
                <Button variant="ghost" size="sm">
                  <MapPin className="h-4 w-4 mr-2" />
                  Nearby
                </Button>
              </Link>
              <Link href="/recommendations">
                <Button variant="ghost" size="sm">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Recommendations
                </Button>
              </Link>

              {isPending ? (
                <div className="h-9 w-9 animate-pulse bg-muted rounded-full" />
              ) : session?.user ? (
                <>
                  {session.user.roles?.length > 1 && (
                    <div className="relative group">
                      <Button variant="outline" size="sm" className="gap-2">
                        <RefreshCw className="h-4 w-4" />
                        Switch Role
                      </Button>
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-lg shadow-xl border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        {session.user.roles.includes('admin') && (
                          <Link href="/admin" className="block px-4 py-2 hover:bg-accent rounded-t-lg">
                            Admin Dashboard
                          </Link>
                        )}
                        {session.user.roles.includes('moderator') && (
                          <Link href="/moderator" className="block px-4 py-2 hover:bg-accent">
                            Moderator Panel
                          </Link>
                        )}
                        {session.user.roles.includes('owner') && (
                          <Link href="/dashboard" className="block px-4 py-2 hover:bg-accent">
                            Owner Dashboard
                          </Link>
                        )}
                        {session.user.roles.includes('customer') && (
                          <Link href="/" className="block px-4 py-2 hover:bg-accent rounded-b-lg">
                            Customer View
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                  <Link href="/messages">
                    <Button variant="ghost" size="sm" className="relative">
                      <MessageCircle className="h-4 w-4" />
                      {messageCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {messageCount > 9 ? '9+' : messageCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <div className="relative" ref={notifRef}>
                    <Button variant="ghost" size="sm" className="relative" onClick={() => setNotifOpen(!notifOpen)}>
                      <Bell className="h-4 w-4" />
                      {notifCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {notifCount > 9 ? '9+' : notifCount}
                        </span>
                      )}
                    </Button>
                    {notifOpen && (
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border z-50 overflow-hidden">
                        <div className="overflow-y-auto max-h-80">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No notifications</p>
                            </div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                key={notif._id}
                                className={`p-3 border-b hover:bg-accent cursor-pointer ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                                onClick={() => {
                                  if (!notif.isRead) markAsRead(notif._id);
                                  setNotifOpen(false);
                                }}
                              >
                                <div className="flex items-start gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm">{notif.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(notif.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  {!notif.isRead && <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        {notifications.length > 0 && (
                          <div className="py-2 border-t text-center">
                            <Link href="/notifications" onClick={() => setNotifOpen(false)}>
                              <span className="inline-block px-3 py-1 text-xs font-medium text-primary hover:bg-accent rounded-md cursor-pointer transition-colors">View All</span>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <ProfileMenu />
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" onClick={() => { setAuthTab("login"); setAuthOpen(true); }}>
                    Login
                  </Button>
                  <Button size="sm" className="luxury-button" onClick={() => { setAuthTab("signup"); setAuthOpen(true); }}>
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              {session?.user && (
                <>
                  <Link href="/messages">
                    <Button variant="ghost" size="sm" className="relative">
                      <MessageCircle className="h-4 w-4" />
                      {messageCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {messageCount > 9 ? '9+' : messageCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                  <div className="relative" ref={notifRef}>
                    <Button variant="ghost" size="sm" className="relative" onClick={() => setNotifOpen(!notifOpen)}>
                      <Bell className="h-4 w-4" />
                    {notifCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {notifCount > 9 ? '9+' : notifCount}
                      </span>
                    )}
                  </Button>
                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-xl border z-50 overflow-hidden">
                      <div className="overflow-y-auto max-h-80">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif._id}
                              className={`p-3 border-b hover:bg-accent cursor-pointer ${!notif.isRead ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                              onClick={() => {
                                if (!notif.isRead) markAsRead(notif._id);
                                setNotifOpen(false);
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm">{notif.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(notif.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                {!notif.isRead && <div className="h-2 w-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      {notifications.length > 0 && (
                        <div className="py-2 border-t text-center">
                          <Link href="/notifications" onClick={() => setNotifOpen(false)}>
                            <span className="inline-block px-3 py-1 text-xs font-medium text-primary hover:bg-accent rounded-md cursor-pointer transition-colors">View All</span>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-purple-200/50 dark:border-purple-800/50 pt-4">
              {cachedSession?.user ? (
                <div className="mb-3">
                  <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-accent/30">
                    <div className="relative w-14 h-14 rounded-full flex-shrink-0">
                      <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '3s', background: 'conic-gradient(from 0deg, #d4af37 0%, #ffffff 5%, #d4af37 15%, #4169e1 40%, #ff1493 65%, #d4af37 100%)' }} />
                      <div className="absolute inset-0 rounded-full" style={{ animation: 'glowCycle 3s ease-in-out infinite' }} />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-yellow-300 rounded-full" style={{ animation: 'sparkle 2s ease-in-out infinite' }} />
                      <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-300 rounded-full" style={{ animation: 'sparkle 2.5s ease-in-out infinite 0.5s' }} />
                      <style jsx>{`
                        @keyframes glowCycle {
                          0%, 100% { filter: drop-shadow(0 0 15px rgba(184, 134, 11, 1)) drop-shadow(0 0 25px rgba(184, 134, 11, 0.6)); }
                          33% { filter: drop-shadow(0 0 15px rgba(25, 55, 150, 1)) drop-shadow(0 0 25px rgba(25, 55, 150, 0.6)); }
                          66% { filter: drop-shadow(0 0 15px rgba(200, 16, 115, 1)) drop-shadow(0 0 25px rgba(200, 16, 115, 0.6)); }
                        }
                        @keyframes sparkle {
                          0%, 100% { opacity: 0; transform: scale(0); }
                          50% { opacity: 1; transform: scale(1.5); }
                        }
                      `}</style>
                      <div className="absolute inset-[3px] rounded-full bg-background flex items-center justify-center overflow-hidden z-10">
                        {cachedSession.user.image ? (
                          <img src={cachedSession.user.image} alt={cachedSession.user.name || "User"} className="w-full h-full object-cover rounded-full" />
                        ) : (
                          <div className="w-full h-full rounded-full bg-primary text-primary-foreground flex items-center justify-center text-base font-semibold">
                            {cachedSession.user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold truncate">{cachedSession.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{cachedSession.user.email}</p>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <ProfileMenu isMobile={true} />
                  </div>
                  <div className="border-t border-purple-200/30 dark:border-purple-800/30 my-3" />
                </div>
              ) : !isPending && (
                <div className="flex flex-col gap-2 mb-3">
                  <Button variant="outline" size="sm" className="w-full" onClick={() => { setAuthTab("login"); setAuthOpen(true); setMobileMenuOpen(false); }}>
                    Login
                  </Button>
                  <Button size="sm" className="luxury-button w-full" onClick={() => { setAuthTab("signup"); setAuthOpen(true); setMobileMenuOpen(false); }}>
                    Sign Up
                  </Button>
                  <div className="border-t border-purple-200/30 dark:border-purple-800/30 my-2" />
                </div>
              )}
              
              <Link href="/nearby" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Nearby Salons
                </Button>
              </Link>
              <Link href="/recommendations" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Recommendations
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} defaultTab={authTab} />
    </>
  );
}
