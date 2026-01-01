"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Building2, MapPin, Shield, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [moderators, setModerators] = useState<any[]>([]);
  const [approvedSalons, setApprovedSalons] = useState<any[]>([]);
  const [regionalStats, setRegionalStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [showAppointDialog, setShowAppointDialog] = useState(false);
  const [appointForm, setAppointForm] = useState({ email: "", region: "" });
  const [isAppointing, setIsAppointing] = useState(false);

  useEffect(() => {
    if (isPending) return;
    
    if (!session?.user) {
      router.push("/login");
      return;
    }
    
    if (session.user.role !== "admin") {
      toast.error("Access denied. Admins only.");
      router.push("/");
      return;
    }
    
    fetchData();
  }, [session, isPending, router]);

  const fetchData = async () => {
    try {
      const [modRes, salonsRes, statsRes] = await Promise.all([
        fetch("http://localhost:4000/api/users/moderators"),
        fetch("http://localhost:4000/api/salons?status=approved&limit=1000"),
        fetch("http://localhost:4000/api/salons/regional-stats")
      ]);
      
      if (modRes.ok) {
        const modData = await modRes.json();
        setModerators(modData);
      }
      
      if (salonsRes.ok) {
        const salonsData = await salonsRes.json();
        setApprovedSalons(salonsData);
      }
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setRegionalStats(statsData);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
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

  const regions = ["all", ...new Set(moderators.map(m => m.region).filter(Boolean))];
  const filteredSalons = selectedRegion === "all" 
    ? approvedSalons 
    : approvedSalons.filter(s => s.city === selectedRegion);

  const getSalonsByRegion = (region: string) => {
    return approvedSalons.filter(s => s.city === region).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-purple-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Moderators</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{moderators.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Approved Salons</CardTitle>
              <Building2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedSalons.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Regions</CardTitle>
              <MapPin className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(approvedSalons.map(s => s.city)).size}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="regional" className="space-y-6">
          <TabsList>
            <TabsTrigger value="regional">Regional Analytics</TabsTrigger>
            <TabsTrigger value="moderators">Moderators ({moderators.length})</TabsTrigger>
            <TabsTrigger value="salons">Approved Salons ({approvedSalons.length})</TabsTrigger>
            <TabsTrigger value="appoint">Appoint Moderator</TabsTrigger>
          </TabsList>

          <TabsContent value="regional" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  Regional Approval Analytics
                </CardTitle>
              </CardHeader>
            </Card>

            {regionalStats.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Regional Data</h3>
                  <p className="text-muted-foreground">No salons registered yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {regionalStats.map((stat) => (
                  <Card key={stat.region} className="border-2 border-purple-100">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-purple-600" />
                          <CardTitle className="text-xl">{stat.region}</CardTitle>
                        </div>
                        {stat.moderator && (
                          <Badge variant="secondary" className="text-xs">
                            <Shield className="h-3 w-3 mr-1" />
                            {stat.moderator.name}
                          </Badge>
                        )}
                      </div>
                      {stat.moderator && (
                        <p className="text-xs text-muted-foreground">{stat.moderator.email}</p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-green-50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{stat.approved}</div>
                          <div className="text-xs text-green-700 mt-1">Approved</div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-amber-600">{stat.pending}</div>
                          <div className="text-xs text-amber-700 mt-1">Pending</div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold text-red-600">{stat.rejected}</div>
                          <div className="text-xs text-red-700 mt-1">Rejected</div>
                        </div>
                      </div>

                      {stat.rejectedSalons.length > 0 && (
                        <div className="pt-3 border-t">
                          <h4 className="text-sm font-semibold mb-2 text-red-600">Rejected Salons:</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {stat.rejectedSalons.map((salon: any, idx: number) => (
                              <div key={idx} className="bg-red-50 p-2 rounded text-xs">
                                <div className="font-semibold text-red-900">{salon.name}</div>
                                <div className="text-red-700 mt-1">Reason: {salon.reason}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!stat.moderator && (
                        <div className="pt-3 border-t">
                          <Badge variant="outline" className="text-xs text-amber-600">
                            No moderator assigned
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="moderators" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  Appointed Moderators
                </CardTitle>
              </CardHeader>
            </Card>

            {moderators.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Moderators</h3>
                  <p className="text-muted-foreground">No moderators have been appointed yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {moderators.map((mod) => (
                  <Card key={mod._id} className="border-2 border-purple-100">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{mod.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{mod.email}</p>
                          {mod.phone && (
                            <p className="text-sm text-muted-foreground mb-2">{mod.phone}</p>
                          )}
                        </div>
                        <Badge variant="secondary">
                          <Shield className="h-3 w-3 mr-1" />
                          Moderator
                        </Badge>
                      </div>
                      
                      {mod.region && (
                        <div className="pt-3 border-t">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-purple-600" />
                              <span className="font-medium">{mod.region}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {getSalonsByRegion(mod.region)} salons
                            </Badge>
                          </div>
                        </div>
                      )}
                      
                      <div className="pt-3 border-t mt-3">
                        <p className="text-xs text-muted-foreground">
                          Joined: {new Date(mod.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="salons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    Approved Salons by Region
                  </span>
                  <select
                    className="px-3 py-1 border rounded-md text-sm"
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                  >
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region === "all" ? "All Regions" : region}
                      </option>
                    ))}
                  </select>
                </CardTitle>
              </CardHeader>
            </Card>

            {filteredSalons.length === 0 ? (
              <Card>
                <CardContent className="pt-12 pb-12 text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Approved Salons</h3>
                  <p className="text-muted-foreground">
                    {selectedRegion === "all" 
                      ? "No salons have been approved yet" 
                      : `No salons in ${selectedRegion}`}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredSalons.map((salon) => (
                  <Card key={salon._id} className="border-2 border-green-100">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{salon.name}</h3>
                          <Badge className="bg-green-500 mb-2">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-3">{salon.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{salon.address}, {salon.city}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-muted-foreground">Rating:</span>
                          <span className="font-semibold">{salon.rating.toFixed(1)} ⭐</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-semibold capitalize">{salon.salonType || "Unisex"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Approved:</span>
                          <span className="text-xs">{new Date(salon.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="appoint" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Appoint New Moderator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> The user must already have an account. Enter their registered email address and assign a region.
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address *</label>
                  <input
                    type="email"
                    placeholder="moderator@example.com"
                    value={appointForm.email}
                    onChange={(e) => setAppointForm({ ...appointForm, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assigned Region *</label>
                  <input
                    type="text"
                    placeholder="e.g., Mumbai, Delhi, Bangalore"
                    value={appointForm.region}
                    onChange={(e) => setAppointForm({ ...appointForm, region: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!appointForm.email || !appointForm.region) {
                      toast.error("Please fill all fields");
                      return;
                    }
                    setIsAppointing(true);
                    try {
                      const res = await fetch("http://localhost:4000/api/users/promote-moderator", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          email: appointForm.email,
                          secretKey: "MODERATOR_SECRET_2024",
                          region: appointForm.region
                        })
                      });
                      const data = await res.json();
                      if (res.ok) {
                        toast.success("Moderator appointed successfully!");
                        setAppointForm({ email: "", region: "" });
                        fetchData();
                      } else {
                        toast.error(data.error || "Failed to appoint moderator");
                      }
                    } catch (error) {
                      toast.error("Failed to appoint moderator");
                    } finally {
                      setIsAppointing(false);
                    }
                  }}
                  disabled={isAppointing}
                  className="w-full"
                >
                  {isAppointing ? "Appointing..." : "Appoint Moderator"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
