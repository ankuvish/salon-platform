"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Bell, Shield, Heart } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    username: "",
    birthday: "",
    contactMethod: "email",
    image: ""
  });
  
  const [imagePreview, setImagePreview] = useState("");

  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [notifications, setNotifications] = useState({
    reminders: true,
    lastMinute: false,
    promotions: true,
    newServices: false
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
    if (session?.user) {
      fetchUserData();
    }
  }, [session, isPending, router]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const maxSize = 800;
          
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const fetchUserData = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/users/${session?.user?.id}/data`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          username: data.user.username || "",
          birthday: "",
          contactMethod: "email",
          image: data.user.image || ""
        });
        setImagePreview(data.user.image || "");
      }
    } catch (error) {
      console.error("Failed to fetch user data");
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${session?.user?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        toast.success("Settings saved successfully!");
        refetch();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  const handleChangePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    try {
      const response = await fetch(`http://localhost:4000/api/users/${session?.user?.id}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      });
      if (response.ok) {
        toast.success("Password changed successfully!");
        setPasswordDialog(false);
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to change password");
      }
    } catch (error) {
      toast.error("Failed to change password");
    }
  };

  const handleDownloadData = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${session?.user?.id}/data`);
      if (response.ok) {
        const data = await response.json();
        await generateVisitingCard(data);
        toast.success("Visiting card downloaded successfully!");
      } else {
        toast.error("Failed to download data");
      }
    } catch (error) {
      toast.error("Failed to download data");
    }
  };

  const generateVisitingCard = async (data: any) => {
    const QRCode = (await import('qrcode')).default;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1680;
    const ctx = canvas.getContext('2d')!;
    
    // Luxurious RGB gradient background with rounded corners
    const gradient = ctx.createLinearGradient(0, 0, 0, 1680);
    gradient.addColorStop(0, 'rgb(15, 23, 42)');
    gradient.addColorStop(0.3, 'rgb(88, 28, 135)');
    gradient.addColorStop(0.6, 'rgb(126, 34, 206)');
    gradient.addColorStop(1, 'rgb(180, 83, 9)');
    ctx.fillStyle = gradient;
    roundRect(ctx, 0, 0, 1080, 1680, 40);
    ctx.fill();
    ctx.clip();
    
    // Gold accent line at top (with rounded top)
    ctx.fillStyle = 'rgb(251, 191, 36)';
    roundRect(ctx, 0, 0, 1080, 10, 40);
    ctx.fill();
    
    // Profile photo circle with RGB gradient border
    const centerX = 540;
    
    // RGB gradient ring
    const rgbGradient = ctx.createConicGradient(0, centerX, 380);
    rgbGradient.addColorStop(0, 'rgb(239, 68, 68)');
    rgbGradient.addColorStop(0.33, 'rgb(34, 197, 94)');
    rgbGradient.addColorStop(0.66, 'rgb(59, 130, 246)');
    rgbGradient.addColorStop(1, 'rgb(239, 68, 68)');
    ctx.fillStyle = rgbGradient;
    ctx.beginPath();
    ctx.arc(centerX, 380, 230, 0, Math.PI * 2);
    ctx.fill();
    
    // White background for photo
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.beginPath();
    ctx.arc(centerX, 380, 210, 0, Math.PI * 2);
    ctx.fill();
    
    // Profile image or initials
    if (data.user.image) {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = data.user.image;
        });
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, 380, 200, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, centerX - 200, 180, 400, 400);
        ctx.restore();
      } catch (e) {
        drawInitials(ctx, data.user.name, centerX, 380);
      }
    } else {
      drawInitials(ctx, data.user.name, centerX, 380);
    }
    
    // Name with luxurious font and shadow (auto-resize and wrap)
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.textAlign = 'center';
    drawWrappedText(ctx, data.user.name, centerX, 680, 900, 84, '700', '"Georgia", serif');
    ctx.shadowBlur = 0;
    
    // Website logo and username centered together
    const logoSize = 60;
    const username = data.user.username || data.user.email;
    const spacing = 20;
    
    ctx.font = `normal 44px sans-serif`;
    const textWidth = ctx.measureText(username).width;
    const totalWidth = logoSize + spacing + textWidth;
    const startX = centerX - (totalWidth / 2);
    
    // Draw logo circle with gradient
    const logoGradient = ctx.createLinearGradient(startX, 780 - logoSize/2, startX + logoSize, 780 + logoSize/2);
    logoGradient.addColorStop(0, 'rgb(147, 51, 234)');
    logoGradient.addColorStop(1, 'rgb(236, 72, 153)');
    ctx.fillStyle = logoGradient;
    ctx.beginPath();
    ctx.arc(startX + logoSize/2, 780, logoSize/2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw 'S' for SalonBook
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.font = 'bold 40px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('S', startX + logoSize/2, 780);
    
    // Username (auto-resize)
    ctx.fillStyle = 'rgb(251, 191, 36)';
    ctx.font = 'normal 44px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(username, startX + logoSize + spacing, 780);
    
    // Decorative line
    ctx.strokeStyle = 'rgb(251, 191, 36)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 880);
    ctx.lineTo(780, 880);
    ctx.stroke();
    
    // QR Code (reduced spacing)
    const qrData = JSON.stringify({
      name: data.user.name,
      username: data.user.username || '',
      email: data.user.email,
      phone: data.user.phone || ''
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, { width: 480, margin: 1 });
    const qrImg = new Image();
    await new Promise((resolve) => {
      qrImg.onload = resolve;
      qrImg.src = qrCodeDataUrl;
    });
    
    // White rounded background for QR
    ctx.fillStyle = 'rgb(255, 255, 255)';
    roundRect(ctx, centerX - 264, 956, 528, 528, 24);
    ctx.fill();
    ctx.drawImage(qrImg, centerX - 240, 980, 480, 480);
    
    // Bottom text
    ctx.fillStyle = 'rgb(251, 191, 36)';
    ctx.font = 'italic 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Scan to connect', centerX, 1620);
    
    // Download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob!);
      const a = document.createElement('a');
      a.href = url;
      a.download = `visiting-card-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };
  
  const drawWrappedText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, baseFontSize: number, weight: string, family: string) => {
    let fontSize = baseFontSize;
    ctx.font = `${weight} ${fontSize}px ${family}`;
    
    // Auto-reduce font size if text is too wide
    while (ctx.measureText(text).width > maxWidth && fontSize > 24) {
      fontSize -= 2;
      ctx.font = `${weight} ${fontSize}px ${family}`;
    }
    
    // Wrap text if still too wide
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];
    
    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + ' ' + words[i];
      if (ctx.measureText(testLine).width <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = words[i];
      }
    }
    lines.push(currentLine);
    
    // Draw lines centered
    const lineHeight = fontSize * 1.2;
    const startY = y - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, i) => {
      ctx.fillText(line, x, startY + i * lineHeight);
    });
  };
  
  const drawInitials = (ctx: CanvasRenderingContext2D, name: string, x: number, y: number) => {
    const gradient = ctx.createLinearGradient(x - 200, y - 200, x + 200, y + 200);
    gradient.addColorStop(0, 'rgb(147, 51, 234)');
    gradient.addColorStop(1, 'rgb(126, 34, 206)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 200, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.font = 'bold 110px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    ctx.fillText(initials, x, y);
  };
  
  const roundRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-64 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
          Settings
        </h1>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card className="border-2 border-purple-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full border-4 border-purple-200 overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-16 w-16 text-purple-400" />
                      )}
                    </div>
                    <label htmlFor="profile-upload" className="absolute bottom-0 right-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-2 rounded-full cursor-pointer hover:shadow-lg transition-shadow">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </label>
                    <input
                      id="profile-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const compressed = await compressImage(file);
                          setImagePreview(compressed);
                          setProfile({...profile, image: compressed});
                        }
                      }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Click the icon to change photo</p>
                </div>
                <div>
                  <Label>Full Name</Label>
                  <Input value={profile.name} onChange={(e) => setProfile({...profile, name: e.target.value})} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} />
                </div>
                <div>
                  <Label>Username (starts with @)</Label>
                  <Input 
                    value={profile.username} 
                    onChange={(e) => {
                      let val = e.target.value;
                      if (val && !val.startsWith('@')) val = '@' + val;
                      setProfile({...profile, username: val})
                    }} 
                    placeholder="@username"
                  />
                </div>
                <div>
                  <Label>Birthday</Label>
                  <Input type="date" value={profile.birthday} onChange={(e) => setProfile({...profile, birthday: e.target.value})} />
                </div>
                <div>
                  <Label>Preferred Contact Method</Label>
                  <Select value={profile.contactMethod} onValueChange={(v) => setProfile({...profile, contactMethod: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="border-2 border-pink-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-pink-600" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Appointment Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get notified before your appointments</p>
                  </div>
                  <Switch checked={notifications.reminders} onCheckedChange={(v) => setNotifications({...notifications, reminders: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Last-minute Openings</Label>
                    <p className="text-sm text-muted-foreground">Be notified of available slots</p>
                  </div>
                  <Switch checked={notifications.lastMinute} onCheckedChange={(v) => setNotifications({...notifications, lastMinute: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Promotions & Offers</Label>
                    <p className="text-sm text-muted-foreground">Receive special deals and discounts</p>
                  </div>
                  <Switch checked={notifications.promotions} onCheckedChange={(v) => setNotifications({...notifications, promotions: v})} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Service Updates</Label>
                    <p className="text-sm text-muted-foreground">Stay updated on new services</p>
                  </div>
                  <Switch checked={notifications.newServices} onCheckedChange={(v) => setNotifications({...notifications, newServices: v})} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card className="border-2 border-amber-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-amber-600" />
                  Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Allergies/Sensitivities</Label>
                  <Textarea placeholder="Any allergies or sensitivities..." rows={3} />
                </div>
                <div>
                  <Label>Service Notes</Label>
                  <Textarea placeholder="Special requests or preferences..." rows={3} />
                </div>
                <div>
                  <Label>Preferred Time of Day</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preferred time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                      <SelectItem value="evening">Evening (5PM - 9PM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="border-2 border-red-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-600" />
                  Privacy & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Password</h3>
                  <Button variant="outline" className="w-full" onClick={() => setPasswordDialog(true)}>Change Password</Button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch />
                </div>
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Data & Privacy</h3>
                  <Button variant="outline" className="w-full mb-2" onClick={handleDownloadData}>Download Visiting Card</Button>
                  <Button variant="destructive" className="w-full">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {passwordDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setPasswordDialog(false)}>
          <Card className="w-full max-w-md m-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <Input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} />
              </div>
              <div>
                <Label>New Password</Label>
                <Input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setPasswordDialog(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleChangePassword}>Change Password</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
