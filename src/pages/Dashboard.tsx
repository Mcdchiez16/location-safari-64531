import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { History, Settings as SettingsIcon, Gift } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
  sender_name?: string;
  receiver_name: string;
  receiver_phone: string;
  amount: number;
  currency: string;
  fee: number;
  status: string;
  created_at: string;
  tid?: string;
  rejection_reason?: string;
  profiles?: {
    full_name: string;
    phone_number: string;
  };
  sender_profile?: {
    full_name: string;
    phone_number: string;
  };
}
const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'received' | 'sent'>('received');
  const [userCurrency, setUserCurrency] = useState('');
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        loadProfile(session.user.id);
        loadTransactions(session.user.id);
      }
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  const loadProfile = async (userId: string) => {
    const {
      data,
      error
    } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error) {
      toast.error("Error loading profile");
      console.error(error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };
  const loadTransactions = async (userId: string) => {
    // Get current user's phone and country
    const {
      data: profileData
    } = await supabase.from("profiles").select("phone_number, country").eq("id", userId).maybeSingle();

    // Set user currency based on country
    const currency = profileData?.country === 'Zambia' ? 'ZMW' : 'USD';
    setUserCurrency(currency);

    // Load pending and rejected transactions from last 24 hours (both sent and received)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const {
      data: received,
      error: receivedError
    } = await supabase.from("transactions").select("*").eq("receiver_phone", profileData?.phone_number || '').in("status", ["pending", "rejected"]).gte("created_at", twentyFourHoursAgo).order("created_at", {
      ascending: false
    }).limit(10);
    const {
      data: sent,
      error: sentError
    } = await supabase.from("transactions").select("*").eq("sender_id", userId).in("status", ["pending", "rejected"]).gte("created_at", twentyFourHoursAgo).order("created_at", {
      ascending: false
    }).limit(10);
    if (sentError) console.error("Error loading sent:", sentError);
    if (receivedError) console.error("Error loading received:", receivedError);

    // Combine and deduplicate by transaction ID, then sort by date
    const combinedTransactions = [...(sent || []), ...(received || [])];
    const uniqueTransactions = Array.from(new Map(combinedTransactions.map(tx => [tx.id, tx])).values());
    const allPending = uniqueTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);
    setTransactions(allPending);
    setMode(allPending.length > 0 && allPending[0].sender_id === userId ? 'sent' : 'received');
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "deposited":
        return "text-green-500";
      case "pending":
        return "text-yellow-500";
      case "rejected":
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
      case "rejected":
        return "Rejected";
      case "failed":
        return "Failed";
      default:
        return status;
    }
  };
  const isReceiver = profile?.account_type === 'receiver';
  const handleDownloadStatement = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Ticlapay Transaction Statement', 14, 22);

    // Add date
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Account: ${profile?.full_name || 'User'}`, 14, 38);

    // Prepare table data
    const tableData = transactions.map(tx => {
      const isSender = tx.sender_id === session?.user.id;
      const type = isSender ? 'Sent' : 'Received';
      const name = isSender ? tx.receiver_name : tx.sender_name || 'Unknown';
      const phone = isSender ? tx.receiver_phone : tx.sender_profile?.phone_number || '';
      return [new Date(tx.created_at).toLocaleDateString(), type, name, phone, `${tx.currency} ${tx.amount.toFixed(2)}`, getStatusLabel(tx.status)];
    });

    // Add table
    autoTable(doc, {
      startY: 45,
      head: [['Date', 'Type', 'Name', 'Phone', 'Amount', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [59, 130, 246]
      },
      styles: {
        fontSize: 9
      }
    });

    // Save PDF
    const today = new Date().toISOString().slice(0, 10);
    doc.save(`ticlapay-statement-${today}.pdf`);
    toast.success('Statement downloaded successfully');
  };
  if (loading) {
    return <div className="min-h-screen bg-primary">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-primary-foreground">Loading...</p>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-primary">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-primary-foreground text-base text-left font-bold">Hi, {profile?.full_name?.split(' ')[0] || 'User'}</h1>
            <p className="text-primary-foreground/80 text-sm">Track your payments and transfers</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate("/referrals")} size="icon" className="rounded-full bg-white/20 hover:bg-white/30 text-white border-none shadow-lg">
              <Gift className="h-5 w-5" />
            </Button>
            <Button onClick={() => navigate("/settings")} size="icon" className="rounded-full bg-white/20 hover:bg-white/30 text-white border-none shadow-lg">
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-primary-foreground rounded-3xl p-6 md:p-8 mb-6 shadow-xl">
          {isReceiver && <>
              <p className="text-sm md:text-base text-muted-foreground mb-2">
                Zambian Kwacha Balance
              </p>
              <p className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                {`${profile?.country === 'Zambia' ? 'ZMW' : 'USD'} ${Number(profile?.balance || 0).toFixed(2)}`}
              </p>
            </>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <Button onClick={() => navigate("/send")} className="h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg rounded-2xl shadow-xl bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-bold">
              Send Money
            </Button>
            <Button onClick={() => navigate("/transactions")} className="h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg rounded-2xl shadow-xl bg-gradient-to-r from-secondary to-secondary/80 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-bold">
              Payment History
            </Button>
          </div>
        </div>

        {/* Transactions Card */}
        <div id="transactions-section" className="bg-primary-foreground rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-xl">
          <div className="mb-4 md:mb-6">
            <h2 className="text-base md:text-2xl font-bold text-foreground">
              Recent Transactions
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Pending and rejected transactions
            </p>
          </div>
          
          {transactions.length === 0 ? <div className="text-center py-8 md:py-12">
              <div className="mb-3 md:mb-4 flex justify-center">
                <div className="h-12 w-12 md:h-20 md:w-20 rounded-full bg-muted/30 flex items-center justify-center">
                  <History className="h-6 w-6 md:h-10 md:w-10 text-muted-foreground" />
                </div>
              </div>
              <p className="text-muted-foreground mb-1 text-sm md:text-lg font-medium">
                No recent transactions
              </p>
              <p className="text-muted-foreground mb-4 text-xs md:text-sm">
                Your pending and rejected transactions will appear here
              </p>
            </div> : <div className="space-y-2 md:space-y-3">
              {transactions.map(transaction => {
            const isSender = transaction.sender_id === session?.user.id;
            return <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 md:p-4 border border-border rounded-lg md:rounded-xl hover:bg-muted/30 transition-colors gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm md:text-base text-foreground mb-1.5">
                        {isSender ? `To: ${transaction.receiver_name}` : `From: ${transaction.sender_name || 'Unknown'}`}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)} bg-muted/50`}>
                          {getStatusLabel(transaction.status)}
                        </span>
                        {transaction.tid && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold text-primary bg-primary/10">
                            TID: {transaction.tid}
                          </span>}
                      </div>
                      {transaction.rejection_reason && isSender && <div className="mt-2 p-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-xs font-semibold text-red-800 dark:text-red-400 mb-1">Rejection Reason:</p>
                          <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed">{transaction.rejection_reason}</p>
                        </div>}
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {new Date(transaction.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                      </p>
                    </div>
                    <div className="text-left sm:text-right shrink-0">
                      <p className="font-bold text-base md:text-lg text-foreground">
                        {isSender ? '-' : '+'} {transaction.currency} {transaction.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>;
          })}
            </div>}
        </div>
      </div>
    </div>;
};
export default Dashboard;