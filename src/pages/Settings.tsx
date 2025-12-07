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
  return <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-lg bg-white/95">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3 cursor-pointer" onClick={() => navigate('/')}>
              <img src={logo} alt="TiclaPay Logo" className="h-7 sm:h-12 md:h-14 object-contain" />
            </div>
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="gap-1 md:gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-xs md:text-sm px-2 md:px-4 rounded-lg transition-all">
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-5xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="text-sm md:text-base text-gray-600">
            Manage your profile, security, and account preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-xl p-1.5 mb-6 shadow-sm">
            <TabsTrigger value="profile" className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg py-2.5 md:py-3 font-medium transition-all text-xs md:text-sm">
              <User className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg py-2.5 md:py-3 font-medium transition-all text-xs md:text-sm">
              <Lock className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg py-2.5 md:py-3 font-medium transition-all text-xs md:text-sm">
              <HelpCircle className="h-3 w-3 md:h-4 md:w-4" /> <span className="hidden sm:inline">Support</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-4 md:space-y-6">
              <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">Manage your account details and preferences</p>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-2 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">{profile?.full_name}</p>
                    </div>
                    
                    <div className="space-y-2 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">{profile?.email}</p>
                    </div>
                    
                    <div className="space-y-2 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone Number</p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">{profile?.phone_number}</p>
                    </div>
                    
                    <div className="space-y-2 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Country</p>
                      <p className="text-sm md:text-base font-semibold text-gray-900">{profile?.country}</p>
                    </div>
                    
                    <div className="space-y-2 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Verification Status</p>
                      <div className="flex items-center gap-2">
                        {profile?.verified ? <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm md:text-base font-semibold text-green-600">Verified</span>
                          </> : <>
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            <span className="text-sm md:text-base font-semibold text-orange-500">Please Verify</span>
                          </>}
                      </div>
                    </div>
                  </div>
                  
                  {!profile?.verified && <>
                      <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-orange-800">
                          Your account is not yet verified. Please complete the verification process to access all features.
                        </p>
                      </div>
                      
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <Button onClick={() => navigate('/verification')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                          Complete Verification
                        </Button>
                      </div>
                    </>}
                  
                  {profile?.verified && <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <p className="text-sm font-medium text-green-800">
                          Your account is fully verified and ready to use all features.
                        </p>
                      </div>
                    </div>}
                </CardContent>
              </Card>

              {isReceiver && profile?.verified && <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-blue-600" />
                      Payment Settings
                    </CardTitle>
                    <p className="text-xs md:text-sm text-gray-600">Configure your payment links and QR codes</p>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6">
                    <Button onClick={() => navigate('/payment-link')} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all">
                      Manage Payment Link & QR Code
                    </Button>
                  </CardContent>
                </Card>}
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-4 md:space-y-6">
              <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Account Security
                  </CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">Protect your account with additional security measures</p>
                </CardHeader>
                
              </Card>

              <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-red-50 to-white border-b border-red-200 p-4 md:p-6">
                  <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-red-600" />
                    Sign Out
                  </CardTitle>
                  <p className="text-xs md:text-sm text-gray-600">End your current session securely</p>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                  <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
                    You will be logged out of your account and redirected to the login page.
                  </p>
                  <Button onClick={handleLogout} className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all">
                    Sign Out of Your Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <Card className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow rounded-xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-200 p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  Help & Support
                </CardTitle>
                <p className="text-xs md:text-sm text-gray-600">Get assistance and find answers to your questions</p>
              </CardHeader>
              <CardContent className="p-4 md:p-6 space-y-4 md:space-y-6">
                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                  <div className="p-4 md:p-5 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm">
                        <Mail className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm md:text-base text-gray-900">Email Support</h3>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">Get help via email</p>
                    <p className="font-semibold text-sm md:text-base text-blue-600 break-all">{supportSettings?.email || 'support@turapay.com'}</p>
                  </div>
                  
                  <div className="p-4 md:p-5 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-200 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-gradient-to-br from-green-600 to-green-700 rounded-lg shadow-sm">
                        <Phone className="h-4 w-4 md:h-5 md:w-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-sm md:text-base text-gray-900">Phone Support</h3>
                    </div>
                    <p className="text-xs md:text-sm text-gray-600 mb-2">Call us for assistance</p>
                    <p className="font-semibold text-sm md:text-base text-gray-900">{supportSettings?.phone || 'Contact via email'}</p>
                  </div>
                </div>
                
                {supportSettings?.additional_info && <div className="p-4 bg-gradient-to-r from-blue-50 to-white border border-blue-200 rounded-xl shadow-sm">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm md:text-base text-gray-900 mb-1">Support Hours</h4>
                        <p className="text-xs md:text-sm text-gray-700">{supportSettings.additional_info}</p>
                      </div>
                    </div>
                  </div>}
                
                <div className="pt-4 border-t border-gray-200">
                  <Button onClick={() => toast.info(`Contact support at: ${supportSettings?.email || 'support@turapay.com'}`)} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-all">
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