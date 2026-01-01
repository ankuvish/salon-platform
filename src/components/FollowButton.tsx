"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-config";

interface FollowButtonProps {
  targetUserId: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ targetUserId, onFollowChange }: FollowButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowingBack, setIsFollowingBack] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id && targetUserId) {
      checkFollowStatus();
    }
  }, [session?.user?.id, targetUserId]);

  const checkFollowStatus = async () => {
    try {
      const [followingRes, followBackRes] = await Promise.all([
        apiRequest(`/api/follows/check?followerId=${session?.user?.id}&followingId=${targetUserId}`),
        apiRequest(`/api/follows/check?followerId=${targetUserId}&followingId=${session?.user?.id}`)
      ]);
      
      if (followingRes.ok) {
        const data = await followingRes.json();
        setIsFollowing(data.isFollowing);
      }
      
      if (followBackRes.ok) {
        const data = await followBackRes.json();
        setIsFollowingBack(data.isFollowing);
      }
    } catch (error) {
      console.error("Failed to check follow status:", error);
    }
  };

  const handleFollow = async () => {
    if (!session?.user) {
      toast.error("Please sign in to follow");
      return;
    }

    if (session.user.id === targetUserId) {
      toast.error("You cannot follow yourself");
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        const res = await apiRequest(`/api/follows?followerId=${session.user.id}&followingId=${targetUserId}`, {
          method: "DELETE"
        });
        if (res.ok) {
          setIsFollowing(false);
          toast.success("Unfollowed successfully");
          onFollowChange?.(false);
        }
      } else {
        const res = await apiRequest(`/api/follows`, {
          method: "POST",
          body: JSON.stringify({
            followerId: session.user.id,
            followingId: targetUserId
          })
        });
        if (res.ok) {
          setIsFollowing(true);
          toast.success("Following successfully");
          onFollowChange?.(true);
        }
      }
    } catch (error) {
      toast.error("Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  if (!session?.user || session.user.id === targetUserId) {
    return null;
  }

  if (isFollowing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(`/messages?userId=${targetUserId}`)}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Message
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleFollow}
      disabled={loading}
    >
      <UserPlus className="h-4 w-4 mr-2" />
      {isFollowingBack ? "Follow Back" : "Follow"}
    </Button>
  );
}
