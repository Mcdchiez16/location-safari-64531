import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Search, 
  Eye, 
  User, 
  FileText,
  Shield,
  Phone,
  MapPin,
  Clock,
  Filter,
  Download
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminTopNav } from "@/components/admin/AdminTopNav";
import { AdminSidebarNew } from "@/components/admin/AdminSidebarNew";
import { AdminStatsGrid } from "@/components/admin/AdminStatsGrid";
import { Switch } from "@/components/ui/switch";

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
  profiles?: {
    full_name: string;
    phone_number: string;
  };
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
  account_type?: string;
  referral_code?: string;
  referral_earnings?: number;
}

interface SupportSettings {
  id: string;
  email: string;
  phone: string;
  additional_info: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }
  }
};

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [kycRequests, setKycRequests] = useState<UserProfile[]>([]);
  const [supportSettings, setSupportSettings] = useState<SupportSettings | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    revenue: 0,
    totalUsers: 0,
    pendingKyc: 0
  });
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
  const [referralPercentage, setReferralPercentage] = useState("");
  const [unverifiedLimit, setUnverifiedLimit] = useState("");
  const [maxTransferLimit, setMaxTransferLimit] = useState("");
  const [kycSearchQuery, setKycSearchQuery] = useState("");
  const [selectedUserTransactions, setSelectedUserTransactions] = useState<Transaction[]>([]);
  const [referralEnabled, setReferralEnabled] = useState(true);
  const [referralPayoutThreshold, setReferralPayoutThreshold] = useState("");
  const [usersAboveThreshold, setUsersAboveThreshold] = useState<UserProfile[]>([]);
  const [cardPaymentsEnabled, setCardPaymentsEnabled] = useState(true);

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
      const { data: transData, error: transError } = await supabase
        .from("transactions")
        .select(`*, profiles:sender_id (full_name, phone_number)`)
        .order("created_at", { ascending: false });
      if (transError) throw transError;
      setTransactions(transData || []);

      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (usersError) throw usersError;
      setUsers(usersData || []);

      const kycData = usersData?.filter(user => user.id_document_url || user.selfie_url || !user.verified) || [];
      setKycRequests(kycData);

      const { data: settingsData, error: settingsError } = await supabase.from("settings").select("*");
      if (settingsError) throw settingsError;

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

      const transferFeeSetting = settingsData?.find(s => s.key === "transfer_fee_percentage");
      if (transferFeeSetting) setNewTransferFee(transferFeeSetting.value);

      const paymentNumberSetting = settingsData?.find(s => s.key === "payment_number");
      if (paymentNumberSetting) setPaymentNumber(paymentNumberSetting.value);

      const paymentRecipientNameSetting = settingsData?.find(s => s.key === "payment_recipient_name");
      if (paymentRecipientNameSetting) setPaymentRecipientName(paymentRecipientNameSetting.value);

      const referralPercentageSetting = settingsData?.find(s => s.key === "referral_percentage");
      if (referralPercentageSetting) setReferralPercentage(referralPercentageSetting.value);

      const unverifiedLimitSetting = settingsData?.find(s => s.key === "unverified_send_limit");
      if (unverifiedLimitSetting) setUnverifiedLimit(unverifiedLimitSetting.value);

      const maxTransferLimitSetting = settingsData?.find(s => s.key === "max_transfer_limit");
      if (maxTransferLimitSetting) setMaxTransferLimit(maxTransferLimitSetting.value);

      const referralEnabledSetting = settingsData?.find(s => s.key === "referral_enabled");
      if (referralEnabledSetting) setReferralEnabled(referralEnabledSetting.value === "true");

      const referralThresholdSetting = settingsData?.find(s => s.key === "referral_payout_threshold");
      if (referralThresholdSetting) setReferralPayoutThreshold(referralThresholdSetting.value);

      const cardPaymentsSetting = settingsData?.find(s => s.key === "card_payments_enabled");
      if (cardPaymentsSetting) setCardPaymentsEnabled(cardPaymentsSetting.value === "true");

      const threshold = referralThresholdSetting ? parseFloat(referralThresholdSetting.value) : 50;
      const usersAbove = usersData?.filter(u => (u.referral_earnings || 0) >= threshold) || [];
      setUsersAboveThreshold(usersAbove);

      const { data: supportData, error: supportError } = await supabase
        .from("support_settings")
        .select("*")
        .maybeSingle();
      
      if (!supportError && supportData) {
        setSupportSettings(supportData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId: string, status: string, notes?: string, reference?: string, proofUrl?: string, tid?: string, sender?: string, rejectionReasonInput?: string) => {
    try {
      if (status === "rejected") {
        if (!rejectionReasonInput || !rejectionReasonInput.trim()) {
          toast.error("Please enter a rejection reason");
          return;
        }
        const updateData: Record<string, unknown> = { status, rejection_reason: rejectionReasonInput };
        if (notes) updateData.admin_notes = notes;
        const { error } = await supabase.from("transactions").update(updateData).eq("id", transactionId);
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
      const updateData: Record<string, unknown> = { status };
      if (notes) updateData.admin_notes = notes;
      if (reference) updateData.payment_reference = reference;
      if (proofUrl) updateData.admin_payment_proof_url = proofUrl;
      if (status === "paid" || status === "deposited") {
        updateData.payment_date = new Date().toISOString();
        updateData.tid = tid;
        updateData.admin_notes = sender ? `Sender: ${sender}${notes ? ` | ${notes}` : ''}` : notes;
      }
      const { error } = await supabase.from("transactions").update(updateData).eq("id", transactionId);
      if (error) throw error;

      if (status === "deposited") {
        await processReferralReward(transactionId);
      }

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

  const handleKycAction = async (userId: string, action: "approve" | "decline" | "unverify") => {
    try {
      const { error } = await supabase.from("profiles").update({ verified: action === "approve" }).eq("id", userId);
      if (error) throw error;
      const actionText = action === "approve" ? "approved" : action === "unverify" ? "unverified" : "declined";
      toast.success(`User ${actionText} successfully`);
      setKycDialogOpen(false);
      setSelectedKyc(null);
      loadData();
    } catch (error) {
      console.error("Error updating KYC:", error);
      toast.error("Failed to update KYC status");
    }
  };

  const viewKycDetails = async (kyc: UserProfile) => {
    setSelectedKyc(kyc);
    setKycDialogOpen(true);
    
    try {
      const { data: userTransactions } = await supabase
        .from("transactions")
        .select("*")
        .or(`sender_id.eq.${kyc.id},receiver_phone.eq.${kyc.phone_number}`)
        .order("created_at", { ascending: false })
        .limit(10);
      
      setSelectedUserTransactions(userTransactions || []);
    } catch (error) {
      console.error("Error loading user transactions:", error);
    }
  };

  const updateSetting = async (key: string, value: string, successMessage: string) => {
    try {
      const { error } = await supabase.from("settings").update({ value }).eq("key", key);
      if (error) throw error;
      toast.success(successMessage);
      loadData();
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      toast.error(`Failed to update ${key}`);
    }
  };

  const toggleReferralProgram = async () => {
    try {
      const newValue = !referralEnabled;
      const { error } = await supabase.from("settings").update({ value: newValue.toString() }).eq("key", "referral_program_enabled");
      if (error) throw error;
      setReferralEnabled(newValue);
      toast.success(`Referral program ${newValue ? "enabled" : "disabled"}`);
      loadData();
    } catch (error) {
      console.error("Error toggling referral program:", error);
      toast.error("Failed to update referral program status");
    }
  };

  const toggleCardPayments = async () => {
    try {
      const newValue = !cardPaymentsEnabled;
      const { error } = await supabase.from("settings").update({ value: newValue.toString() }).eq("key", "card_payments_enabled");
      if (error) throw error;
      setCardPaymentsEnabled(newValue);
      toast.success(`Card payments ${newValue ? "enabled" : "disabled"}`);
      loadData();
    } catch (error) {
      console.error("Error toggling card payments:", error);
      toast.error("Failed to update card payments status");
    }
  };

  const updateSupportSettings = async () => {
    if (!supportSettings?.email.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }
    try {
      const { error } = await supabase
        .from("support_settings")
        .upsert({
          id: supportSettings.id || undefined,
          email: supportSettings.email,
          phone: supportSettings.phone || null,
          additional_info: supportSettings.additional_info || null,
        });
      
      if (error) throw error;
      toast.success("Support settings updated successfully");
      loadData();
    } catch (error) {
      console.error("Error updating support settings:", error);
      toast.error("Failed to update support settings");
    }
  };

  const processReferralReward = async (transactionId: string) => {
    try {
      const { data: transaction } = await supabase
        .from("transactions")
        .select("*, receiver_phone, amount")
        .eq("id", transactionId)
        .single();

      if (!transaction) return;

      const { data: receiverProfile } = await supabase
        .from("profiles")
        .select("id, referred_by")
        .eq("phone_number", transaction.receiver_phone)
        .maybeSingle();

      if (!receiverProfile || !receiverProfile.referred_by) return;

      const { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "referral_percentage")
        .single();

      const percentage = setting ? parseFloat(setting.value) : 5;
      const rewardAmount = (transaction.amount * percentage) / 100;

      const { data: existingReward } = await supabase
        .from("referral_transactions")
        .select("id")
        .eq("transaction_id", transactionId)
        .maybeSingle();

      if (existingReward) return;

      const { error: refError } = await supabase
        .from("referral_transactions")
        .insert({
          referrer_id: receiverProfile.referred_by,
          referred_user_id: receiverProfile.id,
          transaction_id: transactionId,
          reward_amount: rewardAmount,
          currency: transaction.currency || "USD"
        });

      if (refError) {
        console.error("Error creating referral transaction:", refError);
        return;
      }

      const { data: referrerProfile } = await supabase
        .from("profiles")
        .select("referral_earnings")
        .eq("id", receiverProfile.referred_by)
        .single();

      if (referrerProfile) {
        await supabase
          .from("profiles")
          .update({ referral_earnings: (referrerProfile.referral_earnings || 0) + rewardAmount })
          .eq("id", receiverProfile.referred_by);
      }
    } catch (error) {
      console.error("Error processing referral reward:", error);
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
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      deposited: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return (
      <Badge className={`admin-badge border ${styles[status] || "bg-slate-500/20 text-slate-400"}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-admin-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-admin-text-muted flex flex-col items-center gap-4"
        >
          <div className="h-12 w-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p>Loading admin panel...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-admin-bg flex">
      {/* Sidebar */}
      <AdminSidebarNew 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <AdminTopNav 
          onMenuClick={() => setSidebarOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Stats Grid */}
          <div className="mb-4 sm:mb-6 md:mb-8">
            <AdminStatsGrid stats={stats} />
          </div>

          {/* Content Panels */}
          <AnimatePresence mode="wait">
            {/* Pending Transactions */}
            {activeTab === "pending" && (
              <motion.div
                key="pending"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-admin-text flex items-center gap-2">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                    Pending Transactions
                  </h2>
                  <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 self-start sm:self-auto text-xs">
                    {stats.pending} awaiting
                  </Badge>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-muted" />
                    <Input
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 glass-input text-admin-text placeholder:text-admin-text-muted text-sm h-9"
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:gap-4">
                  {transactions.filter(t => t.status === "pending").filter(t => 
                    t.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    t.receiver_phone.includes(searchQuery) ||
                    (t.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
                  ).length === 0 ? (
                    <motion.div variants={itemVariants} className="glass-card rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center">
                      <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-400 mx-auto mb-3 sm:mb-4" />
                      <p className="text-admin-text-muted text-sm">No pending transactions</p>
                    </motion.div>
                  ) : (
                    transactions.filter(t => t.status === "pending").filter(t => 
                      t.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.receiver_phone.includes(searchQuery) ||
                      (t.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        variants={itemVariants}
                        className="glass-card rounded-xl sm:rounded-2xl p-3 sm:p-5 space-y-3 sm:space-y-4"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2 sm:gap-4">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-admin-surface flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 sm:h-5 sm:w-5 text-admin-text-muted" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-admin-text text-sm sm:text-base truncate">
                                {transaction.profiles?.full_name || "Unknown Sender"}
                              </h4>
                              <p className="text-[10px] sm:text-xs text-admin-text-muted flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(transaction.status)}
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                          <div className="space-y-0.5 sm:space-y-1">
                            <p className="text-[10px] sm:text-xs text-admin-text-muted">Recipient</p>
                            <p className="text-xs sm:text-sm font-medium text-admin-text truncate">{transaction.receiver_name}</p>
                          </div>
                          <div className="space-y-0.5 sm:space-y-1">
                            <p className="text-[10px] sm:text-xs text-admin-text-muted">Phone</p>
                            <p className="text-xs sm:text-sm font-medium text-admin-text">{transaction.receiver_phone}</p>
                          </div>
                          <div className="space-y-0.5 sm:space-y-1">
                            <p className="text-[10px] sm:text-xs text-admin-text-muted">Country</p>
                            <p className="text-xs sm:text-sm font-medium text-admin-text">{transaction.receiver_country}</p>
                          </div>
                          <div className="space-y-0.5 sm:space-y-1">
                            <p className="text-[10px] sm:text-xs text-admin-text-muted">Amount</p>
                            <p className="text-xs sm:text-sm font-bold text-primary">${transaction.amount.toFixed(2)}</p>
                          </div>
                        </div>

                        {/* Recipient Gets */}
                        <div className="glass-card-elevated rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                          <p className="text-[10px] sm:text-xs text-admin-text-muted mb-0.5 sm:mb-1">Recipient Gets</p>
                          <p className="text-base sm:text-lg font-bold text-emerald-400">
                            {transaction.receiver_country === 'Zambia' 
                              ? `${(transaction.amount * (transaction.exchange_rate || 22)).toFixed(2)} ZMW`
                              : `$${transaction.amount.toFixed(2)} USD`}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="grid gap-3 sm:gap-4 pt-2">
                          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                            <Label className="text-xs sm:text-sm text-admin-text">Approve Transaction</Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                placeholder="TID"
                                value={selectedTransaction?.id === transaction.id ? manualTid : ""}
                                onChange={(e) => {
                                  setSelectedTransaction(transaction);
                                  setManualTid(e.target.value);
                                }}
                                className="glass-input text-admin-text placeholder:text-admin-text-muted text-xs sm:text-sm h-8 sm:h-9"
                              />
                              <Input
                                placeholder="Sender"
                                value={selectedTransaction?.id === transaction.id ? senderName : ""}
                                onChange={(e) => {
                                  setSelectedTransaction(transaction);
                                  setSenderName(e.target.value);
                                }}
                                className="glass-input text-admin-text placeholder:text-admin-text-muted text-xs sm:text-sm h-8 sm:h-9"
                              />
                            </div>
                            <Button
                              onClick={() => updateTransactionStatus(transaction.id, "deposited", undefined, undefined, undefined, manualTid, senderName)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
                            >
                              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              Approve
                            </Button>
                          </div>

                          <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 rounded-lg sm:rounded-xl bg-red-500/5 border border-red-500/20">
                            <Label className="text-xs sm:text-sm text-admin-text">Reject Transaction</Label>
                            <Textarea
                              placeholder="Reason..."
                              value={selectedTransaction?.id === transaction.id ? rejectionReason : ""}
                              onChange={(e) => {
                                setSelectedTransaction(transaction);
                                setRejectionReason(e.target.value);
                              }}
                              className="glass-input text-admin-text placeholder:text-admin-text-muted min-h-[50px] sm:min-h-[60px] text-xs sm:text-sm"
                            />
                            <Button
                              onClick={() => updateTransactionStatus(transaction.id, "rejected", undefined, undefined, undefined, undefined, undefined, rejectionReason)}
                              variant="destructive"
                              className="w-full gap-1.5 sm:gap-2 h-8 sm:h-9 text-xs sm:text-sm"
                            >
                              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* All Transactions */}
            {activeTab === "all" && (
              <motion.div
                key="all"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h2 className="text-xl font-semibold text-admin-text flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    All Transactions
                  </h2>
                  <div className="flex items-center gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40 glass-input text-admin-text border-admin-border/40">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-admin-surface border-admin-border">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="deposited">Deposited</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-admin-border/40">
                          <th className="text-left p-4 text-xs font-medium text-admin-text-muted uppercase tracking-wide">Sender</th>
                          <th className="text-left p-4 text-xs font-medium text-admin-text-muted uppercase tracking-wide">Recipient</th>
                          <th className="text-left p-4 text-xs font-medium text-admin-text-muted uppercase tracking-wide">Amount</th>
                          <th className="text-left p-4 text-xs font-medium text-admin-text-muted uppercase tracking-wide">Status</th>
                          <th className="text-left p-4 text-xs font-medium text-admin-text-muted uppercase tracking-wide">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction, index) => (
                          <motion.tr
                            key={transaction.id}
                            variants={itemVariants}
                            className="border-b border-admin-border/20 hover:bg-admin-surface/30 transition-colors"
                          >
                            <td className="p-4">
                              <p className="text-sm font-medium text-admin-text">{transaction.profiles?.full_name || "Unknown"}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-admin-text">{transaction.receiver_name}</p>
                              <p className="text-xs text-admin-text-muted">{transaction.receiver_phone}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-bold text-primary">${transaction.amount.toFixed(2)}</p>
                            </td>
                            <td className="p-4">{getStatusBadge(transaction.status)}</td>
                            <td className="p-4">
                              <p className="text-sm text-admin-text-muted">{new Date(transaction.created_at).toLocaleDateString()}</p>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* KYC */}
            {activeTab === "kyc" && (
              <motion.div
                key="kyc"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-admin-text flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-400" />
                    KYC Verification
                  </h2>
                  <Badge className="bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    {stats.pendingKyc} pending
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-muted" />
                    <Input
                      placeholder="Search users..."
                      value={kycSearchQuery}
                      onChange={(e) => setKycSearchQuery(e.target.value)}
                      className="pl-10 glass-input text-admin-text placeholder:text-admin-text-muted"
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  {kycRequests.filter(k => 
                    k.full_name.toLowerCase().includes(kycSearchQuery.toLowerCase()) ||
                    k.phone_number.includes(kycSearchQuery)
                  ).map((kyc, index) => (
                    <motion.div
                      key={kyc.id}
                      variants={itemVariants}
                      className="glass-card rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-admin-surface flex items-center justify-center">
                            <User className="h-6 w-6 text-admin-text-muted" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-admin-text">{kyc.full_name}</h4>
                              {kyc.verified ? (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Verified</Badge>
                              ) : (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Unverified</Badge>
                              )}
                            </div>
                            <p className="text-sm text-admin-text-muted">{kyc.phone_number}</p>
                            <p className="text-xs text-admin-text-muted">{kyc.country}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={() => viewKycDetails(kyc)}
                          className="gap-2 border-admin-border/50 text-admin-text hover:bg-admin-surface"
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Users */}
            {activeTab === "users" && (
              <motion.div
                key="users"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <h2 className="text-xl font-semibold text-admin-text flex items-center gap-2">
                  <User className="h-5 w-5 text-indigo-400" />
                  User Management
                </h2>

                <div className="glass-card rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-admin-border/40">
                          <th className="text-left p-4 text-xs font-medium text-admin-text-muted uppercase tracking-wide">User</th>
                          <th className="text-left p-4 text-xs font-medium text-admin-text-muted uppercase tracking-wide">Country</th>
                          <th className="text-left p-4 text-xs font-medium text-admin-text-muted uppercase tracking-wide">Balance</th>
                          <th className="text-left p-4 text-xs font-medium text-admin-text-muted uppercase tracking-wide">Status</th>
                          <th className="text-left p-4 text-xs font-medium text-admin-text-muted uppercase tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user) => (
                          <motion.tr
                            key={user.id}
                            variants={itemVariants}
                            className="border-b border-admin-border/20 hover:bg-admin-surface/30 transition-colors"
                          >
                            <td className="p-4">
                              <p className="text-sm font-medium text-admin-text">{user.full_name}</p>
                              <p className="text-xs text-admin-text-muted">{user.phone_number}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-admin-text">{user.country}</p>
                            </td>
                            <td className="p-4">
                              <p className="text-sm font-bold text-emerald-400">${user.balance.toFixed(2)}</p>
                            </td>
                            <td className="p-4">
                              {user.verified ? (
                                <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Verified</Badge>
                              ) : (
                                <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">Unverified</Badge>
                              )}
                            </td>
                            <td className="p-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => viewKycDetails(user)}
                                className="text-admin-text-muted hover:text-admin-text"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Settings */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-admin-text">Platform Settings</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Transfer Fee */}
                  <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-4">
                    <Label className="text-admin-text font-medium">Transfer Fee Percentage</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={newTransferFee}
                        onChange={(e) => setNewTransferFee(e.target.value)}
                        className="glass-input text-admin-text"
                      />
                      <Button onClick={() => updateSetting("transfer_fee_percentage", newTransferFee, "Transfer fee updated")}>
                        Update
                      </Button>
                    </div>
                    <p className="text-xs text-admin-text-muted">Current: {newTransferFee}%</p>
                  </motion.div>

                  {/* Payment Number */}
                  <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-4">
                    <Label className="text-admin-text font-medium">Payment Number</Label>
                    <div className="flex gap-2">
                      <Input
                        value={paymentNumber}
                        onChange={(e) => setPaymentNumber(e.target.value)}
                        className="glass-input text-admin-text"
                      />
                      <Button onClick={() => updateSetting("payment_number", paymentNumber, "Payment number updated")}>
                        Update
                      </Button>
                    </div>
                  </motion.div>

                  {/* Recipient Name */}
                  <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-4">
                    <Label className="text-admin-text font-medium">Payment Recipient Name</Label>
                    <div className="flex gap-2">
                      <Input
                        value={paymentRecipientName}
                        onChange={(e) => setPaymentRecipientName(e.target.value)}
                        className="glass-input text-admin-text"
                      />
                      <Button onClick={() => updateSetting("payment_recipient_name", paymentRecipientName, "Recipient name updated")}>
                        Update
                      </Button>
                    </div>
                  </motion.div>

                  {/* Unverified Limit */}
                  <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-4">
                    <Label className="text-admin-text font-medium">Unverified Send Limit (USD)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        value={unverifiedLimit}
                        onChange={(e) => setUnverifiedLimit(e.target.value)}
                        className="glass-input text-admin-text"
                      />
                      <Button onClick={() => updateSetting("unverified_send_limit", unverifiedLimit, "Limit updated")}>
                        Update
                      </Button>
                    </div>
                  </motion.div>

                  {/* Max Transfer Limit */}
                  <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-4">
                    <Label className="text-admin-text font-medium">Max Transfer Limit (USD)</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={maxTransferLimit}
                        onChange={(e) => setMaxTransferLimit(e.target.value)}
                        className="glass-input text-admin-text"
                      />
                      <Button onClick={() => updateSetting("max_transfer_limit", maxTransferLimit, "Max limit updated")}>
                        Update
                      </Button>
                    </div>
                  </motion.div>

                  {/* Referral Percentage */}
                  <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-4">
                    <Label className="text-admin-text font-medium">Referral Reward %</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={referralPercentage}
                        onChange={(e) => setReferralPercentage(e.target.value)}
                        className="glass-input text-admin-text"
                      />
                      <Button onClick={() => updateSetting("referral_percentage", referralPercentage, "Referral % updated")}>
                        Update
                      </Button>
                    </div>
                  </motion.div>
                </div>

                {/* Toggles */}
                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold text-admin-text">Feature Toggles</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-admin-text">Referral Program</p>
                      <p className="text-xs text-admin-text-muted">Enable/disable referral rewards</p>
                    </div>
                    <Switch checked={referralEnabled} onCheckedChange={toggleReferralProgram} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-admin-text">Card Payments</p>
                      <p className="text-xs text-admin-text-muted">Enable/disable card payment option</p>
                    </div>
                    <Switch checked={cardPaymentsEnabled} onCheckedChange={toggleCardPayments} />
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Support */}
            {activeTab === "support" && (
              <motion.div
                key="support"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-admin-text">Support Settings</h2>

                <motion.div variants={itemVariants} className="glass-card rounded-2xl p-6 space-y-6 max-w-2xl">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-admin-text font-medium">Support Email *</Label>
                      <Input
                        type="email"
                        placeholder="support@example.com"
                        value={supportSettings?.email || ""}
                        onChange={(e) => setSupportSettings(prev => prev ? {...prev, email: e.target.value} : {id: "", email: e.target.value, phone: "", additional_info: ""})}
                        className="mt-2 glass-input text-admin-text"
                      />
                    </div>

                    <div>
                      <Label className="text-admin-text font-medium">Support Phone</Label>
                      <Input
                        type="tel"
                        placeholder="+260-XXX-XXXX"
                        value={supportSettings?.phone || ""}
                        onChange={(e) => setSupportSettings(prev => prev ? {...prev, phone: e.target.value} : {id: "", email: "", phone: e.target.value, additional_info: ""})}
                        className="mt-2 glass-input text-admin-text"
                      />
                    </div>

                    <div>
                      <Label className="text-admin-text font-medium">Additional Info</Label>
                      <Textarea
                        placeholder="Business hours, etc."
                        value={supportSettings?.additional_info || ""}
                        onChange={(e) => setSupportSettings(prev => prev ? {...prev, additional_info: e.target.value} : {id: "", email: "", phone: "", additional_info: e.target.value})}
                        className="mt-2 glass-input text-admin-text min-h-[100px]"
                      />
                    </div>

                    <Button onClick={updateSupportSettings} className="w-full">
                      Save Support Settings
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* KYC Dialog */}
      <Dialog open={kycDialogOpen} onOpenChange={setKycDialogOpen}>
        <DialogContent className="bg-admin-surface border-admin-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-admin-text flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              KYC Details - {selectedKyc?.full_name}
            </DialogTitle>
          </DialogHeader>
          
          {selectedKyc && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-admin-text-muted">Phone</p>
                  <p className="text-sm text-admin-text">{selectedKyc.phone_number}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-admin-text-muted">Country</p>
                  <p className="text-sm text-admin-text">{selectedKyc.country}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-admin-text-muted">ID Type</p>
                  <p className="text-sm text-admin-text">{selectedKyc.id_type || "N/A"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-admin-text-muted">ID Number</p>
                  <p className="text-sm text-admin-text">{selectedKyc.id_number || "N/A"}</p>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-4">
                {selectedKyc.id_document_url && (
                  <div>
                    <p className="text-sm font-medium text-admin-text mb-2">ID Document</p>
                    <img 
                      src={selectedKyc.id_document_url} 
                      alt="ID Document" 
                      className="max-w-full rounded-lg border border-admin-border"
                    />
                  </div>
                )}
                {selectedKyc.selfie_url && (
                  <div>
                    <p className="text-sm font-medium text-admin-text mb-2">Selfie</p>
                    <img 
                      src={selectedKyc.selfie_url} 
                      alt="Selfie" 
                      className="max-w-full rounded-lg border border-admin-border"
                    />
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {!selectedKyc.verified ? (
                  <Button 
                    onClick={() => handleKycAction(selectedKyc.id, "approve")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleKycAction(selectedKyc.id, "unverify")}
                    variant="outline"
                    className="flex-1 border-admin-border text-admin-text gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Unverify
                  </Button>
                )}
                <Button 
                  onClick={() => handleKycAction(selectedKyc.id, "decline")}
                  variant="destructive"
                  className="flex-1 gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Decline
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
