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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
      .select("phone_number, full_name")
      .eq("id", userId)
      .maybeSingle();

    // Load only completed transactions (both sent and received)
    const { data: sent, error: sentError } = await supabase
      .from("transactions")
      .select("*, profiles(full_name, phone_number)")
      .eq("sender_id", userId)
      .in("status", ["paid", "deposited", "completed"])
      .order("created_at", { ascending: false });

    const { data: received, error: receivedError } = await supabase
      .from("transactions")
      .select("*, profiles(full_name, phone_number)")
      .eq("receiver_phone", profileData?.phone_number || '')
      .in("status", ["paid", "deposited", "completed"])
      .order("created_at", { ascending: false });

    if (sentError) console.error("Error loading sent:", sentError);
    if (receivedError) console.error("Error loading received:", receivedError);

    // Combine and sort by date, showing only completed
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
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('TuraPay Complete Transaction History', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
    
    // Prepare table data
    const tableData = transactions.map((tx) => {
      const isSender = tx.sender_id === session?.user.id;
      const type = isSender ? 'Sent' : 'Received';
      const name = isSender ? tx.receiver_name : (tx.profiles?.full_name || 'Unknown');
      
      return [
        new Date(tx.created_at).toLocaleDateString(),
        type,
        name,
        `${tx.currency} ${tx.amount.toFixed(2)}`,
        getStatusLabel(tx.status),
        tx.tid || '-'
      ];
    });
    
    // Add table
    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Type', 'Name', 'Amount', 'Status', 'TID']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9 }
    });
    
    // Save PDF
    const today = new Date().toISOString().slice(0, 10);
    doc.save(`turapay-complete-history-${today}.pdf`);
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base md:text-lg">T</span>
              </div>
              <span className="text-lg md:text-2xl font-bold text-gray-900">TuraPay</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')} 
              className="gap-1 md:gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 text-xs md:text-sm px-2 md:px-4"
            >
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <CardTitle className="text-lg md:text-2xl font-bold text-gray-900">Completed Transactions</CardTitle>
                <p className="text-xs md:text-sm text-gray-600 mt-1">View all your completed transactions</p>
              </div>
              <Button
                onClick={handleDownloadStatement}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm md:text-base h-9 md:h-10 w-full sm:w-auto"
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            {transactions.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <p className="text-gray-600 text-base md:text-lg">No completed transactions</p>
                <p className="text-gray-500 text-xs md:text-sm mt-2">Completed transactions will appear here</p>
              </div>
            ) : (
              <div className="space-y-2 md:space-y-3">
                {transactions.map((transaction) => {
                  const isSender = transaction.sender_id === session?.user.id;
                  return (
                    <div 
                      key={transaction.id} 
                      className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 md:p-5 border border-gray-200 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors gap-3 sm:gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="font-semibold text-sm md:text-base text-gray-900 truncate">
                            {isSender ? `To: ${transaction.receiver_name}` : `From: ${transaction.profiles?.full_name || 'Unknown'}`}
                          </p>
                          <Badge className={`${getStatusColor(transaction.status)} text-white border-0 text-xs`}>
                            {getStatusLabel(transaction.status)}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 truncate">
                          {isSender ? transaction.receiver_phone : transaction.profiles?.phone_number}
                        </p>
                        {transaction.tid && (
                          <p className="text-xs font-semibold text-blue-600 mt-1 md:mt-2">
                            TID: {transaction.tid}
                          </p>
                        )}
                        {transaction.rejection_reason && (
                          <div className="mt-2 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</p>
                            <p className="text-xs md:text-sm text-red-700">{transaction.rejection_reason}</p>
                          </div>
                        )}
                        <p className="text-xs text-gray-500 mt-1 md:mt-2">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className={`font-bold text-base md:text-lg ${isSender ? 'text-red-600' : 'text-green-600'}`}>
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
