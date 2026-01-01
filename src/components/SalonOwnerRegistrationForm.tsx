"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Mail, User, Store, MapPin, Upload, X, Plus, Clock, DollarSign, Users, Lock } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  price: string;
  durationMinutes: string;
  staffName: string;
}

interface SalonOwnerFormProps {
  onSubmit: (data: SalonOwnerFormData) => void;
  isLoading: boolean;
  initialPhone?: string;
}

export interface SalonOwnerFormData {
  ownerName: string;
  salonName: string;
  phone: string;
  email: string;
  password: string;
  salonType: string;
  services: Service[];
  address: string;
  street: string;
  city: string;
  zipCode: string;
  shopImages: File[];
  numberOfSeats: string;
  description: string;
  openingTime: string;
  closingTime: string;
}

export const SalonOwnerRegistrationForm = ({ onSubmit, isLoading, initialPhone = "" }: SalonOwnerFormProps) => {
  // Basic Info
  const [ownerName, setOwnerName] = useState("");
  const [salonName, setSalonName] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState(initialPhone);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [salonType, setSalonType] = useState("");
  
  // Location
  const [address, setAddress] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  
  // Salon Details
  const [numberOfSeats, setNumberOfSeats] = useState("");
  const [description, setDescription] = useState("");
  const [openingTime, setOpeningTime] = useState("09:00");
  const [closingTime, setClosingTime] = useState("18:00");
  
  // Services
  const [services, setServices] = useState<Service[]>([
    { id: "1", name: "", price: "", durationMinutes: "", staffName: "" }
  ]);
  
  // Images
  const [shopImages, setShopImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleAddService = () => {
    setServices([...services, { 
      id: Date.now().toString(), 
      name: "", 
      price: "", 
      durationMinutes: "", 
      staffName: "" 
    }]);
  };

  const handleRemoveService = (id: string) => {
    if (services.length > 1) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const handleServiceChange = (id: string, field: keyof Service, value: string) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (shopImages.length + files.length > 5) {
      toast.error("You can upload maximum 5 images");
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
    setShopImages([...shopImages, ...files]);
  };

  const handleRemoveImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
    setShopImages(shopImages.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!ownerName.trim()) {
      toast.error("Please enter owner's full name");
      return false;
    }
    if (!salonName.trim()) {
      toast.error("Please enter salon name");
      return false;
    }
    if (!phone) {
      toast.error("Please enter phone number");
      return false;
    }
    const fullPhone = `${countryCode}${phone}`;
    if (!/^\+[1-9]\d{1,14}$/.test(fullPhone)) {
      toast.error("Please enter a valid phone number");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!password.trim() || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (!salonType) {
      toast.error("Please select salon type");
      return false;
    }
    if (!address.trim() || !street.trim() || !city.trim() || !zipCode.trim()) {
      toast.error("Please fill in all address fields");
      return false;
    }
    if (!numberOfSeats || parseInt(numberOfSeats) < 1) {
      toast.error("Please enter valid number of seats");
      return false;
    }
    if (!description.trim()) {
      toast.error("Please provide salon description");
      return false;
    }
    
    // Validate at least one complete service
    const validServices = services.filter(s => 
      s.name.trim() && s.price && s.durationMinutes && s.staffName.trim()
    );
    if (validServices.length === 0) {
      toast.error("Please add at least one complete service with all details");
      return false;
    }

    if (shopImages.length === 0) {
      toast.error("Please upload at least one shop image");
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const formData: SalonOwnerFormData = {
      ownerName,
      salonName,
      phone: `${countryCode}${phone}`,
      email,
      password,
      salonType,
      services: services.filter(s => s.name.trim() && s.price && s.durationMinutes && s.staffName.trim()),
      address,
      street,
      city,
      zipCode,
      shopImages,
      numberOfSeats,
      description,
      openingTime,
      closingTime
    };

    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      {/* Owner & Salon Basic Info */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Owner & Salon Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ownerName">
                Salon Owner Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="ownerName"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="John Doe"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salonName">
                Salon Shop Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="salonName"
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  placeholder="Elegant Hair Studio"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Mobile Number <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={setCountryCode} disabled={isLoading}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="+1">🇺🇸 +1</SelectItem>
                    <SelectItem value="+44">🇬🇧 +44</SelectItem>
                    <SelectItem value="+91">🇮🇳 +91</SelectItem>
                    <SelectItem value="+86">🇨🇳 +86</SelectItem>
                    <SelectItem value="+81">🇯🇵 +81</SelectItem>
                    <SelectItem value="+49">🇩🇪 +49</SelectItem>
                    <SelectItem value="+33">🇫🇷 +33</SelectItem>
                    <SelectItem value="+61">🇦🇺 +61</SelectItem>
                    <SelectItem value="+971">🇦🇪 +971</SelectItem>
                    <SelectItem value="+966">🇸🇦 +966</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="XXXXXXXXXX"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Gmail Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="salon@example.com"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="salonType">
                Salon Type <span className="text-destructive">*</span>
              </Label>
              <Select value={salonType} onValueChange={setSalonType} disabled={isLoading}>
                <SelectTrigger id="salonType">
                  <SelectValue placeholder="Select salon type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="men">Men's Salon</SelectItem>
                  <SelectItem value="women">Women's Salon</SelectItem>
                  <SelectItem value="unisex">Unisex Salon</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfSeats">
                Number of Seats <span className="text-destructive">*</span>
              </Label>
              <Input
                id="numberOfSeats"
                type="number"
                min="1"
                value={numberOfSeats}
                onChange={(e) => setNumberOfSeats(e.target.value)}
                placeholder="e.g., 5"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Salon Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your salon, services, and what makes it special..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="openingTime">Opening Time</Label>
              <Input
                id="openingTime"
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="closingTime">Closing Time</Label>
              <Input
                id="closingTime"
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Details */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Location Details</h3>
          
          <div className="space-y-2">
            <Label htmlFor="address">
              Full Address <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., Building name, landmark..."
                rows={2}
                className="pl-10"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="street">
                Street Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="street"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Main Street"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">
                City <span className="text-destructive">*</span>
              </Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New York"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">
                Zip Code <span className="text-destructive">*</span>
              </Label>
              <Input
                id="zipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="10001"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services & Staff */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Services & Staff</h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={handleAddService}
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Add services offered at your salon. Staff can be the same person or different for each service.
          </p>

          <div className="space-y-4">
            {services.map((service, index) => (
              <Card key={service.id} className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-sm">Service #{index + 1}</h4>
                    {services.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveService(service.id)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor={`service-name-${service.id}`}>
                        Service Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id={`service-name-${service.id}`}
                        value={service.name}
                        onChange={(e) => handleServiceChange(service.id, "name", e.target.value)}
                        placeholder="e.g., Haircut"
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`service-staff-${service.id}`}>
                        Staff/Stylist Name <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`service-staff-${service.id}`}
                          value={service.staffName}
                          onChange={(e) => handleServiceChange(service.id, "staffName", e.target.value)}
                          placeholder="e.g., Alex Johnson"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`service-price-${service.id}`}>
                        Price (₹) <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`service-price-${service.id}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={service.price}
                          onChange={(e) => handleServiceChange(service.id, "price", e.target.value)}
                          placeholder="500"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`service-duration-${service.id}`}>
                        Duration (minutes) <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id={`service-duration-${service.id}`}
                          type="number"
                          min="1"
                          value={service.durationMinutes}
                          onChange={(e) => handleServiceChange(service.id, "durationMinutes", e.target.value)}
                          placeholder="30"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Shop Images */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Shop Images</h3>
          
          <div className="space-y-2">
            <Label htmlFor="shopImages">
              Front Images of Shop <span className="text-destructive">*</span>
            </Label>
            <p className="text-sm text-muted-foreground">
              Upload up to 5 images of your salon (exterior, interior, workspace)
            </p>
            
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
              <input
                id="shopImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isLoading || shopImages.length >= 5}
              />
              <label htmlFor="shopImages" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload images ({shopImages.length}/5)
                </p>
              </label>
            </div>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Shop ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isLoading}
                      className="absolute top-2 right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <Button 
        onClick={handleSubmit} 
        disabled={isLoading} 
        className="w-full"
        size="lg"
      >
        {isLoading ? "Processing..." : "Continue to Verification"}
      </Button>
    </div>
  );
};
