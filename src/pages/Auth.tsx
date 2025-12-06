import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Lock, Mail, User as UserIcon, Phone, Globe, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { z } from "zod";
import logo from "@/assets/ticlapay-logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showKycUpload, setShowKycUpload] = useState(false);
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [uploadingKyc, setUploadingKyc] = useState(false);

  // Country code mapping
  const countryCodeMap: { [key: string]: string } = {
    "Zambia": "+260",
    "Zimbabwe": "+263"
  };

  // Handle country change and auto-populate country code
  const handleCountryChange = (value: string) => {
    setCountry(value);
    const countryCode = countryCodeMap[value];
    if (countryCode) {
      setPhoneNumber(countryCode);
    }
  };

  // Handle phone number change with validation
  const handlePhoneNumberChange = (value: string) => {
    // Only allow numbers and + symbol
    const cleaned = value.replace(/[^\d+]/g, '');
    setPhoneNumber(cleaned);
  };

  useEffect(() => {
    // Check for referral code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get("ref");
    if (refCode) {
      setReferralCode(refCode);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !phoneNumber || !country) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    // Set account type based on country
    const accountType = country === "Zimbabwe" ? "sender" : country === "Zambia" ? "receiver" : "both";

    const cleanedRef = referralCode.trim().toLowerCase();

    // Validate referral code format (actual linking handled in backend)
    if (cleanedRef) {
      const refSchema = z.string().trim().regex(/^[a-z0-9]+$/i).min(4).max(32);
      if (!refSchema.safeParse(cleanedRef).success) {
        toast.error("Invalid referral code format");
        setLoading(false);
        return;
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          country: country,
          account_type: accountType,
          referred_by: cleanedRef || null
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    // The handle_new_user trigger will handle the referral relationship
    // No need to manually update profile here - trigger does it
    toast.success(referralCode ? "Account created with referral! You're all set." : "Account created! Please check your email to verify.");

    // Show KYC upload option instead of navigating immediately
    if (data.user) {
      setNewUserId(data.user.id);
      setShowKycUpload(true);
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleKycUpload = async () => {
    if (!newUserId) return;

    if (!idType || !idNumber || !idDocument || !selfie) {
      toast.error("Please fill in all KYC fields and upload required documents");
      return;
    }

    setUploadingKyc(true);

    try {
      // Upload ID document
      const idDocExt = idDocument.name.split('.').pop();
      const idDocPath = `${newUserId}/id_document.${idDocExt}`;
      const { error: idDocError } = await supabase.storage
        .from('kyc-docs')
        .upload(idDocPath, idDocument, { upsert: true });

      if (idDocError) throw idDocError;

      // Upload selfie
      const selfieExt = selfie.name.split('.').pop();
      const selfiePath = `${newUserId}/selfie.${selfieExt}`;
      const { error: selfieError } = await supabase.storage
        .from('kyc-docs')
        .upload(selfiePath, selfie, { upsert: true });

      if (selfieError) throw selfieError;

      // Get public URLs
      const { data: { publicUrl: idDocUrl } } = supabase.storage
        .from('kyc-docs')
        .getPublicUrl(idDocPath);

      const { data: { publicUrl: selfieUrl } } = supabase.storage
        .from('kyc-docs')
        .getPublicUrl(selfiePath);

      // Update profile with KYC info
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          id_type: idType,
          id_number: idNumber,
          id_document_url: idDocUrl,
          selfie_url: selfieUrl,
        })
        .eq('id', newUserId);

      if (updateError) throw updateError;

      toast.success("KYC documents uploaded successfully! Our team will review them shortly.");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload KYC documents");
    } finally {
      setUploadingKyc(false);
    }
  };

  const handleSkipKyc = () => {
    navigate("/dashboard");
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent! Check your email.");
      setShowForgotPassword(false);
    }
    setLoading(false);
  };

  return (
    <>
      <Dialog open={showKycUpload} onOpenChange={setShowKycUpload}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Your Profile</DialogTitle>
            <DialogDescription>
              Upload your KYC documents now to get verified faster, or skip and do it later from your dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="kyc-id-type">ID Type</Label>
              <Select value={idType} onValueChange={setIdType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ID type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="passport">Passport</SelectItem>
                  <SelectItem value="national_id">National ID</SelectItem>
                  <SelectItem value="drivers_license">Driver's License</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kyc-id-number">ID Number</Label>
              <Input
                id="kyc-id-number"
                type="text"
                placeholder="Enter your ID number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kyc-id-document">ID Document</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="kyc-id-document"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setIdDocument(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {idDocument && (
                  <span className="text-sm text-muted-foreground">{idDocument.name}</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kyc-selfie">Selfie with ID</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="kyc-selfie"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelfie(e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {selfie && (
                  <span className="text-sm text-muted-foreground">{selfie.name}</span>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleKycUpload}
                disabled={uploadingKyc}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                {uploadingKyc ? "Uploading..." : "Upload KYC"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSkipKyc}
                disabled={uploadingKyc}
                className="flex-1"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-2 sm:p-4 md:p-6">
        {/* Animated Background - Hidden on mobile for better performance */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          {/* Floating Orbs - Adjusted for mobile */}
          <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 bg-primary/10 rounded-full blur-3xl animate-[float_20s_ease-in-out_infinite]" />
          <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-accent/10 rounded-full blur-3xl animate-[float_25s_ease-in-out_infinite_reverse]" />
          <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl animate-[float_30s_ease-in-out_infinite]" />
          
          {/* Decorative Elements - Hidden on mobile */}
          <div className="hidden sm:block absolute top-10 right-20 w-2 h-2 bg-primary rounded-full animate-pulse" />
          <div className="hidden sm:block absolute bottom-40 left-32 w-1.5 h-1.5 bg-accent rounded-full animate-pulse delay-300" />
          <div className="hidden sm:block absolute top-1/3 right-1/4 w-2.5 h-2.5 bg-secondary rounded-full animate-pulse delay-700" />
        </div>

        {/* Main Card with Glass Effect */}
        <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-card/80 border-2 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 mx-auto">
          <CardHeader className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 px-4 sm:px-6 pt-6 sm:pt-8">
            <Link 
              to="/" 
              className="flex items-center justify-center group transition-all duration-300"
            >
              <img src={logo} alt="TiclaPay Logo" className="h-10 sm:h-12 md:h-14 object-contain group-hover:scale-105 transition-transform duration-300" />
            </Link>
            
            <div className="space-y-1.5 sm:space-y-2">
              <CardTitle className="text-2xl sm:text-3xl text-center font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                {showForgotPassword ? "Reset Password" : isLogin ? "Welcome back" : "Create account"}
              </CardTitle>
              <CardDescription className="text-center text-sm sm:text-base px-2">
                {showForgotPassword
                  ? "Enter your email to receive a password reset link"
                  : isLogin
                  ? "Sign in to your account to continue"
                  : "Sign up to start sending money across borders"}
              </CardDescription>
            </div>
            
            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="text-[10px] sm:text-xs">Secured with 256-bit encryption</span>
            </div>
          </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pb-6 sm:pb-8">
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4 sm:space-y-5">
              <div className="space-y-2 group">
                <Label htmlFor="reset-email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10 h-11 sm:h-12 transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 text-sm sm:text-base"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" 
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full h-10 sm:h-11 text-sm sm:text-base"
                onClick={() => {
                  setShowForgotPassword(false);
                  setEmail("");
                }}
              >
                Back to Sign In
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4 sm:space-y-5">
                {!isLogin && (
                  <>
                    <div className="space-y-2 group">
                      <Label htmlFor="fullName" className="text-sm font-medium flex items-center gap-2">
                        <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                        Full Name
                      </Label>
                      <div className="relative">
                        <Input
                          id="fullName"
                          type="text"
                          placeholder="John Doe"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="pl-10 h-11 sm:h-12 transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 text-sm sm:text-base"
                        />
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    
                    <div className="space-y-2 group">
                      <Label htmlFor="country" className="text-sm font-medium flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                        Country
                      </Label>
                      <Select value={country} onValueChange={handleCountryChange} required>
                        <SelectTrigger className="h-11 sm:h-12 transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 text-sm sm:text-base">
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Zambia">Zambia</SelectItem>
                          <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2 group">
                      <Label htmlFor="phoneNumber" className="text-sm font-medium flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder={country ? `${countryCodeMap[country]}123456789` : "Select country first"}
                          value={phoneNumber}
                          onChange={(e) => handlePhoneNumberChange(e.target.value)}
                          required
                          maxLength={13}
                          className="pl-10 h-11 sm:h-12 transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 text-sm sm:text-base"
                        />
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      </div>
                      {phoneNumber && country && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground pl-10">
                          {phoneNumber.replace(countryCodeMap[country], '').length}/9 digits
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2 group">
                      <Label htmlFor="referralCode" className="text-sm font-medium">
                        Referral Code <span className="text-muted-foreground text-xs">(Optional)</span>
                      </Label>
                      <Input
                        id="referralCode"
                        type="text"
                        placeholder="e.g. abcd1234"
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.trim())}
                        maxLength={32}
                        className="h-11 sm:h-12 transition-all duration-300 focus:shadow-lg focus:shadow-accent/20 text-sm sm:text-base"
                      />
                    </div>
                  </>
                )}
                
                <div className="space-y-2 group">
                  <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                    Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-11 sm:h-12 transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 text-sm sm:text-base"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2 group">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
                      Password
                    </Label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-[10px] sm:text-xs text-primary hover:text-accent transition-colors duration-200 font-medium"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-10 h-11 sm:h-12 transition-all duration-300 focus:shadow-lg focus:shadow-primary/20 text-sm sm:text-base"
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin" />
                      <span className="text-sm sm:text-base">Please wait...</span>
                    </span>
                  ) : (
                    isLogin ? "Sign In" : "Sign Up"
                  )}
                </Button>
              </form>

              <div className="mt-4 sm:mt-6 text-center">
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/50"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-card px-3 py-1 text-muted-foreground text-[10px] sm:text-xs rounded-full">
                      {isLogin ? "New to Ticlapay?" : "Already have an account?"}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setEmail("");
                    setPassword("");
                    setFullName("");
                    setPhoneNumber("");
                    setCountry("");
                    setReferralCode("");
                  }}
                  className="w-full h-10 sm:h-11 text-sm sm:text-base font-semibold border-2 hover:bg-primary/5 transition-all duration-300"
                >
                  {isLogin ? "Create an account" : "Sign in instead"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
    </>
  );
};

export default Auth;
