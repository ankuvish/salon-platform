"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/api-config";
import Link from "next/link";
import FollowButton from "@/components/FollowButton";

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  role: string;
}

function FollowersContent() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId") || session?.user?.id;
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
    if (userId) {
      fetchFollowData();
    }
  }, [session, isPending, userId, router]);

  const fetchFollowData = async () => {
    try {
      const [followersRes, followingRes] = await Promise.all([
        apiRequest(`/api/follows/followers?userId=${userId}`),
        apiRequest(`/api/follows/following?userId=${userId}`)
      ]);

      if (followersRes.ok) {
        const data = await followersRes.json();
        setFollowers(data);
      }

      if (followingRes.ok) {
        const data = await followingRes.json();
        setFollowing(data);
      }
    } catch (error) {
      console.error("Failed to fetch follow data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Connections</h1>

        <Tabs defaultValue="followers">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">Followers ({followers.length})</TabsTrigger>
            <TabsTrigger value="following">Following ({following.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-6">
            {followers.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">No followers yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {followers.map((user) => (
                  <Card key={user._id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <Link href={`/profile?userId=${user._id}`} className="flex items-center gap-3 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.image} />
                            <AvatarFallback>
                              {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </Link>
                        <FollowButton targetUserId={user._id} onFollowChange={fetchFollowData} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-6">
            {following.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <p className="text-muted-foreground">Not following anyone yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {following.map((user) => (
                  <Card key={user._id}>
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-center justify-between">
                        <Link href={`/profile?userId=${user._id}`} className="flex items-center gap-3 flex-1">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.image} />
                            <AvatarFallback>
                              {user.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </Link>
                        <FollowButton targetUserId={user._id} onFollowChange={fetchFollowData} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function FollowersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    }>
      <FollowersContent />
    </Suspense>
  );
}
