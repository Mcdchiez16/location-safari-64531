import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, User, Shield, QrCode, LogOut, Mail, Settings as SettingsIcon, Lock, HelpCircle, CheckCircle, AlertCircle, Phone, Info } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  country: string;
  verified: boolean;
  payment_link_id: string;
  account_type: string;
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

  useEffect(() => {
    loadProfile();
    loadSupportSettings();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone_number, country, verified, payment_link_id, account_type")
      .eq("id", session.user.id)
      .single();

    if (error) {
      toast.error("Error loading profile");
      console.error(error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const loadSupportSettings = async () => {
    const { data, error } = await supabase
      .from("support_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error loading support settings:", error);
    } else if (data) {
      setSupportSettings(data);
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
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
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">TuraPay</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')} 
              className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Account Settings
          </h1>
          <p className="text-gray-600">
            Manage your profile, security, and account preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-lg p-1 mb-6">
            <TabsTrigger 
              value="profile" 
              className="flex gap-2 items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md py-2.5 font-medium transition-all"
            >
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex gap-2 items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md py-2.5 font-medium transition-all"
            >
              <Lock className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger 
              value="support" 
              className="flex gap-2 items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md py-2.5 font-medium transition-all"
            >
              <HelpCircle className="h-4 w-4" /> Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                  <p className="text-sm text-gray-600">Manage your account details and preferences</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="text-base font-semibold text-gray-900">{profile?.full_name}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="text-base font-semibold text-gray-900">{profile?.phone_number}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Country</p>
                      <p className="text-base font-semibold text-gray-900">{profile?.country}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500">Verification Status</p>
                      <div className="flex items-center gap-2">
                        {profile?.verified ? (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-base font-semibold text-green-600">Verified</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-5 w-5 text-orange-500" />
                            <span className="text-base font-semibold text-orange-500">Please Verify</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!profile?.verified && (
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        Your account is not yet verified. Please complete the verification process to access all features.
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <Button 
                      onClick={() => navigate('/verification')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      {profile?.verified ? 'View Verification Details' : 'Complete Verification'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {isReceiver && profile?.verified && (
                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="bg-gray-50 border-b border-gray-200">
                    <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-blue-600" />
                      Payment Settings
                    </CardTitle>
                    <p className="text-sm text-gray-600">Configure your payment links and QR codes</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Button 
                      onClick={() => navigate('/payment-link')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                    >
                      Manage Payment Link & QR Code
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-600" />
                    Account Security
                  </CardTitle>
                  <p className="text-sm text-gray-600">Protect your account with additional security measures</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-semibold text-gray-900 flex items-center gap-2">
                          <Lock className="h-4 w-4 text-gray-600" />
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-sm font-medium text-gray-600">Not enabled</span>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                      Enable Security Features
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="bg-gray-50 border-b border-gray-200">
                  <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <LogOut className="h-5 w-5 text-gray-600" />
                    Sign Out
                  </CardTitle>
                  <p className="text-sm text-gray-600">End your current session securely</p>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-6">
                    You will be logged out of your account and redirected to the login page.
                  </p>
                  <Button 
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
                  >
                    Sign Out of Your Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  Help & Support
                </CardTitle>
                <p className="text-sm text-gray-600">Get assistance and find answers to your questions</p>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Email Support</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Get help via email</p>
                    <p className="font-semibold text-blue-600">{supportSettings?.email || 'support@turapay.com'}</p>
                  </div>
                  
                  <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900">Phone Support</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">Call us for assistance</p>
                    <p className="font-semibold text-gray-900">{supportSettings?.phone || 'Contact via email'}</p>
                  </div>
                </div>
                
                {supportSettings?.additional_info && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Support Hours</h4>
                        <p className="text-sm text-gray-700">{supportSettings.additional_info}</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <Button 
                    onClick={() => toast.info(`Contact support at: ${supportSettings?.email || 'support@turapay.com'}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                  >
                    Contact Customer Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
