import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Users, TrendingUp, Settings as SettingsIcon, Search, Eye, User, FileText, Menu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminSidebar } from "@/components/AdminSidebar";

interface Transaction {
  id: string;
  sender_id: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_country: string;
  amount: number;
  fee: number;
  status: string;
  exchange_rate?: number;
  total_amount?: number;
  payout_method?: string;
  payment_proof_url?: string;
  admin_notes?: string;
  payment_reference?: string;
  payment_date?: string;
  admin_payment_proof_url?: string;
  created_at: string;
  sender_number?: string;
  transaction_id?: string;
  tid?: string;
  rejection_reason?: string;
  profiles?: { full_name: string; phone_number: string };
}

interface UserProfile {
  id: string;
  full_name: string;
  phone_number: string;
  country: string;
  balance: number;
  verified: boolean;
  created_at: string;
  id_type?: string;
  id_number?: string;
  id_document_url?: string;
  selfie_url?: string;
}

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
}

interface SupportSettings {
  id: string;
  email: string;
  phone: string;
  additional_info: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [kycRequests, setKycRequests] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [supportSettings, setSupportSettings] = useState<SupportSettings | null>(null);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, revenue: 0, totalUsers: 0, pendingKyc: 0 });
  const [newTransferFee, setNewTransferFee] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedKyc, setSelectedKyc] = useState<UserProfile | null>(null);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [manualTid, setManualTid] = useState("");
  const [senderName, setSenderName] = useState("");
  const [paymentRecipientName, setPaymentRecipientName] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    checkAdminAndLoadData();
  }, []);

  const checkAdminAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin/login");
        return;
      }

      // Check if user is admin
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (roleError || !roleData) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/admin/login");
        return;
      }

      setIsAdmin(true);
      await loadData();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/admin/login");
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      // Load transactions with sender profiles
      const { data: transData, error: transError } = await supabase
        .from("transactions")
        .select(`
          *,
          profiles:sender_id (full_name, phone_number)
        `)
        .order("created_at", { ascending: false });

      if (transError) throw transError;
      setTransactions(transData || []);

      // Load all users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Filter KYC requests (users who have uploaded documents or need verification)
      const kycData = usersData?.filter(user => 
        user.id_document_url || user.selfie_url || !user.verified
      ) || [];
      setKycRequests(kycData);

      // Load settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("settings")
        .select("*");

      if (settingsError) throw settingsError;
      setSettings(settingsData || []);

      // Calculate stats
      const totalTrans = transData?.length || 0;
      const pendingTrans = transData?.filter(t => t.status === "pending").length || 0;
      const completedTrans = transData?.filter(t => t.status === "completed" || t.status === "paid" || t.status === "deposited").length || 0;
      const revenue = transData?.reduce((sum, t) => sum + (t.fee || 0), 0) || 0;
      const pendingKyc = kycData.filter(u => !u.verified && (u.id_document_url || u.selfie_url)).length;

      setStats({
        total: totalTrans,
        pending: pendingTrans,
        completed: completedTrans,
        revenue: revenue,
        totalUsers: usersData?.length || 0,
        pendingKyc: pendingKyc
      });

      // Get current transfer fee
      const transferFeeSetting = settingsData?.find(s => s.key === "transfer_fee_percentage");
      if (transferFeeSetting) {
        setNewTransferFee(transferFeeSetting.value);
      }

      // Get payment number
      const paymentNumberSetting = settingsData?.find(s => s.key === "payment_number");
      if (paymentNumberSetting) {
        setPaymentNumber(paymentNumberSetting.value);
      }

      // Get payment recipient name
      const paymentRecipientNameSetting = settingsData?.find(s => s.key === "payment_recipient_name");
      if (paymentRecipientNameSetting) {
        setPaymentRecipientName(paymentRecipientNameSetting.value);
      }

    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (
    transactionId: string,
    status: string,
    notes?: string,
    reference?: string,
    proofUrl?: string,
    tid?: string,
    sender?: string,
    rejectionReason?: string
  ) => {
    try {
      if (status === "rejected") {
        if (!rejectionReason || !rejectionReason.trim()) {
          toast.error("Please enter a rejection reason");
          return;
        }
        
        const updateData: any = { 
          status,
          rejection_reason: rejectionReason
        };
        if (notes) updateData.admin_notes = notes;

        const { error } = await supabase
          .from("transactions")
          .update(updateData)
          .eq("id", transactionId);

        if (error) throw error;

        toast.success("Payment rejected successfully");
        setRejectionReason("");
        setSelectedTransaction(null);
        loadData();
        return;
      }

      if (!tid || !tid.trim()) {
        toast.error("Please enter a TID number");
        return;
      }
      
      if (!sender || !sender.trim()) {
        toast.error("Please enter the sender name");
        return;
      }
      
      const updateData: any = { status };
      if (notes) updateData.admin_notes = notes;
      if (reference) updateData.payment_reference = reference;
      if (proofUrl) updateData.admin_payment_proof_url = proofUrl;
      if (status === "paid" || status === "deposited") {
        updateData.payment_date = new Date().toISOString();
        updateData.tid = tid;
        updateData.admin_notes = sender ? `Sender: ${sender}${notes ? ` | ${notes}` : ''}` : notes;
      }

      const { error } = await supabase
        .from("transactions")
        .update(updateData)
        .eq("id", transactionId);

      if (error) throw error;

      toast.success(`Transaction marked as ${status}. TID: ${tid}`);
      setManualTid("");
      setSenderName("");
      setSelectedTransaction(null);
      loadData();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
  };

  const handleKycAction = async (userId: string, action: "approve" | "decline") => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ verified: action === "approve" })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`KYC ${action === "approve" ? "approved" : "declined"} successfully`);
      setKycDialogOpen(false);
      setSelectedKyc(null);
      loadData();
    } catch (error) {
      console.error("Error updating KYC:", error);
      toast.error("Failed to update KYC status");
    }
  };

  const viewKycDetails = (kyc: UserProfile) => {
    setSelectedKyc(kyc);
    setKycDialogOpen(true);
  };

  const updateTransferFee = async () => {
    const feeValue = parseFloat(newTransferFee);
    if (isNaN(feeValue) || feeValue < 0 || feeValue > 100) {
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }

    try {
      const { error } = await supabase
        .from("settings")
        .update({ value: newTransferFee })
        .eq("key", "transfer_fee_percentage");

      if (error) throw error;

      toast.success("Transfer fee updated successfully");
      loadData();
    } catch (error) {
      console.error("Error updating transfer fee:", error);
      toast.error("Failed to update transfer fee");
    }
  };

  const updatePaymentNumber = async () => {
    if (!paymentNumber.trim()) {
      toast.error("Please enter a valid payment number");
      return;
    }

    try {
      const { error } = await supabase
        .from("settings")
        .update({ value: paymentNumber })
        .eq("key", "payment_number");

      if (error) throw error;

      toast.success("Payment number updated successfully");
      loadData();
    } catch (error) {
      console.error("Error updating payment number:", error);
      toast.error("Failed to update payment number");
    }
  };

  const updatePaymentRecipientName = async () => {
    if (!paymentRecipientName.trim()) {
      toast.error("Please enter a valid recipient name");
      return;
    }

    try {
      const { error } = await supabase
        .from("settings")
        .update({ value: paymentRecipientName })
        .eq("key", "payment_recipient_name");

      if (error) throw error;

      toast.success("Payment recipient name updated successfully");
      loadData();
    } catch (error) {
      console.error("Error updating payment recipient name:", error);
      toast.error("Failed to update payment recipient name");
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.receiver_phone.includes(searchQuery) ||
      (transaction.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || transaction.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "deposited":
        return <Badge className="bg-emerald-500">Deposited</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[hsl(220,15%,12%)]">
      {/* Header */}
      <header className="bg-[hsl(220,15%,14%)] border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TuraPay Admin</h1>
                <p className="text-sm text-white/60">Dashboard & Management</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')} 
              className="gap-2 border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Pending</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Total Users</CardTitle>
              <Users className="h-4 w-4 text-indigo-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Pending KYC</CardTitle>
              <FileText className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">{stats.pendingKyc}</div>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Revenue (Fees)</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.revenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto bg-[hsl(220,15%,16%)] border border-white/10">
            <TabsTrigger value="pending" className="gap-2 data-[state=active]:bg-[hsl(220,15%,20%)] data-[state=active]:text-white text-white/60">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-0">{stats.pending}</Badge>
              Pending
            </TabsTrigger>
            <TabsTrigger value="all" className="data-[state=active]:bg-[hsl(220,15%,20%)] data-[state=active]:text-white text-white/60">All Transactions</TabsTrigger>
            <TabsTrigger value="kyc" className="data-[state=active]:bg-[hsl(220,15%,20%)] data-[state=active]:text-white text-white/60">KYC Verification</TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-[hsl(220,15%,20%)] data-[state=active]:text-white text-white/60">Users</TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-[hsl(220,15%,20%)] data-[state=active]:text-white text-white/60">Settings</TabsTrigger>
          </TabsList>

          {/* Pending Transactions Tab */}
          <TabsContent value="pending" className="space-y-6">
            <Card className="border-yellow-500/30 shadow-lg bg-[hsl(220,15%,16%)] border-white/10">
              <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-white/10">
                <CardTitle className="flex items-center gap-2 text-white">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                  Pending Transactions
                </CardTitle>
                <CardDescription className="text-white/60">Transactions awaiting approval and payment</CardDescription>
                
                {/* Search */}
                <div className="mt-4">
                  <Input
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.filter(t => t.status === "pending").filter(transaction => {
                    const matchesSearch = 
                      transaction.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      transaction.receiver_phone.includes(searchQuery) ||
                      (transaction.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
                    return matchesSearch;
                  }).length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No pending transactions</p>
                  ) : (
                    transactions.filter(t => t.status === "pending").filter(transaction => {
                      const matchesSearch = 
                        transaction.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        transaction.receiver_phone.includes(searchQuery) ||
                        (transaction.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
                      return matchesSearch;
                    }).map((transaction) => (
                      <Card key={transaction.id} className="p-6 border-l-4 border-l-yellow-500 bg-gradient-to-r from-card to-yellow-50/30 dark:to-yellow-950/10">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-lg text-foreground">
                                {transaction.profiles?.full_name || "Unknown Sender"}
                              </h4>
                              {getStatusBadge(transaction.status)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <p className="text-muted-foreground">
                                <strong>To:</strong> {transaction.receiver_name}
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Phone:</strong> {transaction.receiver_phone}
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Amount:</strong> ${transaction.amount.toFixed(2)}
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Fee:</strong> ${transaction.fee.toFixed(2)}
                              </p>
                              {transaction.sender_number && (
                                <p className="text-muted-foreground">
                                  <strong>Sender #:</strong> {transaction.sender_number}
                                </p>
                              )}
                              {transaction.transaction_id && (
                                <p className="text-muted-foreground">
                                  <strong>Transaction ID:</strong> {transaction.transaction_id}
                                </p>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => setSelectedTransaction(transaction)}
                              className="bg-green-500 hover:bg-green-600 gap-2"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Process Payment
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Transactions Tab */}
          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Transactions</CardTitle>
                <CardDescription>Complete transaction history</CardDescription>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by name or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="deposited">Deposited</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No transactions found</p>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <Card key={transaction.id} className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground">
                                {transaction.profiles?.full_name || "Unknown Sender"}
                              </h4>
                              {getStatusBadge(transaction.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              To: {transaction.receiver_name} ({transaction.receiver_phone})
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Amount: ${transaction.amount.toFixed(2)} | Fee: ${transaction.fee.toFixed(2)}
                            </p>
                            {transaction.sender_number && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Sender #:</strong> {transaction.sender_number}
                              </p>
                            )}
                            {transaction.transaction_id && (
                              <p className="text-sm text-muted-foreground">
                                <strong>Transaction ID:</strong> {transaction.transaction_id}
                              </p>
                            )}
                            {transaction.tid && (
                              <p className="text-sm font-semibold text-primary">
                                <strong>TID:</strong> {transaction.tid}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                            {transaction.admin_notes && (
                              <p className="text-sm text-muted-foreground italic">
                                Notes: {transaction.admin_notes}
                              </p>
                            )}
                          </div>
                          
                           <div className="flex flex-col gap-2">
                            {transaction.payment_proof_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(transaction.payment_proof_url, "_blank")}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Sender Proof
                              </Button>
                            )}
                            {transaction.status === "pending" && (
                              <Button
                                size="sm"
                                onClick={() => setSelectedTransaction(transaction)}
                                className="bg-green-500 hover:bg-green-600"
                              >
                               <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Deposited
                              </Button>
                            )}
                            {transaction.status !== "pending" && transaction.admin_payment_proof_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(transaction.admin_payment_proof_url, "_blank")}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Payment Proof
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                     ))
                   )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Verification Tab */}
          <TabsContent value="kyc" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>KYC Verification Requests</CardTitle>
                <CardDescription>Review and verify user identification documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {kycRequests.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No KYC requests</p>
                  ) : (
                    kycRequests.map((kyc) => (
                      <Card key={kyc.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold">{kyc.full_name}</p>
                              <p className="text-sm text-muted-foreground">{kyc.phone_number}</p>
                              <p className="text-xs text-muted-foreground">
                                {kyc.id_type && kyc.id_number ? `${kyc.id_type} - ${kyc.id_number}` : "No ID info"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                {kyc.verified ? (
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600">
                                    Pending Verification
                                  </span>
                                )
                                }
                                {(kyc.id_document_url || kyc.selfie_url) && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    Documents Uploaded
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button onClick={() => viewKycDetails(kyc)} variant="outline" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            Review KYC
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No users found</p>
                  ) : (
                    users.map((user) => (
                      <Card key={user.id} className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-semibold text-foreground">{user.full_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {user.phone_number} | {user.country}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Balance: ${user.balance.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {user.verified ? (
                              <Badge className="bg-green-500">Verified</Badge>
                            ) : (
                              <Badge className="bg-yellow-500">Unverified</Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure platform parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="transfer_fee">Transfer Fee Percentage</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="transfer_fee"
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={newTransferFee}
                      onChange={(e) => setNewTransferFee(e.target.value)}
                      placeholder="e.g., 2.5"
                    />
                    <Button onClick={updateTransferFee} className="min-w-[100px]">
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Current fee: {newTransferFee}%
                  </p>
                </div>

                <div>
                  <Label htmlFor="payment_number">Payment Number (For receiving funds)</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="payment_number"
                      type="text"
                      value={paymentNumber}
                      onChange={(e) => setPaymentNumber(e.target.value)}
                      placeholder="e.g., +263 77 123 4567"
                    />
                    <Button onClick={updatePaymentNumber} className="min-w-[100px]">
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This number will be shown to senders for payment
                  </p>
                </div>

                <div>
                  <Label htmlFor="payment_recipient_name">Payment Recipient Name</Label>
                  <div className="flex gap-3 mt-2">
                    <Input
                      id="payment_recipient_name"
                      type="text"
                      value={paymentRecipientName}
                      onChange={(e) => setPaymentRecipientName(e.target.value)}
                      placeholder="e.g., John Doe"
                    />
                    <Button onClick={updatePaymentRecipientName} className="min-w-[100px]">
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This name will be displayed to senders as the payment recipient
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Confirmation Modal - Separate from tabs */}
        {selectedTransaction && (
          <Card className="mt-6 border-2 border-green-500 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                Confirm Payment Completion
              </CardTitle>
              <CardDescription className="text-base">
                Transaction to <strong>{selectedTransaction.receiver_name}</strong>
              </CardDescription>
              <div className="mt-4 p-4 bg-white dark:bg-gray-900 rounded-lg border">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Amount</p>
                    <p className="font-semibold">${selectedTransaction.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Fee</p>
                    <p className="font-semibold">${selectedTransaction.fee.toFixed(2)}</p>
                  </div>
                  {selectedTransaction.sender_number && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Sender Number</p>
                      <p className="font-semibold">{selectedTransaction.sender_number}</p>
                    </div>
                  )}
                  {selectedTransaction.transaction_id && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Transaction ID</p>
                      <p className="font-semibold">{selectedTransaction.transaction_id}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="sender_name" className="text-base font-semibold">Sender Name *</Label>
                <Input
                  id="sender_name"
                  placeholder="Enter the name of who made the payment"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="mt-2 h-12"
                  required
                />
              </div>
              <div>
                <Label htmlFor="manual_tid" className="text-base font-semibold">TID Number *</Label>
                <Input
                  id="manual_tid"
                  placeholder="Enter TID manually (e.g., TIDXXX123)"
                  value={manualTid}
                  onChange={(e) => setManualTid(e.target.value)}
                  className="mt-2 h-12"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">This TID will be sent to the sender and receiver</p>
              </div>
              <div>
                <Label htmlFor="rejection_reason" className="text-base font-semibold">Rejection Reason (Optional)</Label>
                <Textarea
                  id="rejection_reason"
                  placeholder="Enter reason for rejection if rejecting this payment..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="mt-2 min-h-[80px]"
                />
                <p className="text-xs text-muted-foreground mt-1">This will be visible to the sender</p>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => updateTransactionStatus(
                    selectedTransaction.id,
                    "deposited",
                    undefined,
                    "",
                    "",
                    manualTid,
                    senderName
                  )}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-12 text-base"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Mark as Deposited
                </Button>
                <Button
                  onClick={() => updateTransactionStatus(
                    selectedTransaction.id,
                    "rejected",
                    undefined,
                    "",
                    "",
                    "",
                    "",
                    rejectionReason
                  )}
                  variant="destructive"
                  className="flex-1 h-12 text-base"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Reject Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTransaction(null);
                    setManualTid("");
                    setSenderName("");
                    setRejectionReason("");
                  }}
                  className="h-12"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* KYC Details Dialog */}
        <Dialog open={kycDialogOpen} onOpenChange={setKycDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>KYC Verification Details</DialogTitle>
            </DialogHeader>
            {selectedKyc && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="font-semibold">{selectedKyc.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                    <p className="font-semibold">{selectedKyc.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Country</p>
                    <p className="font-semibold">{selectedKyc.country}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID Type</p>
                    <p className="font-semibold">{selectedKyc.id_type || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID Number</p>
                    <p className="font-semibold">{selectedKyc.id_number || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <p className="font-semibold">
                      {selectedKyc.verified ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="text-yellow-600">Pending</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">ID Document</p>
                    {selectedKyc.id_document_url ? (
                      <img 
                        src={selectedKyc.id_document_url} 
                        alt="ID Document" 
                        className="w-full max-w-md rounded-lg border"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">No document uploaded</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-2">Selfie</p>
                    {selectedKyc.selfie_url ? (
                      <img 
                        src={selectedKyc.selfie_url} 
                        alt="Selfie" 
                        className="w-full max-w-md rounded-lg border"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">No selfie uploaded</p>
                    )}
                  </div>
                </div>

                {!selectedKyc.verified && (
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={() => handleKycAction(selectedKyc.id, "approve")}
                      className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve KYC
                    </Button>
                    <Button 
                      onClick={() => handleKycAction(selectedKyc.id, "decline")}
                      variant="destructive"
                      className="flex-1 gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Decline KYC
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;
