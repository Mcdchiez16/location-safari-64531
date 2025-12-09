import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, User, Shield, QrCode, LogOut, Mail, Settings as SettingsIcon, Lock, HelpCircle, CheckCircle, AlertCircle, Phone, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import logo from "@/assets/ticlapay-logo.png";
import QRCode from "react-qr-code";
interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  country: string;
  verified: boolean;
  payment_link_id: string;
  account_type: string;
  email: string;
}
interface SupportSettings {
  email: string;
  phone: string;
  additional_info: string;
}
const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [supportSettings, setSupportSettings] = useState<SupportSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showMfaDialog, setShowMfaDialog] = useState(false);
  const [mfaQrCode, setMfaQrCode] = useState("");
  const [mfaSecret, setMfaSecret] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  useEffect(() => {
    loadData();
    checkMfaStatus();
  }, []);
  const checkMfaStatus = async () => {
    try {
      const {
        data,
        error
      } = await supabase.auth.mfa.listFactors();
      if (!error && data) {
        const hasVerifiedFactor = data.totp.some(factor => factor.status === 'verified');
        setMfaEnabled(hasVerifiedFactor);
      }
    } catch (error) {
      console.error("Error checking MFA status:", error);
    }
  };
  const handleEnableMfa = async () => {
    try {
      const {
        data,
        error
      } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'TuraPay 2FA'
      });
      if (error) {
        toast.error("Failed to enable 2FA: " + error.message);
        return;
      }
      if (data) {
        setMfaQrCode(data.totp.qr_code);
        setMfaSecret(data.totp.secret);
        setShowMfaDialog(true);
      }
    } catch (error) {
      console.error("Error enabling MFA:", error);
      toast.error("Failed to enable 2FA");
    }
  };
  const handleVerifyMfa = async () => {
    if (!verifyCode || verifyCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error || !factors.data) {
        toast.error("Failed to verify 2FA");
        return;
      }
      const factor = factors.data.totp[0];
      if (!factor) {
        toast.error("No factor found");
        return;
      }
      const {
        error
      } = await supabase.auth.mfa.challengeAndVerify({
        factorId: factor.id,
        code: verifyCode
      });
      if (error) {
        toast.error("Invalid code. Please try again.");
        return;
      }
      toast.success("Two-Factor Authentication enabled successfully!");
      setShowMfaDialog(false);
      setVerifyCode("");
      setMfaEnabled(true);
    } catch (error) {
      console.error("Error verifying MFA:", error);
      toast.error("Failed to verify 2FA");
    }
  };
  const handleDisableMfa = async () => {
    try {
      const {
        data: factors
      } = await supabase.auth.mfa.listFactors();
      if (!factors || factors.totp.length === 0) return;
      const factor = factors.totp[0];
      const {
        error
      } = await supabase.auth.mfa.unenroll({
        factorId: factor.id
      });
      if (error) {
        toast.error("Failed to disable 2FA: " + error.message);
        return;
      }
      toast.success("Two-Factor Authentication disabled");
      setMfaEnabled(false);
    } catch (error) {
      console.error("Error disabling MFA:", error);
      toast.error("Failed to disable 2FA");
    }
  };
  const loadData = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    try {
      // Load both profile and support settings in parallel
      const [profileResult, supportResult] = await Promise.all([supabase.from("profiles").select("id, full_name, phone_number, country, verified, payment_link_id, account_type").eq("id", session.user.id).maybeSingle(), supabase.from("support_settings").select("*").limit(1).maybeSingle()]);
      if (profileResult.error) {
        toast.error("Error loading profile");
        console.error(profileResult.error);
      } else if (profileResult.data) {
        setProfile({
          ...profileResult.data,
          email: session.user.email || ''
        });
      }
      if (supportResult.data) {
        setSupportSettings(supportResult.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Error loading settings");
    } finally {
      setLoading(false);
    }
  };
  const handleLogout = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error("Error logging out");
        return;
      }

      // Clear any local storage or session storage if needed
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Logged out successfully");

      // Force navigation to auth page
      window.location.href = "/auth";
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Error logging out");
    }
  };
  const isReceiver = profile?.account_type === 'receiver';
  if (loading) {
    return <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-b from-muted/30 via-background to-muted/20">
      {/* Professional Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 md:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <div className="relative">
                <img src={logo} alt="TiclaPay Logo" className="h-8 sm:h-12 md:h-14 object-contain transition-transform group-hover:scale-105" />
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2 border-border/50 hover:bg-muted/50 hover:border-primary/30 text-foreground/80 hover:text-foreground text-sm px-4 py-2 rounded-xl transition-all duration-200">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8 md:mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <SettingsIcon className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Settings
            </h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground ml-0 md:ml-14">
            Manage your profile, security, and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card border border-border/50 rounded-2xl p-1.5 mb-8 shadow-sm h-auto">
            <TabsTrigger value="profile" className="flex gap-2 items-center justify-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-xl py-3 md:py-3.5 font-medium transition-all duration-200 text-sm">
              <User className="h-4 w-4" /> 
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex gap-2 items-center justify-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-xl py-3 md:py-3.5 font-medium transition-all duration-200 text-sm">
              <Lock className="h-4 w-4" /> 
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex gap-2 items-center justify-center data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-xl py-3 md:py-3.5 font-medium transition-all duration-200 text-sm">
              <HelpCircle className="h-4 w-4" /> 
              <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="animate-fade-in">
            <div className="space-y-6">
              {/* Personal Information Card */}
              <Card className="border border-border/50 shadow-lg rounded-2xl overflow-hidden bg-card">
                <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/30 p-5 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">Personal Information</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">Your account details</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="group p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/30 transition-all duration-200">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Full Name</p>
                      <p className="text-base font-semibold text-foreground">{profile?.full_name}</p>
                    </div>
                    
                    <div className="group p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/30 transition-all duration-200">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Email</p>
                      <p className="text-base font-semibold text-foreground truncate">{profile?.email}</p>
                    </div>
                    
                    <div className="group p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/30 transition-all duration-200">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Phone Number</p>
                      <p className="text-base font-semibold text-foreground">{profile?.phone_number}</p>
                    </div>
                    
                    <div className="group p-4 bg-muted/30 hover:bg-muted/50 rounded-xl border border-border/30 transition-all duration-200">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Country</p>
                      <p className="text-base font-semibold text-foreground">{profile?.country}</p>
                    </div>
                  </div>
                  
                  {/* Verification Status */}
                  <div className="mt-5 pt-5 border-t border-border/30">
                    <div className={`flex items-center gap-3 p-4 rounded-xl ${profile?.verified ? 'bg-success/10 border border-success/20' : 'bg-warning/10 border border-warning/20'}`}>
                      {profile?.verified ? <>
                          <div className="p-2 bg-success/20 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-success" />
                          </div>
                          <div>
                            <p className="font-semibold text-success">Account Verified</p>
                            <p className="text-sm text-success/80">You have full access to all features</p>
                          </div>
                        </> : <>
                          <div className="p-2 bg-warning/20 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-warning" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-warning">Verification Required</p>
                            <p className="text-sm text-warning/80">Complete verification to unlock all features</p>
                          </div>
                          <Button onClick={() => navigate('/verification')} size="sm" className="bg-warning hover:bg-warning/90 text-warning-foreground rounded-lg font-medium shadow-sm">
                            Verify Now
                          </Button>
                        </>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Settings Card - Only for verified receivers */}
              {isReceiver && profile?.verified && <Card className="border border-border/50 shadow-lg rounded-2xl overflow-hidden bg-card">
                  <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/30 p-5 md:p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-xl">
                        <QrCode className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold text-foreground">Payment Settings</CardTitle>
                        <p className="text-sm text-muted-foreground mt-0.5">Manage your payment links and QR codes</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 md:p-6">
                    <Button onClick={() => navigate('/payment-link')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200">
                      <QrCode className="h-4 w-4 mr-2" />
                      Manage Payment Link & QR Code
                    </Button>
                  </CardContent>
                </Card>}
            </div>
          </TabsContent>

          <TabsContent value="security" className="animate-fade-in">
            <div className="space-y-6">
              {/* Security Overview Card */}
              <Card className="border border-border/50 shadow-lg rounded-2xl overflow-hidden bg-card">
                <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/30 p-5 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-xl">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">Account Security</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">Protect your account with security measures</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 md:p-6">
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-success/10 rounded-lg">
                        <Lock className="h-4 w-4 text-success" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Password Protected</p>
                        <p className="text-sm text-muted-foreground">Your account is secured with a password</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sign Out Card */}
              <Card className="border border-destructive/20 shadow-lg rounded-2xl overflow-hidden bg-card">
                <CardHeader className="bg-gradient-to-r from-destructive/5 to-transparent border-b border-destructive/10 p-5 md:p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-destructive/10 rounded-xl">
                      <LogOut className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-foreground">Sign Out</CardTitle>
                      <p className="text-sm text-muted-foreground mt-0.5">End your current session</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 md:p-6">
                  <p className="text-sm text-muted-foreground mb-5">
                    You will be logged out and redirected to the login page. Make sure to save any unsaved changes.
                  </p>
                  <Button onClick={handleLogout} variant="destructive" className="w-full py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out of Your Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="support" className="animate-fade-in">
            <Card className="border border-border/50 shadow-lg rounded-2xl overflow-hidden bg-card">
              <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent border-b border-border/30 p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <HelpCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">Help & Support</CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">Get assistance when you need it</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 md:p-6 space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Email Support */}
                  <div className="group p-5 bg-primary/5 hover:bg-primary/10 rounded-xl border border-primary/10 hover:border-primary/20 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-primary rounded-xl shadow-sm">
                        <Mail className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">Email Support</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Get help via email</p>
                    <p className="font-medium text-primary break-all">{supportSettings?.email || 'support@ticlapay.com'}</p>
                  </div>
                  
                  {/* Phone Support */}
                  <div className="group p-5 bg-success/5 hover:bg-success/10 rounded-xl border border-success/10 hover:border-success/20 transition-all duration-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-success rounded-xl shadow-sm">
                        <Phone className="h-4 w-4 text-success-foreground" />
                      </div>
                      <h3 className="font-semibold text-foreground">Phone Support</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">Call us for assistance</p>
                    <p className="font-medium text-foreground">{supportSettings?.phone || 'Contact via email'}</p>
                  </div>
                </div>
                
                {/* Support Hours */}
                {supportSettings?.additional_info && <div className="p-4 bg-muted/40 border border-border/30 rounded-xl">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg mt-0.5">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground mb-1">Support Hours</h4>
                        <p className="text-sm text-muted-foreground">{supportSettings.additional_info}</p>
                      </div>
                    </div>
                  </div>}
                
                {/* Contact Button */}
                <div className="pt-4 border-t border-border/30">
                  <Button onClick={() => toast.info(`Contact support at: ${supportSettings?.email || 'support@ticlapay.com'}`)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200">
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Customer Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showMfaDialog} onOpenChange={setShowMfaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (like Google Authenticator or Authy)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg border">
              {mfaQrCode && <QRCode value={mfaQrCode} size={200} />}
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Or enter this code manually:</p>
              <code className="block p-2 bg-gray-100 rounded text-sm break-all">{mfaSecret}</code>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Enter the 6-digit code from your app:</label>
              <Input type="text" placeholder="000000" value={verifyCode} onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} className="text-center text-lg tracking-widest" />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
              setShowMfaDialog(false);
              setVerifyCode("");
            }} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleVerifyMfa} disabled={verifyCode.length !== 6} className="flex-1 bg-blue-600 hover:bg-blue-700">
                Verify & Enable
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
};
export default Settings;