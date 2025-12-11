import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, LogOut, User, Mail, Phone, MapPin, Shield, CheckCircle, AlertCircle } from "lucide-react";
import logo from "@/assets/ticlapay-logo.png";
interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  country: string;
  verified: boolean;
  account_type: string;
  email: string;
}
const Settings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    loadData();
  }, []);
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
      const {
        data,
        error
      } = await supabase.from("profiles").select("id, full_name, phone_number, country, verified, account_type").eq("id", session.user.id).maybeSingle();
      if (error) {
        toast.error("Error loading profile");
        console.error(error);
      } else if (data) {
        setProfile({
          ...data,
          email: session.user.email || ''
        });
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
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Logged out successfully");
      window.location.href = "/auth";
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Error logging out");
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/20" />
          <div className="h-4 w-32 rounded bg-muted" />
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col">
      {/* Header */}
      <header className="bg-card/60 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <img src={logo} alt="TiclaPay Logo" className="h-8 sm:h-12 object-contain transition-transform group-hover:scale-105" />
            </div>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="group relative flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <ArrowLeft className="h-4 w-4 text-primary transition-transform duration-300 group-hover:-translate-x-1" />
              <span className="relative text-sm font-medium text-foreground">Dashboard</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 md:py-12 max-w-lg flex flex-col">
        {/* Profile Avatar Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-4">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/20">
              <User className="h-12 w-12 text-primary-foreground" />
            </div>
            {profile?.verified && <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1.5 shadow-lg">
                <CheckCircle className="h-5 w-5 text-success-foreground" />
              </div>}
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {profile?.full_name}
          </h1>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${profile?.verified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
            {profile?.verified ? <>
                <Shield className="h-3 w-3" />
                Verified Account
              </> : <>
                <AlertCircle className="h-3 w-3" />
                Unverified
              </>}
          </span>
        </div>

        {/* Info Cards */}
        <div className="space-y-3 flex-1">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
              <p className="text-foreground font-semibold truncate">{profile?.email}</p>
            </div>
          </div>

          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Phone className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
              <p className="text-foreground font-semibold">{profile?.phone_number}</p>
            </div>
          </div>

          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Country</p>
              <p className="text-foreground font-semibold">{profile?.country}</p>
            </div>
          </div>

          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Account Type</p>
              <p className="text-foreground font-semibold capitalize">{profile?.account_type || 'Sender'}</p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="mt-10 pt-6 border-t border-border/30">
          <Button onClick={handleLogout} variant="outline" className="w-full h-14 rounded-2xl border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all duration-200 font-semibold text-base gap-3 shadow-sm">
            <LogOut className="h-5 w-5" />
            Sign Out
          </Button>
        </div>
      </main>
    </div>;
};
export default Settings;