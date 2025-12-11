import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Search, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle2, XCircle, AlertCircle, FileText } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "@/assets/ticlapay-logo.png";

interface Transaction {
  id: string;
  sender_id: string;
  sender_name?: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_country?: string;
  amount: number;
  currency: string;
  fee: number;
  status: string;
  created_at: string;
  tid?: string;
  rejection_reason?: string;
  exchange_rate?: number;
  profiles?: {
    full_name: string;
    phone_number: string;
  };
}

const Transactions = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userCountry, setUserCountry] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
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

  const loadTransactions = async (userId: string) => {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("phone_number, full_name, country")
      .eq("id", userId)
      .maybeSingle();

    setUserCountry(profileData?.country || '');

    const [sentResult, receivedResult] = await Promise.all([
      supabase
        .from("transactions")
        .select(`*, profiles!transactions_sender_id_fkey(full_name, phone_number)`)
        .eq("sender_id", userId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("transactions")
        .select(`*, profiles!transactions_sender_id_fkey(full_name, phone_number)`)
        .eq("receiver_phone", profileData?.phone_number || '')
        .order("created_at", { ascending: false })
        .limit(100)
    ]);

    const { data: sent, error: sentError } = sentResult;
    const { data: received, error: receivedError } = receivedResult;

    if (sentError) console.error("Error loading sent:", sentError);
    if (receivedError) console.error("Error loading received:", receivedError);

    const combinedTransactions = [...(sent || []), ...(received || [])];
    const uniqueTransactions = Array.from(new Map(combinedTransactions.map(tx => [tx.id, tx])).values());
    const allTransactions = uniqueTransactions.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    setTransactions(allTransactions);
    setLoading(false);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
      case "deposited":
        return { 
          bg: "bg-emerald-500/10", 
          text: "text-emerald-600", 
          border: "border-emerald-500/20",
          icon: CheckCircle2,
          label: status === "paid" ? "Paid" : "Deposited"
        };
      case "pending":
        return { 
          bg: "bg-amber-500/10", 
          text: "text-amber-600", 
          border: "border-amber-500/20",
          icon: Clock,
          label: "Pending"
        };
      case "rejected":
      case "failed":
        return { 
          bg: "bg-red-500/10", 
          text: "text-red-600", 
          border: "border-red-500/20",
          icon: XCircle,
          label: status === "rejected" ? "Rejected" : "Failed"
        };
      default:
        return { 
          bg: "bg-muted", 
          text: "text-muted-foreground", 
          border: "border-border",
          icon: AlertCircle,
          label: status
        };
    }
  };

  const handleDownloadStatement = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Complete Transaction History', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);

    const tableData = transactions.map(tx => {
      const isSender = tx.sender_id === session?.user.id;
      const type = isSender ? 'Sent' : 'Received';
      const name = isSender ? tx.receiver_name : tx.profiles?.full_name || 'Unknown';
      return [
        new Date(tx.created_at).toLocaleDateString(),
        type,
        name,
        `${tx.currency} ${tx.amount.toFixed(2)}`,
        getStatusConfig(tx.status).label,
        tx.tid || '-'
      ];
    });

    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Type', 'Name', 'Amount', 'Status', 'TID']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });

    const today = new Date().toISOString().slice(0, 10);
    doc.save(`transaction-history-${today}.pdf`);
    toast.success('Statement downloaded successfully');
  };

  const filteredTransactions = transactions.filter(tx => {
    const isSender = tx.sender_id === session?.user.id;
    const name = isSender ? tx.receiver_name : (tx as any).sender_profile?.full_name || tx.sender_name || '';
    const phone = isSender ? tx.receiver_phone : (tx as any).sender_profile?.phone_number || '';
    const amount = tx.amount.toString();
    const tid = tx.tid || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || phone.includes(query) || amount.includes(query) || tid.toLowerCase().includes(query);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
        <header className="bg-card/60 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="TiclaPay" className="h-8 sm:h-10 object-contain" />
              </div>
              <div className="h-10 w-32 bg-muted/50 rounded-full animate-pulse" />
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                  <div className="h-6 w-20 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Header */}
      <header className="bg-card/60 backdrop-blur-xl border-b border-border/40 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <img src={logo} alt="TiclaPay" className="h-8 sm:h-10 object-contain transition-transform group-hover:scale-105" />
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
      <main className="container mx-auto px-4 py-6 md:py-10 max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                  <FileText className="h-5 w-5 text-primary-foreground" />
                </div>
                Payment History
              </h1>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">
                Track all your transactions in one place
              </p>
            </div>
            <Button 
              onClick={handleDownloadStatement} 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground gap-2 rounded-xl shadow-lg shadow-primary/20 h-11"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Download Statement</span>
              <span className="sm:hidden">PDF</span>
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, phone, TID or amount..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card/80 backdrop-blur-sm border-border/50 rounded-xl text-base focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        {/* Transaction Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{transactions.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Total</p>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">
              {transactions.filter(t => t.status === 'paid' || t.status === 'deposited').length}
            </p>
            <p className="text-xs text-emerald-600/80 mt-1">Completed</p>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {transactions.filter(t => t.status === 'pending').length}
            </p>
            <p className="text-xs text-amber-600/80 mt-1">Pending</p>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-semibold text-lg">
              {searchQuery ? 'No matching transactions' : 'No transactions yet'}
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {searchQuery ? 'Try a different search term' : 'Your transactions will appear here'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((transaction, index) => {
              const isSender = transaction.sender_id === session?.user.id;
              const statusConfig = getStatusConfig(transaction.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div 
                  key={transaction.id} 
                  className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-4 md:p-5 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Transaction Icon */}
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${isSender ? 'bg-red-500/10' : 'bg-emerald-500/10'}`}>
                      {isSender ? (
                        <ArrowUpRight className="h-6 w-6 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-6 w-6 text-emerald-500" />
                      )}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground truncate">
                          {isSender ? transaction.receiver_name : (transaction as any).sender_profile?.full_name || transaction.sender_name || 'Unknown'}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {isSender ? `To: ${transaction.receiver_phone}` : `From: ${(transaction as any).sender_profile?.phone_number || 'N/A'}`}
                      </p>
                      {transaction.tid && (
                        <p className="text-xs font-medium text-primary mt-1.5">
                          TID: {transaction.tid}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>

                      {transaction.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <p className="text-xs font-semibold text-red-600 mb-1">Rejection Reason:</p>
                          <p className="text-sm text-red-600/90">{transaction.rejection_reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className={`font-bold text-lg ${isSender ? 'text-red-500' : 'text-emerald-500'}`}>
                        {isSender ? '-' : '+'}{' '}
                        {!isSender && userCountry === 'Zambia' && transaction.currency === 'USD'
                          ? `ZMW ${(transaction.amount * (transaction.exchange_rate || 27.5)).toFixed(2)}`
                          : `${transaction.currency} ${transaction.amount.toFixed(2)}`}
                      </p>
                      {transaction.fee > 0 && isSender && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Fee: {transaction.currency} {transaction.fee.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Transactions;