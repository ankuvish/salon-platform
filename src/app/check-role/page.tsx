"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CheckRolePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  if (isPending) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Not Logged In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please login first</p>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Your Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <strong>Name:</strong> {session.user.name}
          </div>
          <div>
            <strong>Email:</strong> {session.user.email}
          </div>
          <div>
            <strong>Role:</strong> <span className="text-lg font-bold text-blue-600">{session.user.role}</span>
          </div>
          <div>
            <strong>User ID:</strong> {session.user.id}
          </div>
          
          <div className="pt-4 border-t space-y-2">
            {session.user.role === "admin" && (
              <Button onClick={() => router.push("/admin")} className="w-full">
                Go to Admin Dashboard
              </Button>
            )}
            {session.user.role === "moderator" && (
              <Button onClick={() => router.push("/moderator")} className="w-full">
                Go to Moderator Panel
              </Button>
            )}
            {session.user.role === "owner" && (
              <Button onClick={() => router.push("/dashboard")} className="w-full">
                Go to Owner Dashboard
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
