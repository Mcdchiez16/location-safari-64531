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
  sender_id: string;
  receiver_name: string;
  receiver_phone: string;
  amount: number;
  currency: string;
  fee: number;
  status: string;
  created_at: string;
  tid?: string;
  profiles?: { full_name: string; phone_number: string };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'received' | 'sent'>('received');
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
    // Get current user's phone
    const { data: profileData } = await supabase
      .from("profiles")
      .select("phone_number")
      .eq("id", userId)
      .maybeSingle();

    // Try to load received transactions first (where user is the receiver)
    const { data: received, error: receivedError } = await supabase
      .from("transactions")
      .select("*, profiles(full_name, phone_number)")
      .eq("receiver_phone", profileData?.phone_number || '')
      .order("created_at", { ascending: false })
      .limit(10);

    if (!receivedError && received && received.length > 0) {
      setTransactions(received);
      setMode('received');
      return;
    }

    // Fallback: load sent transactions (where user is the sender)
    const { data: sent, error: sentError } = await supabase
      .from("transactions")
      .select("*, profiles(full_name, phone_number)")
      .eq("sender_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (sentError) {
      console.error("Error loading transactions:", sentError);
    } else {
      setTransactions(sent || []);
      setMode('sent');
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

  const handleDownloadStatement = () => {
    const headers = ['Date','Type','Name','Phone','Amount','Currency','Status','TID','Transaction ID'];
    const rows = transactions.map((tx) => {
      const isSender = tx.sender_id === session?.user.id;
      const type = isSender ? 'Sent' : 'Received';
      const name = isSender ? tx.receiver_name : (tx.profiles?.full_name || tx.receiver_name);
      const phone = isSender ? tx.receiver_phone : (tx.profiles?.phone_number || tx.receiver_phone);
      return [
        new Date(tx.created_at).toISOString(),
        type,
        name,
        phone,
        tx.amount,
        tx.currency,
        getStatusLabel(tx.status),
        tx.tid || '',
        tx.id
      ].map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().slice(0,10);
    link.setAttribute('download', `statement-${mode}-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Statement download started');
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary-foreground">Received Money</h1>
            <p className="text-primary-foreground/80 text-sm">View money received from senders</p>
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
              onClick={() => {
                if (session?.user?.id) {
                  // Refresh transactions right before showing the section
                  loadTransactions(session.user.id);
                }
                const element = document.getElementById('transactions-section');
                if (element) {
                  // Update URL hash for better accessibility/back navigation
                  history.replaceState(null, '', '#transactions-section');
                  const yOffset = -20;
                  const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                  // Brief highlight to signal movement
                  element.classList.add('ring-2','ring-primary','rounded-2xl');
                  setTimeout(() => element.classList.remove('ring-2','ring-primary'), 1200);
                }
              }} 
              className="h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg rounded-2xl shadow-xl bg-gradient-to-r from-secondary to-secondary/80 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-bold"
            >
              View Transactions
            </Button>
          </div>
        </div>

        {/* Transactions Card */}
        <div id="transactions-section" className="bg-primary-foreground rounded-3xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              {mode === 'received' ? 'Received Transactions' : 'Sent Transactions'}
            </h2>
            <Button
              onClick={handleDownloadStatement}
              className="h-10 md:h-11 rounded-xl bg-gradient-to-r from-secondary to-secondary/80 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-semibold"
            >
              Download Statement
            </Button>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 flex justify-center">
                <div className="h-24 w-24 rounded-full bg-muted/30 flex items-center justify-center">
                  <History className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <p className="text-muted-foreground mb-1 text-base md:text-lg font-medium">
                No received transactions yet
              </p>
              <p className="text-muted-foreground mb-6 text-sm md:text-base">
                Share your payment link to receive money from senders
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => {
                const isSender = transaction.sender_id === session?.user.id;
                return (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-4 md:p-5 border border-border rounded-2xl hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm md:text-base text-foreground">
                        {isSender ? `To: ${transaction.receiver_name}` : `From: ${transaction.receiver_name}`}
                      </p>
                      <p className={`text-xs md:text-sm font-medium ${getStatusColor(transaction.status)}`}>
                        {getStatusLabel(transaction.status)}
                      </p>
                      {transaction.tid && (
                        <p className="text-xs font-semibold text-primary mt-1">
                          TID: {transaction.tid}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        ID: {transaction.id.substring(0, 8)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm md:text-base text-foreground">
                        {isSender ? '-' : '+'} {transaction.currency === 'USD' 
                          ? `ZMW ${(transaction.amount * 15.5).toFixed(2)}` 
                          : `${transaction.currency} ${transaction.amount.toFixed(2)}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
