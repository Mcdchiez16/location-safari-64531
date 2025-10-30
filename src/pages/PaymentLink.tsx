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
          title: 'TuraPay Payment Link',
          text: `Send me money using TuraPay`,
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 pb-8">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/settings')} className="gap-2 hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-3xl bg-gradient-to-br from-primary to-primary/80 items-center justify-center mb-4 shadow-lg">
            <svg className="h-8 w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Your Payment Link
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Share this with anyone to receive money
          </p>
        </div>

        {/* QR Code Card */}
        <Card className="mb-6 shadow-2xl rounded-3xl border-0 overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="flex flex-col items-center">
              <div className="p-6 bg-white rounded-3xl shadow-xl mb-6">
                <QRCode 
                  value={`${window.location.origin}/send?link=${profile?.payment_link_id || ''}`} 
                  size={220} 
                />
              </div>
              <p className="text-center text-sm text-muted-foreground mb-6 max-w-xs">
                Scan this QR code to instantly send money to your account
              </p>
              
              {/* Action Buttons */}
              <div className="flex gap-3 w-full max-w-sm">
                <Button
                  onClick={copyPaymentLink}
                  variant="outline"
                  className="flex-1 h-12 rounded-full border-2 gap-2 hover:bg-primary/5"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  onClick={sharePaymentLink}
                  className="flex-1 h-12 rounded-full gap-2 shadow-lg"
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment ID Card */}
        <Card className="shadow-xl rounded-3xl border-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-semibold text-muted-foreground mb-3">Your Payment ID</p>
              <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-4 mb-4">
                <p className="font-mono text-lg md:text-xl font-bold text-foreground break-all">
                  {profile?.payment_link_id}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Share this ID for manual entry
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 shadow-lg rounded-2xl border-0 bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-foreground mb-1">How it works</p>
                <p className="text-xs text-muted-foreground">
                  Senders can scan your QR code or enter your Payment ID to send money directly to your TuraPay account
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentLink;
