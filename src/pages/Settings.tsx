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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Modern Header with Glassmorphism */}
      <header className="backdrop-blur-xl bg-white/70 border-b border-white/20 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">TuraPay</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')} 
              className="gap-2 hover:bg-white/50 backdrop-blur-sm rounded-xl transition-all hover:scale-105"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="mb-12 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl shadow-2xl mb-4 transform hover:rotate-6 transition-transform">
              <SettingsIcon className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Account Settings
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Customize your experience and manage your account with ease
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 backdrop-blur-xl bg-white/80 border-2 border-white/30 rounded-2xl p-2 mb-8 shadow-xl">
            <TabsTrigger 
              value="profile" 
              className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-3 font-semibold transition-all hover:scale-105"
            >
              <User className="h-5 w-5" /> Profile
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-3 font-semibold transition-all hover:scale-105"
            >
              <Lock className="h-5 w-5" /> Security
            </TabsTrigger>
            <TabsTrigger 
              value="support" 
              className="flex gap-2 items-center data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl py-3 font-semibold transition-all hover:scale-105"
            >
              <HelpCircle className="h-5 w-5" /> Support
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="animate-in fade-in-0 duration-500 delay-100 space-y-6">
              <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/30 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <User className="h-6 w-6" />
                      </div>
                      Personal Information
                    </h2>
                    <p className="text-white/90 mt-2">Manage your account details and preferences</p>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                        <User className="h-3 w-3" /> Full Name
                      </p>
                      <p className="text-xl font-bold text-gray-900">{profile?.full_name}</p>
                    </div>
                    
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100">
                      <p className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-2">
                        <Mail className="h-3 w-3" /> Phone Number
                      </p>
                      <p className="text-xl font-bold text-gray-900">{profile?.phone_number}</p>
                    </div>
                    
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
                      <p className="text-xs font-bold text-pink-600 uppercase tracking-wider">Country</p>
                      <p className="text-xl font-bold text-gray-900">{profile?.country}</p>
                    </div>
                    
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
                      <p className="text-xs font-bold text-green-600 uppercase tracking-wider">Verification Status</p>
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${profile?.verified ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'} shadow-lg`} />
                        <p className={`text-xl font-bold ${profile?.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                          {profile?.verified ? 'Verified ✓' : 'Pending'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Button 
                      onClick={() => navigate('/verification')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                      {profile?.verified ? 'View Verification Details' : 'Complete Verification Now'}
                    </Button>
                  </div>
                </div>
              </div>

              {isReceiver && (
                <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/30 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                          <QrCode className="h-6 w-6" />
                        </div>
                        Payment Settings
                      </h2>
                      <p className="text-white/90 mt-2">Configure your payment links and QR codes</p>
                    </div>
                  </div>
                  <div className="p-8">
                    <Button 
                      onClick={() => navigate('/payment-link')}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                      Manage Payment Link & QR Code
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="space-y-6 animate-in fade-in-0 duration-500 delay-100">
              <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/30 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <Shield className="h-6 w-6" />
                      </div>
                      Account Security
                    </h2>
                    <p className="text-white/90 mt-2">Protect your account with advanced security measures</p>
                  </div>
                </div>
                <div className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 transform hover:scale-105 transition-all">
                      <div>
                        <p className="font-bold text-gray-900 text-lg flex items-center gap-2">
                          <Lock className="h-5 w-5 text-purple-600" />
                          Two-Factor Authentication
                        </p>
                        <p className="text-sm text-gray-600 mt-2">Add an extra layer of security to your account</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 rounded-full">
                          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                          <span className="text-sm font-bold text-red-600">Not enabled</span>
                        </div>
                      </div>
                    </div>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                      Enable Security Features
                    </Button>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border-2 border-red-200 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                <div className="bg-gradient-to-r from-red-500 to-rose-600 px-8 py-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <LogOut className="h-6 w-6" />
                      </div>
                      Sign Out
                    </h2>
                    <p className="text-white/90 mt-2">End your current session securely</p>
                  </div>
                </div>
                <div className="p-8">
                  <p className="text-gray-600 mb-6 text-center">
                    You will be logged out of your account and redirected to the login page.
                  </p>
                  <Button 
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                  >
                    Sign Out of Your Account
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="support">
            <div className="animate-in fade-in-0 duration-500 delay-100">
              <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-2xl border-2 border-white/30 overflow-hidden transform hover:scale-[1.02] transition-all duration-300">
                <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-8 py-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                        <HelpCircle className="h-6 w-6" />
                      </div>
                      Help & Support
                    </h2>
                    <p className="text-white/90 mt-2">Get assistance and find answers to your questions</p>
                  </div>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border-2 border-pink-200 transform hover:scale-105 transition-all hover:shadow-xl">
                      <div className="p-3 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl w-fit mb-4">
                        <Mail className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">Email Support</h3>
                      <p className="text-sm text-gray-600 mb-3">Get help via email</p>
                      <p className="font-bold text-pink-600 text-lg">support@turapay.com</p>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 transform hover:scale-105 transition-all hover:shadow-xl">
                      <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl w-fit mb-4">
                        <HelpCircle className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 text-lg">Help Center</h3>
                      <p className="text-sm text-gray-600 mb-3">Browse our knowledge base</p>
                      <p className="font-bold text-purple-600 text-lg">Coming Soon</p>
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-200">
                    <Button 
                      onClick={() => toast.info("Contact support at: support@turapay.com")}
                      className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
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
