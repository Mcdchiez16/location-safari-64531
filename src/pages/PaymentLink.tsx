import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Copy, Check, Share2 } from "lucide-react";
import QRCode from "react-qr-code";

interface Profile {
  payment_link_id: string;
}

const PaymentLink = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
      .select("payment_link_id")
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

  const copyPaymentLink = async () => {
    if (!profile) return;
    const paymentUrl = `${window.location.origin}/send?link=${profile.payment_link_id}`;
    
    try {
      await navigator.clipboard.writeText(paymentUrl);
      setCopied(true);
      toast.success("Payment link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error("Failed to copy link");
    }
  };

  const sharePaymentLink = async () => {
    if (!profile) return;
    const paymentUrl = `${window.location.origin}/send?link=${profile.payment_link_id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Tangila Pay Payment Link',
          text: `Send me money using Tangila Pay`,
          url: paymentUrl,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        // User cancelled or share failed
        if (error instanceof Error && error.name !== 'AbortError') {
          console.error('Share failed:', error);
          copyPaymentLink();
        }
      }
    } else {
      // Fallback to copy if share is not supported
      copyPaymentLink();
      toast.info("Link copied! Share API not supported on this device.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/90 to-secondary relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-3xl relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')} 
            className="gap-2 text-primary-foreground hover:bg-white/10 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Stylish Title Section */}
        <div className="text-center mb-12 relative">
          <div className="inline-flex h-20 w-20 rounded-3xl bg-white/10 backdrop-blur-xl items-center justify-center mb-6 shadow-2xl border border-white/20 animate-float">
            <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-3 text-white drop-shadow-lg">
            Get Paid Easily
          </h1>
          <p className="text-white/80 text-base md:text-lg font-medium">
            Share your unique payment link or QR code
          </p>
        </div>

        {/* Main Card with Glass Effect */}
        <Card className="mb-6 shadow-2xl rounded-3xl border-0 overflow-hidden bg-white/95 backdrop-blur-xl">
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col items-center">
              {/* QR Code with Animated Border */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-secondary rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                <div className="relative p-8 bg-white rounded-3xl shadow-2xl">
                  <QRCode 
                    value={`${window.location.origin}/send?link=${profile?.payment_link_id || ''}`} 
                    size={240} 
                  />
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 text-foreground">Scan & Pay</h3>
              <p className="text-center text-sm text-muted-foreground mb-8 max-w-md">
                Anyone can scan this code with their phone camera to send you money instantly through Tangila Pay
              </p>
              
              {/* Modern Action Buttons */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                <Button
                  onClick={copyPaymentLink}
                  variant="outline"
                  className="h-14 rounded-2xl border-2 gap-2 hover:bg-primary/5 hover:border-primary transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      <span className="font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      <span className="font-semibold">Copy Link</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={sharePaymentLink}
                  className="h-14 rounded-2xl gap-2 shadow-xl bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:scale-[1.02] transition-all font-semibold"
                >
                  <Share2 className="h-5 w-5" />
                  Share Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment ID Section */}
        <Card className="shadow-xl rounded-3xl border-0 overflow-hidden bg-white/95 backdrop-blur-xl mb-6">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                <p className="text-sm font-bold text-foreground uppercase tracking-wider">Your Payment ID</p>
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
              </div>
              <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 rounded-2xl p-6 mb-3 border-2 border-primary/20">
                <p className="font-mono text-xl md:text-2xl font-bold text-foreground break-all tracking-wide">
                  {profile?.payment_link_id || 'Loading...'}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                People can also use this ID to send you money manually
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground mb-1">Secure & Safe</p>
                  <p className="text-xs text-muted-foreground">
                    All transactions are encrypted and protected
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-2xl border-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm text-foreground mb-1">Instant Transfer</p>
                  <p className="text-xs text-muted-foreground">
                    Receive money in seconds, anytime
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default PaymentLink;
