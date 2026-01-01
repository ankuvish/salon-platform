"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircle, XCircle, MessageSquare, Clock, Shield } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ModeratorPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [pendingSalons, setPendingSalons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
    if (session?.user?.role !== "moderator") {
      toast.error("Access denied. Moderators only.");
      router.push("/");
    }
    if (session?.user?.role === "moderator") {
      fetchPendingSalons();
    }
  }, [session, isPending, router]);

  const fetchPendingSalons = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/salons?status=pending&limit=100");
      const data = await res.json();
      setPendingSalons(data);
    } catch (error) {
      toast.error("Failed to fetch pending salons");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (salonId: string) => {
    try {
      const res = await fetch(`http://localhost:4000/api/salons/${salonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approvalStatus: "approved" })
      });
      if (res.ok) {
        toast.success("Salon approved successfully!");
        fetchPendingSalons();
      } else {
        toast.error("Failed to approve salon");
      }
    } catch (error) {
      toast.error("Failed to approve salon");
    }
  };

  const handleReject = async () => {
    if (!selectedSalon || !rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      const res = await fetch(`http://localhost:4000/api/salons/${selectedSalon._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          approvalStatus: "rejected",
          rejectionReason: rejectionReason
        })
      });
      if (res.ok) {
        toast.success("Salon rejected with feedback sent");
        setShowRejectDialog(false);
        setRejectionReason("");
        setSelectedSalon(null);
        fetchPendingSalons();
      } else {
        toast.error("Failed to reject salon");
      }
    } catch (error) {
      toast.error("Failed to reject salon");
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
            Moderator Dashboard
          </h1>
        </div>

        <Card className="mb-6 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600" />
              Pending Salon Approvals ({pendingSalons.length})
            </CardTitle>
          </CardHeader>
        </Card>

        {pendingSalons.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending salon approvals at the moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pendingSalons.map((salon) => (
              <Card key={salon._id} className="border-2 border-amber-100">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{salon.name}</h3>
                      <Badge variant="secondary" className="mb-3">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending Approval
                      </Badge>
                      <p className="text-muted-foreground mb-3">{salon.description}</p>
                      <div className="grid md:grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium">Address:</span> {salon.address}, {salon.city}</div>
                        <div><span className="font-medium">Phone:</span> {salon.phone}</div>
                        <div><span className="font-medium">Type:</span> {salon.salonType || "Unisex"}</div>
                        <div><span className="font-medium">GST:</span> {salon.gstNumber || "Not provided"}</div>
                        <div><span className="font-medium">Hours:</span> {salon.openingTime} - {salon.closingTime}</div>
                        <div><span className="font-medium">Submitted:</span> {new Date(salon.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApprove(salon._id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      className="flex-1"
                      onClick={() => {
                        setSelectedSalon(salon);
                        setShowRejectDialog(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject & Send Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Salon Application</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Provide feedback to <span className="font-semibold">{selectedSalon?.name}</span> about what needs to be changed for approval:
            </p>
            <Textarea
              placeholder="e.g., Please provide valid GST number, update salon description, add proper contact information..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={5}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setRejectionReason("");
              setSelectedSalon(null);
            }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Send Feedback & Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
