"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { apiRequest } from "@/lib/api-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Calendar, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  ChevronDown
} from "lucide-react";

export default function ProfileMenu({ isMobile = false }: { isMobile?: boolean }) {
  const { data: session, refetch } = useSession();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (session?.user?.role === 'owner') {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchUnreadCount = async () => {
    try {
      const salonRes = await apiRequest(`/api/salons?ownerId=${session?.user?.id}`);
      if (salonRes.ok) {
        const salons = await salonRes.json();
        if (salons.length > 0) {
          const countRes = await apiRequest(`/api/bookings/unread/count?salonId=${salons[0]._id}`);
          if (countRes.ok) {
            const data = await countRes.json();
            setUnreadCount(data.count || 0);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error?.code) {
      toast.error(error.code);
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Signed out successfully");
      router.push("/");
    }
  };

  if (!session?.user) {
    return null;
  }

  const user = session.user;
  const initials = user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  if (isMobile) {
    return (
      <div className="space-y-1">
        {user.role === "admin" ? (
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => router.push("/admin")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Admin Dashboard
          </Button>
        ) : user.role === "owner" ? (
          <Button variant="ghost" size="sm" className="w-full justify-start relative" onClick={() => router.push("/dashboard")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Dashboard
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        ) : user.role === "moderator" ? (
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => router.push("/moderator")}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Moderator Panel
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => router.push("/my-bookings")}>
            <Calendar className="mr-2 h-4 w-4" />
            My Bookings
          </Button>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-600" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-0 rounded-full relative">
          {user.role === 'owner' && unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs z-10">
              {unreadCount}
            </Badge>
          )}
          <div className="relative w-[45px] h-[45px] rounded-full">
            <div className="absolute inset-0 rounded-full animate-spin" style={{ animationDuration: '3s', background: 'conic-gradient(from 0deg, #d4af37 0%, #ffffff 5%, #d4af37 15%, #4169e1 40%, #ff1493 65%, #d4af37 100%)' }} />
            <div className="absolute inset-0 rounded-full animate-pulse" style={{ animationDuration: '2s', filter: 'blur(8px)', background: 'radial-gradient(circle, rgba(212,175,55,0.6) 0%, transparent 70%)', animation: 'glowCycle 3s ease-in-out infinite' }} />
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
            <div className="absolute inset-[3px] rounded-full bg-background flex items-center justify-center z-10">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.image || undefined} alt={user.name || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {user.username || user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {user.role === "admin" ? (
          <>
            <DropdownMenuItem onClick={() => router.push("/admin")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Admin Dashboard
            </DropdownMenuItem>
          </>
        ) : user.role === "owner" ? (
          <>
            <DropdownMenuItem onClick={() => router.push("/dashboard")} className="relative">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-auto h-5 min-w-5 px-1 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </DropdownMenuItem>
          </>
        ) : user.role === "moderator" ? (
          <>
            <DropdownMenuItem onClick={() => router.push("/moderator")}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Moderator Panel
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => router.push("/my-bookings")}>
              <Calendar className="mr-2 h-4 w-4" />
              My Bookings
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => router.push("/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
