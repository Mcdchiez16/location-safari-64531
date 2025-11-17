import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
}
const Transactions = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
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
  const loadTransactions = async (userId: string) => {
    const {
      data: profileData
    } = await supabase.from("profiles").select("phone_number, full_name").eq("id", userId).maybeSingle();

    // Load sent and received transactions in parallel with profiles joined
    const [sentResult, receivedResult] = await Promise.all([supabase.from("transactions").select(`
          *,
          profiles!transactions_sender_id_fkey(full_name, phone_number)
        `).eq("sender_id", userId).order("created_at", {
      ascending: false
    }).limit(100), supabase.from("transactions").select(`
          *,
          profiles!transactions_sender_id_fkey(full_name, phone_number)
        `).eq("receiver_phone", profileData?.phone_number || '').order("created_at", {
      ascending: false
    }).limit(100)]);
    const {
      data: sent,
      error: sentError
    } = sentResult;
    const {
      data: received,
      error: receivedError
    } = receivedResult;
    if (sentError) console.error("Error loading sent:", sentError);
    if (receivedError) console.error("Error loading received:", receivedError);

    // Combine, deduplicate, and sort by date
    const combinedTransactions = [...(sent || []), ...(received || [])];
    const uniqueTransactions = Array.from(new Map(combinedTransactions.map(tx => [tx.id, tx])).values());
    const allTransactions = uniqueTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
    doc.text('Complete Transaction History', 14, 22);

    // Add date
    doc.setFontSize(11);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);

    // Prepare table data
    const tableData = transactions.map(tx => {
      const isSender = tx.sender_id === session?.user.id;
      const type = isSender ? 'Sent' : 'Received';
      const name = isSender ? tx.receiver_name : tx.profiles?.full_name || 'Unknown';
      return [new Date(tx.created_at).toLocaleDateString(), type, name, `${tx.currency} ${tx.amount.toFixed(2)}`, getStatusLabel(tx.status), tx.tid || '-'];
    });

    // Add table
    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Type', 'Name', 'Amount', 'Status', 'TID']],
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
    doc.save(`transaction-history-${today}.pdf`);
    toast.success('Statement downloaded successfully');
  };
  if (loading) {
    return <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-3 md:py-4">
            <Button onClick={() => navigate("/dashboard")} variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="bg-gray-50 border-b border-gray-200">
              <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="p-5 border border-gray-200 rounded-xl animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                    <div className="h-3 bg-gray-200 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>;
  }
  return <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 md:py-4">
          <Button onClick={() => navigate("/dashboard")} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4 md:py-8 max-w-5xl">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="bg-gray-50 border-b border-gray-200 p-4 md:p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-lg md:text-2xl font-bold text-gray-900">Payment History</CardTitle>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">View all your transactions</p>
                </div>
                <Button onClick={handleDownloadStatement} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-sm md:text-base h-9 md:h-10 w-full sm:w-auto">
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="text" placeholder="Search by name, phone, TID or amount..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            {(() => {
            const filteredTransactions = transactions.filter(tx => {
              const isSender = tx.sender_id === session?.user.id;
              const name = isSender ? tx.receiver_name : (tx as any).sender_profile?.full_name || tx.sender_name || '';
              const phone = isSender ? tx.receiver_phone : (tx as any).sender_profile?.phone_number || '';
              const amount = tx.amount.toString();
              const tid = tx.tid || '';
              const query = searchQuery.toLowerCase();
              return name.toLowerCase().includes(query) || phone.includes(query) || amount.includes(query) || tid.toLowerCase().includes(query);
            });
            return filteredTransactions.length === 0 ? <div className="text-center py-8 md:py-12">
                  <p className="text-gray-600 text-base md:text-lg">
                    {searchQuery ? 'No matching transactions' : 'No transactions'}
                  </p>
                  <p className="text-gray-500 text-xs md:text-sm mt-2">
                    {searchQuery ? 'Try a different search term' : 'Your transactions will appear here'}
                  </p>
                </div> : <div className="space-y-2 md:space-y-3">
                  {filteredTransactions.map(transaction => {
                const isSender = transaction.sender_id === session?.user.id;
                return <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-start sm:justify-between p-3 md:p-5 border border-gray-200 rounded-lg md:rounded-xl hover:bg-gray-50 transition-colors gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <p className="font-semibold text-sm md:text-base text-gray-900 truncate">
                            {isSender ? `To: ${transaction.receiver_name}` : `From: ${(transaction as any).sender_profile?.full_name || transaction.sender_name || 'Unknown'}`}
                          </p>
                          <Badge className={`${getStatusColor(transaction.status)} text-white border-0 text-xs`}>
                            {getStatusLabel(transaction.status)}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 truncate">
                          {isSender ? transaction.receiver_phone : (transaction as any).sender_profile?.phone_number || 'N/A'}
                        </p>
                        {transaction.tid && <p className="text-xs font-semibold text-blue-600 mt-1 md:mt-2">
                            TID: {transaction.tid}
                          </p>}
                        {transaction.rejection_reason && <div className="mt-2 p-2 md:p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs font-semibold text-red-800 mb-1">Rejection Reason:</p>
                            <p className="text-xs md:text-sm text-red-700">{transaction.rejection_reason}</p>
                          </div>}
                        <p className="text-xs text-gray-500 mt-1 md:mt-2">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-left sm:text-right flex-shrink-0">
                        <p className={`font-bold text-base md:text-lg ${isSender ? 'text-red-600' : 'text-green-600'}`}>
                          {isSender ? '-' : '+'} {transaction.currency} {transaction.amount.toFixed(2)}
                        </p>
                        {transaction.fee > 0 && isSender && <p className="text-xs text-gray-500 mt-1">
                            Fee: {transaction.currency} {transaction.fee.toFixed(2)}
                          </p>}
                      </div>
                    </div>;
              })}
                </div>;
          })()}
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Transactions;