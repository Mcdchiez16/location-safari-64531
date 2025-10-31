import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, History } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  country: string;
  balance: number;
  verified: boolean;
  account_type: string;
}

interface Transaction {
  id: string;
  receiver_name: string;
  receiver_phone: string;
  amount: number;
  currency: string;
  fee: number;
  status: string;
  created_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        loadProfile(session.user.id);
        loadTransactions(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      toast.error("Error loading profile");
      console.error(error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const loadTransactions = async (userId: string) => {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("sender_id", userId)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error loading transactions:", error);
    } else {
      setTransactions(data || []);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "deposited":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "deposited":
        return "Deposited";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };

  const isReceiver = profile?.account_type === 'receiver';

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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-primary-foreground flex items-center justify-center text-primary font-bold text-lg md:text-xl shadow-lg">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-primary-foreground">
              Hi, {profile?.full_name?.split(' ')[0]}
            </h1>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-primary-foreground rounded-3xl p-6 md:p-8 mb-6 shadow-xl">
          <p className="text-sm md:text-base text-muted-foreground mb-2">
            {isReceiver ? 'Zambian Kwacha Balance' : 'Total'}
          </p>
          <p className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
            {profile?.country === 'Zambia' ? 'ZMW' : 'USD'} {Number(profile?.balance || 0).toFixed(2)}
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <Button 
              onClick={() => navigate("/send")} 
              className="h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg rounded-2xl shadow-xl bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-bold"
            >
              Send Money
            </Button>
            <Button 
              onClick={() => navigate("/payment-link")} 
              className="h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg rounded-2xl shadow-xl bg-gradient-to-r from-secondary to-secondary/80 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-bold"
            >
              Receive Money
            </Button>
          </div>
        </div>

        {/* Transactions Card */}
        <div className="bg-primary-foreground rounded-3xl p-6 md:p-8 shadow-xl">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-foreground">
            {isReceiver ? 'Transaction History' : 'Recent Transactions'}
          </h2>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 flex justify-center">
                <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                  <History className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <p className="text-muted-foreground mb-1 text-base md:text-lg font-medium">
                {isReceiver ? 'When you start using TuraPay,' : 'No transactions yet'}
              </p>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">
                {isReceiver ? 'transactions will show here' : 'Transactions will appear here'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id} 
                  className="flex items-center justify-between p-4 md:p-5 border border-border rounded-2xl hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-medium text-sm md:text-base text-foreground">
                      {transaction.receiver_name}
                    </p>
                    <p className={`text-xs md:text-sm font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusLabel(transaction.status)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      ID: {transaction.id.substring(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm md:text-base text-foreground">
                      {transaction.currency === 'USD' 
                        ? `ZMW ${(transaction.amount * 15.5).toFixed(2)}` 
                        : `${transaction.currency} ${transaction.amount.toFixed(2)}`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
