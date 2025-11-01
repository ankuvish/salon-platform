"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { Sparkles, MapPin } from "lucide-react";
import ProfileMenu from "@/components/ProfileMenu";

export default function Navigation() {
  const { data: session, isPending } = useSession();

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            SalonBook
          </Link>

          <div className="flex items-center gap-4">
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
              <div className="h-9 w-20 animate-pulse bg-muted rounded" />
            ) : session?.user ? (
              <ProfileMenu />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}