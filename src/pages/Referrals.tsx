import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Gift, Users, DollarSign } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

interface ReferralTransaction {
  id: string;
  referred_user_id: string;
  reward_amount: number;
  currency: string;
  created_at: string;
  profiles?: {
    full_name: string;
    phone_number: string;
  };
}

const Referrals = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [referralTransactions, setReferralTransactions] = useState<ReferralTransaction[]>([]);
  const [referralPercentage, setReferralPercentage] = useState(5);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    await loadReferralData(session.user.id);
  };

  const loadReferralData = async (userId: string) => {
    try {
      // Load all data in parallel for faster loading
      const [profileResult, countResult, transactionsResult, settingsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("referral_code, referral_earnings")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("referred_by", userId),
        supabase
          .from("referral_transactions")
          .select(`
            id,
            referred_user_id,
            reward_amount,
            currency,
            created_at,
            profiles!referral_transactions_referred_user_id_fkey (
              full_name,
              phone_number
            )
          `)
          .eq("referrer_id", userId)
          .order("created_at", { ascending: false }),
        supabase
          .from("settings")
          .select("value")
          .eq("key", "referral_percentage")
          .maybeSingle()
      ]);

      if (profileResult.data) {
        setReferralCode(profileResult.data.referral_code || "");
        setReferralEarnings(Number(profileResult.data.referral_earnings || 0));
      }

      setReferralCount(countResult.count || 0);
      setReferralTransactions(transactionsResult.data as any || []);

      if (settingsResult.data) {
        setReferralPercentage(Number(settingsResult.data.value));
      }
    } catch (error) {
      console.error("Error loading referral data:", error);
      toast.error("Error loading referral data");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast.success("Referral code copied!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-primary-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl pb-24">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-primary-foreground text-2xl font-bold mb-2">Referral Program</h1>
          <p className="text-primary-foreground/80 text-sm">
            Earn {referralPercentage}% when your friends receive money!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">${referralEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Referrals</p>
                  <p className="text-2xl font-bold">{referralCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Gift className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reward Rate</p>
                  <p className="text-2xl font-bold">{referralPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Card */}
        <Card className="bg-primary-foreground mb-6">
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>Share this code with friends to earn rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1 bg-muted p-4 rounded-lg">
                <p className="text-2xl font-bold text-center tracking-wider">{referralCode}</p>
              </div>
              <Button onClick={copyReferralCode} variant="outline" size="icon" className="h-auto">
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            <Button onClick={copyReferralLink} className="w-full" size="lg">
              <Copy className="mr-2 h-4 w-4" />
              Copy Referral Link
            </Button>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card className="bg-primary-foreground mb-6">
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">Share Your Code</p>
                <p className="text-sm text-muted-foreground">
                  Send your referral code to friends who want to use TuraPay
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">They Sign Up</p>
                <p className="text-sm text-muted-foreground">
                  Your friend creates an account using your referral code
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">Earn Rewards</p>
                <p className="text-sm text-muted-foreground">
                  Get {referralPercentage}% of every transaction they receive!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card className="bg-primary-foreground">
          <CardHeader>
            <CardTitle>Referral Earnings History</CardTitle>
            <CardDescription>Track your referral rewards</CardDescription>
          </CardHeader>
          <CardContent>
            {referralTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No referral earnings yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start sharing your referral code to earn rewards!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referralTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">
                        {transaction.profiles?.full_name || "Unknown User"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +${transaction.reward_amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Referrals;
