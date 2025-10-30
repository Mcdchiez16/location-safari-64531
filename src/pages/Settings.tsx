import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, User, Shield, QrCode, LogOut, Mail, Settings as SettingsIcon, Lock, HelpCircle } from "lucide-react";
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

const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
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
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">TuraPay</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')} 
              className="gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-blue-600" />
            Account Settings
          </h1>
          <p className="text-lg text-gray-600">
            Manage your profile, security, and account preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white border border-gray-200 rounded-xl p-1 mb-8">
            <TabsTrigger 
              value="profile" 
              className="flex gap-2 items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg py-3 font-medium transition-all"
            >
              <User className="h-4 w-4" /> Profile
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex gap-2 items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg py-3 font-medium transition-all"
            >
              <Lock className="h-4 w-4" /> Security
            </TabsTrigger>
            <TabsTrigger 
              value="support" 
              className="flex gap-2 items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg py-3 font-medium transition-all"
            >
              <HelpCircle className="h-4 w-4" /> Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="animate-in fade-in-0 duration-300 delay-100 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 px-8 py-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <User className="h-6 w-6" />
                    Personal Information
                  </h2>
                  <p className="text-blue-100 mt-1">Manage your account details and preferences</p>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</p>
                      <p className="text-lg font-semibold text-gray-900">{profile?.full_name}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-900">{profile?.phone_number}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Country</p>
                      <p className="text-lg font-semibold text-gray-900">{profile?.country}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Verification Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${profile?.verified ? 'bg-green-500' : 'bg-yellow-500'}`} />
                        <p className={`text-lg font-semibold ${profile?.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                          {profile?.verified ? 'Verified' : 'Pending Verification'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <Button 
                      onClick={() => navigate('/verification')}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
                    >
                      {profile?.verified ? 'View Details' : 'Complete Verification'}
                    </Button>
                  </div>
                </div>
              </div>

              {isReceiver && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-blue-600 px-8 py-6">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                      <QrCode className="h-6 w-6" />
                      Payment Settings
                    </h2>
                    <p className="text-blue-100 mt-1">Configure your payment links and QR codes</p>
                  </div>
                  <div className="p-8">
                    <Button 
                      onClick={() => navigate('/payment-link')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                    >
                      Manage Payment Link & QR Code
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6 animate-in fade-in-0 duration-300 delay-100">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 px-8 py-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <Shield className="h-6 w-6" />
                    Account Security
                  </h2>
                  <p className="text-blue-100 mt-1">Protect your account with additional security measures</p>
                </div>
                <div className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border border-blue-100">
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-600 mt-1">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm font-medium text-red-600">Not enabled</span>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                      Enable Security Features
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-8 py-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                    <LogOut className="h-6 w-6 text-gray-700" />
                    Sign Out
                  </h2>
                  <p className="text-gray-600 mt-1">End your current session securely</p>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 mb-6">
                    You will be logged out of your account and redirected to the login page.
                  </p>
                  <Button 
                    onClick={handleLogout}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-medium"
                  >
                    Sign Out of Your Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <div className="animate-in fade-in-0 duration-300 delay-100">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 px-8 py-6">
                  <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                    <HelpCircle className="h-6 w-6" />
                    Help & Support
                  </h2>
                  <p className="text-blue-100 mt-1">Get assistance and find answers to your questions</p>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                      <Mail className="h-8 w-8 text-blue-600 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Email Support</h3>
                      <p className="text-sm text-gray-600 mb-3">Get help via email</p>
                      <p className="font-medium text-blue-600">support@turapay.com</p>
                    </div>
                    
                    <div className="p-6 bg-blue-50 rounded-xl border border-blue-100">
                      <HelpCircle className="h-8 w-8 text-blue-600 mb-4" />
                      <h3 className="font-semibold text-gray-900 mb-2">Help Center</h3>
                      <p className="text-sm text-gray-600 mb-3">Browse our knowledge base</p>
                      <p className="font-medium text-blue-600">Coming Soon</p>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-100">
                    <Button 
                      onClick={() => toast.info("Contact support at: support@turapay.com")}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium"
                    >
                      Contact Customer Support
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
