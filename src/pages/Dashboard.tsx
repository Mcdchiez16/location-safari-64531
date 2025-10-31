import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, History, Download } from "lucide-react";
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
  profiles?: { full_name: string; phone_number: string };
  sender_profile?: { full_name: string; phone_number: string };
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'received' | 'sent'>('received');
  const [totalSent, setTotalSent] = useState(0);
  const [totalReceived, setTotalReceived] = useState(0);
  const [userCurrency, setUserCurrency] = useState('');
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
    // Get current user's phone and country
    const { data: profileData } = await supabase
      .from("profiles")
      .select("phone_number, country")
      .eq("id", userId)
      .maybeSingle();

    // Set user currency based on country
    const currency = profileData?.country === 'Zambia' ? 'ZMW' : 'USD';
    setUserCurrency(currency);

    // Load pending and rejected transactions (both sent and received)
    const { data: received, error: receivedError } = await supabase
      .from("transactions")
      .select("*")
      .eq("receiver_phone", profileData?.phone_number || '')
      .in("status", ["pending", "rejected"])
      .order("created_at", { ascending: false })
      .limit(10);

    const { data: sent, error: sentError } = await supabase
      .from("transactions")
      .select("*")
      .eq("sender_id", userId)
      .in("status", ["pending", "rejected"])
      .order("created_at", { ascending: false })
      .limit(10);

    if (sentError) console.error("Error loading sent:", sentError);
    if (receivedError) console.error("Error loading received:", receivedError);

    // Combine and deduplicate by transaction ID, then sort by date
    const combinedTransactions = [...(sent || []), ...(received || [])];
    const uniqueTransactions = Array.from(
      new Map(combinedTransactions.map(tx => [tx.id, tx])).values()
    );
    const allPending = uniqueTransactions
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);

    setTransactions(allPending);
    setMode(allPending.length > 0 && allPending[0].sender_id === userId ? 'sent' : 'received');

    // Calculate total sent amount in user's currency
    const { data: allSent } = await supabase
      .from("transactions")
      .select("amount, currency")
      .eq("sender_id", userId)
      .in("status", ["paid", "deposited", "completed"]);

    const sentTotal = allSent?.filter(tx => tx.currency === currency).reduce((sum, tx) => sum + tx.amount, 0) || 0;
    setTotalSent(sentTotal);

    // Calculate total received amount in user's currency
    const { data: allReceived } = await supabase
      .from("transactions")
      .select("amount, currency")
      .eq("receiver_phone", profileData?.phone_number || '')
      .in("status", ["paid", "deposited", "completed"]);

    const receivedTotal = allReceived?.filter(tx => tx.currency === currency).reduce((sum, tx) => sum + tx.amount, 0) || 0;
    setTotalReceived(receivedTotal);
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
    doc.text('TuraPay Transaction Statement', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
    doc.text(`Account: ${profile?.full_name || 'User'}`, 14, 38);
    
    // Prepare table data
    const tableData = transactions.map((tx) => {
      const isSender = tx.sender_id === session?.user.id;
      const type = isSender ? 'Sent' : 'Received';
      const name = isSender ? tx.receiver_name : (tx.sender_name || 'Unknown');
      const phone = isSender ? tx.receiver_phone : (tx.sender_profile?.phone_number || '');
      
      return [
        new Date(tx.created_at).toLocaleDateString(),
        type,
        name,
        phone,
        `${tx.currency} ${tx.amount.toFixed(2)}`,
        getStatusLabel(tx.status)
      ];
    });
    
    // Add table
    autoTable(doc, {
      startY: 45,
      head: [['Date', 'Type', 'Name', 'Phone', 'Amount', 'Status']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });
    
    // Save PDF
    const today = new Date().toISOString().slice(0, 10);
    doc.save(`turapay-statement-${today}.pdf`);
    toast.success('Statement downloaded successfully');
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
            <h1 className="text-2xl font-bold text-primary-foreground">Dashboard</h1>
            <p className="text-primary-foreground/80 text-sm">Track your payments and transfers</p>
          </div>
        </div>

        {/* Balance Card */}
        <div className="bg-primary-foreground rounded-3xl p-6 md:p-8 mb-6 shadow-xl">
          {isReceiver && (
            <>
              <p className="text-sm md:text-base text-muted-foreground mb-2">
                Zambian Kwacha Balance
              </p>
              <p className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
                {`${profile?.country === 'Zambia' ? 'ZMW' : 'USD'} ${Number(profile?.balance || 0).toFixed(2)}`}
              </p>
            </>
          )}
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-3 md:p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-500 rounded-lg">
                  <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
                <p className="text-xs md:text-sm font-medium text-blue-900 dark:text-blue-100">Total Sent</p>
              </div>
              <p className="text-lg md:text-2xl font-bold text-blue-900 dark:text-blue-100">
                {userCurrency} {totalSent.toFixed(2)}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-3 md:p-4 rounded-xl border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-green-500 rounded-lg">
                  <ArrowDownRight className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
                <p className="text-xs md:text-sm font-medium text-green-900 dark:text-green-100">Total Received</p>
              </div>
              <p className="text-lg md:text-2xl font-bold text-green-900 dark:text-green-100">
                {userCurrency} {totalReceived.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <Button 
              onClick={() => navigate("/send")} 
              className="h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg rounded-2xl shadow-xl bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-bold"
            >
              Send Money
            </Button>
            <Button 
              onClick={() => navigate("/transactions")} 
              className="h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg rounded-2xl shadow-xl bg-gradient-to-r from-secondary to-secondary/80 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-bold"
            >
              Payment History
            </Button>
          </div>
        </div>

        {/* Transactions Card */}
        <div id="transactions-section" className="bg-primary-foreground rounded-3xl p-4 md:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-foreground">
                Recent Transactions
              </h2>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Pending and rejected transactions
              </p>
            </div>
            <Button
              onClick={handleDownloadStatement}
              className="h-9 md:h-11 text-sm md:text-base rounded-xl bg-gradient-to-r from-secondary to-secondary/80 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-semibold gap-2 w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <div className="mb-4 flex justify-center">
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-muted/30 flex items-center justify-center">
                  <History className="h-8 w-8 md:h-12 md:w-12 text-muted-foreground" />
                </div>
              </div>
              <p className="text-muted-foreground mb-1 text-sm md:text-lg font-medium">
                No recent transactions
              </p>
              <p className="text-muted-foreground mb-4 text-xs md:text-base">
                Your pending and rejected transactions will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {transactions.map((transaction) => {
                const isSender = transaction.sender_id === session?.user.id;
                return (
                  <div 
                    key={transaction.id} 
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-5 border border-border rounded-xl md:rounded-2xl hover:bg-muted/30 transition-colors gap-2 sm:gap-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs md:text-base text-foreground truncate">
                        {isSender ? `To: ${transaction.receiver_name}` : `From: ${transaction.sender_name || 'Unknown'}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className={`text-xs md:text-sm font-medium ${getStatusColor(transaction.status)}`}>
                          {getStatusLabel(transaction.status)}
                        </p>
                        {transaction.tid && (
                          <p className="text-xs font-semibold text-primary">
                            • TID: {transaction.tid}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-sm md:text-base text-foreground">
                        {isSender ? '-' : '+'} {transaction.currency} {transaction.amount.toFixed(2)}
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
