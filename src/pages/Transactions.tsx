import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  rejection_reason?: string;
  profiles?: { full_name: string; phone_number: string };
}

const Transactions = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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
      .select("phone_number")
      .eq("id", userId)
      .maybeSingle();

    // Load both sent and received transactions
    const { data: sent, error: sentError } = await supabase
      .from("transactions")
      .select("*, profiles(full_name, phone_number)")
      .eq("sender_id", userId)
      .order("created_at", { ascending: false });

    const { data: received, error: receivedError } = await supabase
      .from("transactions")
      .select("*, profiles(full_name, phone_number)")
      .eq("receiver_phone", profileData?.phone_number || '')
      .order("created_at", { ascending: false });

    if (sentError) console.error("Error loading sent:", sentError);
    if (receivedError) console.error("Error loading received:", receivedError);

    // Combine and sort by date
    const allTransactions = [...(sent || []), ...(received || [])]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setTransactions(allTransactions);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "deposited":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
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

  const handleDownloadStatement = () => {
    const headers = ['Date','Type','Name','Phone','Amount','Currency','Status','TID','Rejection Reason','Transaction ID'];
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
        tx.rejection_reason || '',
        tx.id
      ].map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const today = new Date().toISOString().slice(0,10);
    link.setAttribute('download', `all-transactions-${today}.csv`);
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">TuraPay</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')} 
              className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">All Transactions</CardTitle>
                <p className="text-sm text-gray-600 mt-1">View all your sent and received transactions</p>
              </div>
              <Button
                onClick={handleDownloadStatement}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <Download className="h-4 w-4" />
                Download Statement
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No transactions yet</p>
                <p className="text-gray-500 text-sm mt-2">Your transaction history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => {
                  const isSender = transaction.sender_id === session?.user.id;
                  return (
                    <div 
                      key={transaction.id} 
                      className="flex items-start justify-between p-5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-base text-gray-900">
                            {isSender ? `To: ${transaction.receiver_name}` : `From: ${transaction.profiles?.full_name || 'Unknown'}`}
                          </p>
                          <Badge className={`${getStatusColor(transaction.status)} text-white border-0`}>
                            {getStatusLabel(transaction.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {isSender ? transaction.receiver_phone : transaction.profiles?.phone_number}
                        </p>
                        {transaction.tid && (
                          <p className="text-xs font-semibold text-blue-600 mt-2">
                            TID: {transaction.tid}
                          </p>
                        )}
                        {transaction.rejection_reason && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</p>
                            <p className="text-sm text-red-700">{transaction.rejection_reason}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${isSender ? 'text-red-600' : 'text-green-600'}`}>
                          {isSender ? '-' : '+'} {transaction.currency} {transaction.amount.toFixed(2)}
                        </p>
                        {transaction.fee > 0 && isSender && (
                          <p className="text-xs text-gray-500 mt-1">
                            Fee: {transaction.currency} {transaction.fee.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;
