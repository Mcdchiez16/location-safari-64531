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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  useEffect(() => {
    checkAdminAndLoadData();
  }, []);
  const checkAdminAndLoadData = async () => {
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin/login");
        return;
      }

      // Check if user is admin
      const {
        data: roleData,
        error: roleError
      } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id).eq("role", "admin").maybeSingle();
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
      const {
        data: transData,
        error: transError
      } = await supabase.from("transactions").select(`
          *,
          profiles:sender_id (full_name, phone_number)
        `).order("created_at", {
        ascending: false
      });
      if (transError) throw transError;
      setTransactions(transData || []);

      // Load all users
      const {
        data: usersData,
        error: usersError
      } = await supabase.from("profiles").select("*").order("created_at", {
        ascending: false
      });
      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Filter KYC requests (users who have uploaded documents or need verification)
      const kycData = usersData?.filter(user => user.id_document_url || user.selfie_url || !user.verified) || [];
      setKycRequests(kycData);

      // Load settings
      const {
        data: settingsData,
        error: settingsError
      } = await supabase.from("settings").select("*");
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

      // Get referral percentage
      const referralPercentageSetting = settingsData?.find(s => s.key === "referral_percentage");
      if (referralPercentageSetting) {
        setReferralPercentage(referralPercentageSetting.value);
      }

      // Get unverified send limit
      const unverifiedLimitSetting = settingsData?.find(s => s.key === "unverified_send_limit");
      if (unverifiedLimitSetting) {
        setUnverifiedLimit(unverifiedLimitSetting.value);
      }

      // Get max transfer limit
      const maxTransferLimitSetting = settingsData?.find(s => s.key === "max_transfer_limit");
      if (maxTransferLimitSetting) {
        setMaxTransferLimit(maxTransferLimitSetting.value);
      }

      // Get referral enabled setting
      const referralEnabledSetting = settingsData?.find(s => s.key === "referral_enabled");
      if (referralEnabledSetting) {
        setReferralEnabled(referralEnabledSetting.value === "true");
      }

      // Get referral payout threshold
      const referralThresholdSetting = settingsData?.find(s => s.key === "referral_payout_threshold");
      if (referralThresholdSetting) {
        setReferralPayoutThreshold(referralThresholdSetting.value);
      }

      // Get users with earnings above threshold
      const threshold = referralThresholdSetting ? parseFloat(referralThresholdSetting.value) : 50;
      const usersAbove = usersData?.filter(u => (u.referral_earnings || 0) >= threshold) || [];
      setUsersAboveThreshold(usersAbove);

      // Load support settings
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
  const updateTransactionStatus = async (transactionId: string, status: string, notes?: string, reference?: string, proofUrl?: string, tid?: string, sender?: string, rejectionReason?: string) => {
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
        const {
          error
        } = await supabase.from("transactions").update(updateData).eq("id", transactionId);
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
      const updateData: any = {
        status
      };
      if (notes) updateData.admin_notes = notes;
      if (reference) updateData.payment_reference = reference;
      if (proofUrl) updateData.admin_payment_proof_url = proofUrl;
      if (status === "paid" || status === "deposited") {
        updateData.payment_date = new Date().toISOString();
        updateData.tid = tid;
        updateData.admin_notes = sender ? `Sender: ${sender}${notes ? ` | ${notes}` : ''}` : notes;
      }
      const {
        error
      } = await supabase.from("transactions").update(updateData).eq("id", transactionId);
      if (error) throw error;

      // Process referral reward if transaction is deposited
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
      const {
        error
      } = await supabase.from("profiles").update({
        verified: action === "approve"
      }).eq("id", userId);
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
    
    // Load user's transactions
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
  const updateTransferFee = async () => {
    const feeValue = parseFloat(newTransferFee);
    if (isNaN(feeValue) || feeValue < 0 || feeValue > 100) {
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }
    try {
      const {
        error
      } = await supabase.from("settings").update({
        value: newTransferFee
      }).eq("key", "transfer_fee_percentage");
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
      const {
        error
      } = await supabase.from("settings").update({
        value: paymentNumber
      }).eq("key", "payment_number");
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
      const {
        error
      } = await supabase.from("settings").update({
        value: paymentRecipientName
      }).eq("key", "payment_recipient_name");
      if (error) throw error;
      toast.success("Payment recipient name updated successfully");
      loadData();
    } catch (error) {
      console.error("Error updating payment recipient name:", error);
      toast.error("Failed to update payment recipient name");
    }
  };
  const updateReferralPercentage = async () => {
    const percentValue = parseFloat(referralPercentage);
    if (isNaN(percentValue) || percentValue < 0 || percentValue > 100) {
      toast.error("Please enter a valid percentage between 0 and 100");
      return;
    }
    try {
      const {
        error
      } = await supabase.from("settings").update({
        value: referralPercentage
      }).eq("key", "referral_percentage");
      if (error) throw error;
      toast.success("Referral percentage updated successfully");
      loadData();
    } catch (error) {
      console.error("Error updating referral percentage:", error);
      toast.error("Failed to update referral percentage");
    }
  };
  const updateUnverifiedLimit = async () => {
    const limit = parseFloat(unverifiedLimit);
    if (isNaN(limit) || limit < 0) {
      toast.error("Please enter a valid non-negative amount");
      return;
    }
    try {
      const { error } = await supabase.from("settings").update({
        value: unverifiedLimit
      }).eq("key", "unverified_send_limit");
      if (error) throw error;
      toast.success("Unverified send limit updated successfully");
      loadData();
    } catch (error) {
      console.error("Error updating unverified send limit:", error);
      toast.error("Failed to update unverified send limit");
    }
  };

  const updateMaxTransferLimit = async () => {
    const limit = parseFloat(maxTransferLimit);
    if (isNaN(limit) || limit <= 0) {
      toast.error("Please enter a valid positive amount");
      return;
    }
    try {
      const { error } = await supabase.from("settings").update({
        value: maxTransferLimit
      }).eq("key", "max_transfer_limit");
      if (error) throw error;
      toast.success("Maximum transfer limit updated successfully");
      loadData();
    } catch (error) {
      console.error("Error updating max transfer limit:", error);
      toast.error("Failed to update max transfer limit");
    }
  };

  const toggleReferralProgram = async () => {
    try {
      const newValue = !referralEnabled;
      const { error } = await supabase.from("settings").update({
        value: newValue.toString()
      }).eq("key", "referral_enabled");
      if (error) throw error;
      setReferralEnabled(newValue);
      toast.success(`Referral program ${newValue ? "enabled" : "disabled"}`);
      loadData();
    } catch (error) {
      console.error("Error toggling referral program:", error);
      toast.error("Failed to update referral program status");
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

  const updatePayoutThreshold = async () => {
    const threshold = parseFloat(referralPayoutThreshold);
    if (isNaN(threshold) || threshold < 0) {
      toast.error("Please enter a valid non-negative amount");
      return;
    }
    try {
      const { error } = await supabase.from("settings").update({
        value: referralPayoutThreshold
      }).eq("key", "referral_payout_threshold");
      if (error) throw error;
      toast.success("Payout threshold updated successfully");
      loadData();
    } catch (error) {
      console.error("Error updating payout threshold:", error);
      toast.error("Failed to update payout threshold");
    }
  };
  const processReferralReward = async (transactionId: string) => {
    try {
      // Get transaction details
      const { data: transaction } = await supabase
        .from("transactions")
        .select("*, receiver_phone, amount")
        .eq("id", transactionId)
        .single();

      if (!transaction) return;

      // Get receiver profile to find who referred them
      const { data: receiverProfile } = await supabase
        .from("profiles")
        .select("id, referred_by")
        .eq("phone_number", transaction.receiver_phone)
        .maybeSingle();

      if (!receiverProfile || !receiverProfile.referred_by) {
        // No referrer, skip reward
        return;
      }

      // Get referral percentage from settings
      const { data: setting } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "referral_percentage")
        .single();

      const percentage = setting ? parseFloat(setting.value) : 5;
      const rewardAmount = (transaction.amount * percentage) / 100;

      // Check if referral reward already exists for this transaction
      const { data: existingReward } = await supabase
        .from("referral_transactions")
        .select("id")
        .eq("transaction_id", transactionId)
        .maybeSingle();

      if (existingReward) {
        // Reward already processed
        return;
      }

      // Create referral transaction record
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

      // Update referrer's earnings
      const { data: referrerProfile } = await supabase
        .from("profiles")
        .select("referral_earnings")
        .eq("id", receiverProfile.referred_by)
        .single();

      if (referrerProfile) {
        await supabase
          .from("profiles")
          .update({
            referral_earnings: (referrerProfile.referral_earnings || 0) + rewardAmount
          })
          .eq("id", receiverProfile.referred_by);
      }

      console.log(`Referral reward of ${rewardAmount} credited to referrer`);
    } catch (error) {
      console.error("Error processing referral reward:", error);
      // Don't throw - let the transaction update succeed even if referral fails
    }
  };
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) || transaction.receiver_phone.includes(searchQuery) || (transaction.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
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
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading admin panel...</p>
      </div>;
  }
  if (!isAdmin) {
    return null;
  }
  return <div className="min-h-screen bg-[hsl(220,15%,12%)]">
      {/* Header */}
      <header className="bg-[hsl(220,15%,14%)] border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 md:space-x-3 min-w-0">
              <div className="min-w-0">
                <h1 className="text-lg md:text-2xl font-bold text-white truncate">Tangila Pay Admin</h1>
                <p className="text-xs md:text-sm text-white/60 hidden sm:block">Dashboard & Management</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-1 md:gap-2 border-white/20 hover:bg-white/10 text-xs md:text-sm h-8 md:h-10 px-2 md:px-4 shrink-0 text-slate-800">
              <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6 mb-4 md:mb-8">
          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-white/80">Total Transactions</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-blue-400" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-white/80">Pending</CardTitle>
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-yellow-400" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold text-yellow-400">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-white/80">Completed</CardTitle>
              <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold text-green-400">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-white/80">Total Users</CardTitle>
              <Users className="h-3 w-3 md:h-4 md:w-4 text-indigo-400" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-white/80">Pending KYC</CardTitle>
              <FileText className="h-3 w-3 md:h-4 md:w-4 text-orange-400" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold text-orange-400">{stats.pendingKyc}</div>
            </CardContent>
          </Card>

          <Card className="bg-[hsl(220,15%,16%)] border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium text-white/80">Revenue (Fees)</CardTitle>
              <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
            </CardHeader>
            <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold text-white">${stats.revenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="pending" className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 lg:w-auto bg-[hsl(220,15%,16%)] border border-white/10 h-auto">
            <TabsTrigger value="pending" className="gap-1 text-xs md:text-sm data-[state=active]:bg-[hsl(220,15%,20%)] data-[state=active]:text-white text-white/60 py-2">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs hidden sm:inline-flex">{stats.pending}</Badge>
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden">Pend</span>
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs md:text-sm data-[state=active]:bg-[hsl(220,15%,20%)] data-[state=active]:text-white text-white/60 py-2">
              <span className="hidden sm:inline">All Transactions</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>
            <TabsTrigger value="kyc" className="text-xs md:text-sm data-[state=active]:bg-[hsl(220,15%,20%)] data-[state=active]:text-white text-white/60 py-2">KYC</TabsTrigger>
            <TabsTrigger value="users" className="text-xs md:text-sm data-[state=active]:bg-[hsl(220,15%,20%)] data-[state=active]:text-white text-white/60 py-2">Users</TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm data-[state=active]:bg-[hsl(220,15%,20%)] data-[state=active]:text-white text-white/60 py-2">
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Set</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="text-xs md:text-sm data-[state=active]:bg-[hsl(220,15%,20%)] data-[state=active]:text-white text-white/60 py-2">
              <span className="hidden sm:inline">Support Settings</span>
              <span className="sm:hidden">Support</span>
            </TabsTrigger>
          </TabsList>

          {/* Pending Transactions Tab */}
          <TabsContent value="pending" className="space-y-4 md:space-y-6">
            <Card className="border-yellow-500/30 shadow-lg bg-[hsl(220,15%,16%)] border-white/10">
              <CardHeader className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-white/10 p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-white text-base md:text-lg">
                  <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-yellow-400" />
                  Pending Transactions
                </CardTitle>
                <CardDescription className="text-white/60 text-xs md:text-sm">Transactions awaiting approval and payment</CardDescription>
                
                {/* Search */}
                <div className="mt-3 md:mt-4">
                  <Input placeholder="Search by name or phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full text-sm" />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                <div className="space-y-3 md:space-y-4">
                  {transactions.filter(t => t.status === "pending").filter(transaction => {
                  const matchesSearch = transaction.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) || transaction.receiver_phone.includes(searchQuery) || (transaction.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
                  return matchesSearch;
                }).length === 0 ? <p className="text-center text-muted-foreground py-6 md:py-8 text-sm">No pending transactions</p> : transactions.filter(t => t.status === "pending").filter(transaction => {
                  const matchesSearch = transaction.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) || transaction.receiver_phone.includes(searchQuery) || (transaction.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
                  return matchesSearch;
                }).map(transaction => <Card key={transaction.id} className="p-3 md:p-6 border-l-4 border-l-yellow-500 bg-gradient-to-r from-card to-yellow-50/30 dark:to-yellow-950/10">
                        <div className="flex flex-col gap-3 md:gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h4 className="font-semibold text-sm md:text-lg text-foreground">
                                {transaction.profiles?.full_name || "Unknown Sender"}
                              </h4>
                              {getStatusBadge(transaction.status)}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 md:gap-2 text-xs md:text-sm">
                              <p className="text-muted-foreground">
                                <strong>To:</strong> {transaction.receiver_name}
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Phone:</strong> {transaction.receiver_phone}
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Country:</strong> {transaction.receiver_country}
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Amount:</strong> ${transaction.amount.toFixed(2)} USD
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Recipient gets:</strong> {transaction.receiver_country === 'Zambia' 
                                  ? `${(transaction.amount * (transaction.exchange_rate || 22)).toFixed(2)} ZMW`
                                  : `$${transaction.amount.toFixed(2)} USD`}
                              </p>
                              <p className="text-muted-foreground">
                                <strong>Fee:</strong> ${transaction.fee.toFixed(2)} USD
                              </p>
                              {transaction.sender_number && <p className="text-muted-foreground">
                                  <strong>Sender #:</strong> {transaction.sender_number}
                                </p>}
                              {transaction.transaction_id && <p className="text-muted-foreground">
                                  <strong>Transaction ID:</strong> {transaction.transaction_id}
                                </p>}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button size="sm" onClick={() => setSelectedTransaction(transaction)} className="bg-green-500 hover:bg-green-600 gap-2 text-xs md:text-sm h-8 md:h-9">
                              <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                              Process Payment
                            </Button>
                          </div>
                        </div>
                      </Card>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Transactions Tab */}
          <TabsContent value="all" className="space-y-4 md:space-y-6">
            <Card className="bg-[hsl(220,15%,16%)] border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg text-white">All Transactions</CardTitle>
                <CardDescription className="text-white/60 text-xs md:text-sm">Complete transaction history</CardDescription>
                
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-3 md:mt-4">
                  <div className="flex-1">
                    <Input placeholder="Search by name or phone..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full text-sm" />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-40 md:w-48 text-sm">
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
              <CardContent className="p-3 md:p-6">
                <div className="space-y-3 md:space-y-4">
                  {filteredTransactions.length === 0 ? <p className="text-center text-muted-foreground py-6 md:py-8 text-sm">No transactions found</p> : filteredTransactions.map(transaction => <Card key={transaction.id} className="p-3 md:p-4 bg-card">
                        <div className="flex flex-col gap-3 md:gap-4">
                          <div className="space-y-1.5 md:space-y-2 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h4 className="font-semibold text-sm md:text-base text-foreground">
                                {transaction.profiles?.full_name || "Unknown Sender"}
                              </h4>
                              {getStatusBadge(transaction.status)}
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              To: {transaction.receiver_name} ({transaction.receiver_phone}) - {transaction.receiver_country}
                            </p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              Amount: ${transaction.amount.toFixed(2)} USD | Recipient gets: {transaction.receiver_country === 'Zambia' 
                                ? `${(transaction.amount * (transaction.exchange_rate || 22)).toFixed(2)} ZMW`
                                : `$${transaction.amount.toFixed(2)} USD`}
                            </p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              Fee: ${transaction.fee.toFixed(2)} USD
                            </p>
                            {transaction.sender_number && <p className="text-xs md:text-sm text-muted-foreground">
                                <strong>Sender #:</strong> {transaction.sender_number}
                              </p>}
                            {transaction.transaction_id && <p className="text-xs md:text-sm text-muted-foreground">
                                <strong>Transaction ID:</strong> {transaction.transaction_id}
                              </p>}
                            {transaction.tid && <p className="text-xs md:text-sm font-semibold text-primary">
                                <strong>TID:</strong> {transaction.tid}
                              </p>}
                            <p className="text-xs text-muted-foreground">
                              {new Date(transaction.created_at).toLocaleString()}
                            </p>
                            {transaction.admin_notes && <p className="text-xs md:text-sm text-muted-foreground italic">
                                Notes: {transaction.admin_notes}
                              </p>}
                          </div>
                          
                           <div className="flex flex-col gap-2">
                            {transaction.payment_proof_url && <Button size="sm" variant="outline" onClick={() => window.open(transaction.payment_proof_url, "_blank")} className="text-xs md:text-sm h-8 md:h-9">
                                <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                View Sender Proof
                              </Button>}
                            {transaction.status === "pending" && <Button size="sm" onClick={() => setSelectedTransaction(transaction)} className="bg-green-500 hover:bg-green-600 text-xs md:text-sm h-8 md:h-9">
                               <CheckCircle className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                Mark as Deposited
                              </Button>}
                            {transaction.status !== "pending" && transaction.admin_payment_proof_url && <Button size="sm" variant="outline" onClick={() => window.open(transaction.admin_payment_proof_url, "_blank")} className="text-xs md:text-sm h-8 md:h-9">
                                <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                                View Payment Proof
                              </Button>}
                          </div>
                        </div>
                      </Card>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* KYC Verification Tab */}
          <TabsContent value="kyc" className="space-y-4 md:space-y-6">
            <Card className="bg-[hsl(220,15%,16%)] border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg text-white">User Management & KYC</CardTitle>
                <CardDescription className="text-white/60 text-xs md:text-sm">Review user information and manage verification status</CardDescription>
                
                {/* Search */}
                <div className="mt-3 md:mt-4">
                  <Input 
                    placeholder="Search by name, phone, or ID number..." 
                    value={kycSearchQuery} 
                    onChange={e => setKycSearchQuery(e.target.value)} 
                    className="w-full text-sm" 
                  />
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                <div className="space-y-3 md:space-y-4">
                  {kycRequests
                    .filter(kyc => 
                      kyc.full_name.toLowerCase().includes(kycSearchQuery.toLowerCase()) ||
                      kyc.phone_number.includes(kycSearchQuery) ||
                      (kyc.id_number && kyc.id_number.toLowerCase().includes(kycSearchQuery.toLowerCase()))
                    )
                    .length === 0 ? <p className="text-center text-muted-foreground py-6 md:py-8 text-sm">No users found</p> : kycRequests
                    .filter(kyc => 
                      kyc.full_name.toLowerCase().includes(kycSearchQuery.toLowerCase()) ||
                      kyc.phone_number.includes(kycSearchQuery) ||
                      (kyc.id_number && kyc.id_number.toLowerCase().includes(kycSearchQuery.toLowerCase()))
                    )
                    .map(kyc => <Card key={kyc.id} className="p-3 md:p-4 bg-card">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
                          <div className="flex items-center gap-3 md:gap-4 min-w-0">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm md:text-base text-foreground truncate">{kyc.full_name}</p>
                              <p className="text-xs md:text-sm text-muted-foreground">{kyc.phone_number} • {kyc.country}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {kyc.id_type && kyc.id_number ? `${kyc.id_type} - ${kyc.id_number}` : "No ID info"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Balance: ${kyc.balance.toFixed(2)}
                              </p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                {kyc.verified ? <span className="text-xs px-2 py-0.5 md:py-1 rounded-full bg-green-500/10 text-green-600 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" />
                                    Verified
                                  </span> : <span className="text-xs px-2 py-0.5 md:py-1 rounded-full bg-yellow-500/10 text-yellow-600">
                                    Pending
                                  </span>}
                                {(kyc.id_document_url || kyc.selfie_url) && <span className="text-xs px-2 py-0.5 md:py-1 rounded-full bg-blue-500/10 text-blue-600 flex items-center gap-1">
                                    <FileText className="h-3 w-3" />
                                    <span className="hidden sm:inline">Documents</span>
                                  </span>}
                              </div>
                            </div>
                          </div>
                          <Button onClick={() => viewKycDetails(kyc)} variant="outline" size="sm" className="gap-2 text-xs md:text-sm h-8 md:h-9 shrink-0">
                            <Eye className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">View Details</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                        </div>
                      </Card>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4 md:space-y-6">
            <Card className="bg-[hsl(220,15%,16%)] border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg text-white">User Management</CardTitle>
                <CardDescription className="text-white/60 text-xs md:text-sm">View and manage all registered users</CardDescription>
              </CardHeader>
              <CardContent className="p-3 md:p-6">
                <div className="space-y-3 md:space-y-4">
                  {users.length === 0 ? <p className="text-center text-muted-foreground py-6 md:py-8 text-sm">No users found</p> : users.map(user => <Card key={user.id} className="p-3 md:p-4 bg-card">
                        <div className="space-y-3">
                          {/* Basic Info */}
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold text-sm md:text-base text-foreground">{user.full_name}</h4>
                                {user.verified ? <Badge className="bg-green-500 text-xs">Verified</Badge> : <Badge className="bg-yellow-500 text-xs">Unverified</Badge>}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm">
                                <div>
                                  <span className="text-muted-foreground">Phone:</span>
                                  <span className="ml-2 font-medium">{user.phone_number}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Country:</span>
                                  <span className="ml-2 font-medium">{user.country}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Balance:</span>
                                  <span className="ml-2 font-medium text-green-600">${user.balance.toFixed(2)}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Joined:</span>
                                  <span className="ml-2 font-medium">{new Date(user.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => viewKycDetails(user)}
                              className="gap-2 text-xs"
                            >
                              <Eye className="h-3 w-3" />
                              View Details
                            </Button>
                          </div>
                          
                          {/* Additional Info */}
                          <div className="pt-3 border-t border-border/50">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Account Type:</span>
                                <span className="ml-2 font-medium">{user.account_type || "Standard"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Referral Code:</span>
                                <span className="ml-2 font-medium font-mono">{user.referral_code || "N/A"}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Referral Earnings:</span>
                                <span className="ml-2 font-medium text-emerald-600">${(user.referral_earnings || 0).toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* KYC Info */}
                          {(user.id_type || user.id_number || user.id_document_url || user.selfie_url) && (
                            <div className="pt-3 border-t border-border/50">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                {user.id_type && (
                                  <div>
                                    <span className="text-muted-foreground">ID Type:</span>
                                    <span className="ml-2 font-medium">{user.id_type}</span>
                                  </div>
                                )}
                                {user.id_number && (
                                  <div>
                                    <span className="text-muted-foreground">ID Number:</span>
                                    <span className="ml-2 font-medium">{user.id_number}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-muted-foreground">ID Document:</span>
                                  <span className="ml-2 font-medium">{user.id_document_url ? "✓ Uploaded" : "Not uploaded"}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Selfie:</span>
                                  <span className="ml-2 font-medium">{user.selfie_url ? "✓ Uploaded" : "Not uploaded"}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 md:space-y-6">
            <Card className="bg-[hsl(220,15%,16%)] border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-base md:text-lg text-white">Platform Settings</CardTitle>
                <CardDescription className="text-white/60 text-xs md:text-sm">Configure platform parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-3 md:p-6">
                <div>
                  <Label htmlFor="transfer_fee" className="text-sm md:text-base text-white">Transfer Fee Percentage</Label>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-2">
                    <Input id="transfer_fee" type="number" step="0.01" min="0" max="100" value={newTransferFee} onChange={e => setNewTransferFee(e.target.value)} placeholder="e.g., 2.5" className="text-sm" />
                    <Button onClick={updateTransferFee} className="min-w-[100px] text-sm md:text-base h-9 md:h-10">
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    Current fee: {newTransferFee}%
                  </p>
                </div>

                <div>
                  <Label htmlFor="payment_number" className="text-sm md:text-base text-white">Payment Number (For receiving funds)</Label>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-2">
                    <Input id="payment_number" type="text" value={paymentNumber} onChange={e => setPaymentNumber(e.target.value)} placeholder="e.g., +263 77 123 4567" className="text-sm" />
                    <Button onClick={updatePaymentNumber} className="min-w-[100px] text-sm md:text-base h-9 md:h-10">
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    This number will be shown to senders for payment
                  </p>
                </div>

                <div>
                  <Label htmlFor="payment_recipient_name" className="text-sm md:text-base text-white">Payment Recipient Name</Label>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-2">
                    <Input id="payment_recipient_name" type="text" value={paymentRecipientName} onChange={e => setPaymentRecipientName(e.target.value)} placeholder="e.g., John Doe" className="text-sm" />
                    <Button onClick={updatePaymentRecipientName} className="min-w-[100px] text-sm md:text-base h-9 md:h-10">
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    This name will be displayed to senders as the payment recipient
                  </p>
                </div>

                <div>
                  <Label htmlFor="unverified_limit" className="text-sm md:text-base text-white">Unverified Send Limit (USD)</Label>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-2">
                    <Input id="unverified_limit" type="number" min="0" step="0.01" value={unverifiedLimit} onChange={e => setUnverifiedLimit(e.target.value)} placeholder="e.g., 20" className="text-sm" />
                    <Button onClick={updateUnverifiedLimit} className="min-w-[100px] text-sm md:text-base h-9 md:h-10">
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    Maximum USD amount unverified users can send
                  </p>
                </div>

                <div>
                  <Label htmlFor="referral_percentage" className="text-sm md:text-base text-white">Referral Reward Percentage</Label>
                  <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-2">
                    <Input id="referral_percentage" type="number" min="0" max="100" step="0.1" value={referralPercentage} onChange={e => setReferralPercentage(e.target.value)} placeholder="e.g., 5" className="text-sm" />
                    <Button onClick={updateReferralPercentage} className="min-w-[100px] text-sm md:text-base h-9 md:h-10">
                      Update
                    </Button>
                  </div>
                  <p className="text-xs text-white/60 mt-2">
                    Percentage of transaction amount that referrers earn when their referred users receive money
                  </p>
                </div>

                 <div>
                   <Label htmlFor="max_transfer_limit" className="text-sm md:text-base text-white">Maximum Transfer Limit (USD)</Label>
                   <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-2">
                     <Input id="max_transfer_limit" type="number" min="1" step="100" value={maxTransferLimit} onChange={e => setMaxTransferLimit(e.target.value)} placeholder="e.g., 10000" className="text-sm" />
                     <Button onClick={updateMaxTransferLimit} className="min-w-[100px] text-sm md:text-base h-9 md:h-10">
                       Update
                     </Button>
                   </div>
                   <p className="text-xs text-white/60 mt-2">
                     Maximum USD amount any user can transfer in a single transaction
                   </p>
                 </div>

                 <div className="pt-4 border-t border-white/10">
                   <h3 className="text-base md:text-lg font-semibold text-white mb-4">Referral Program Management</h3>
                   
                   <div className="space-y-4">
                     <div>
                       <Label htmlFor="referral_enabled" className="text-sm md:text-base text-white">Referral Program Status</Label>
                       <div className="flex items-center gap-3 mt-2">
                         <Button 
                           onClick={toggleReferralProgram}
                           variant={referralEnabled ? "default" : "outline"}
                           className="min-w-[120px] text-sm md:text-base h-9 md:h-10"
                         >
                           {referralEnabled ? "Enabled" : "Disabled"}
                         </Button>
                         <span className="text-xs text-white/60">
                           {referralEnabled ? "Users can earn referral rewards" : "Referral program is disabled"}
                         </span>
                       </div>
                     </div>

                     <div>
                       <Label htmlFor="payout_threshold" className="text-sm md:text-base text-white">Payout Threshold (USD)</Label>
                       <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-2">
                         <Input 
                           id="payout_threshold" 
                           type="number" 
                           min="0" 
                           step="10" 
                           value={referralPayoutThreshold} 
                           onChange={e => setReferralPayoutThreshold(e.target.value)} 
                           placeholder="e.g., 50" 
                           className="text-sm" 
                         />
                         <Button onClick={updatePayoutThreshold} className="min-w-[100px] text-sm md:text-base h-9 md:h-10">
                           Update
                         </Button>
                       </div>
                       <p className="text-xs text-white/60 mt-2">
                         Minimum amount users must earn before appearing in payout notifications
                       </p>
                     </div>

                     {usersAboveThreshold.length > 0 && (
                       <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                         <h4 className="text-sm md:text-base font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                           <DollarSign className="h-4 w-4" />
                           Users Ready for Payout ({usersAboveThreshold.length})
                         </h4>
                         <div className="space-y-2 max-h-60 overflow-y-auto">
                           {usersAboveThreshold.map(user => (
                             <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10">
                               <div>
                                 <p className="text-sm font-medium text-white">{user.full_name}</p>
                                 <p className="text-xs text-white/60">{user.phone_number}</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-sm font-bold text-emerald-400">${(user.referral_earnings || 0).toFixed(2)}</p>
                                 <p className="text-xs text-white/60">Referral Code: {user.referral_code}</p>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     )}
                   </div>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support">
            <Card className="bg-[hsl(220,15%,16%)] border-white/10">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-white text-base md:text-lg">Support Settings</CardTitle>
                <CardDescription className="text-white/60 text-sm">
                  Manage customer support contact information displayed on the Help & Support page
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <Label htmlFor="support_email" className="text-white text-sm md:text-base">Support Email *</Label>
                    <Input
                      id="support_email"
                      type="email"
                      placeholder="support@example.com"
                      value={supportSettings?.email || ""}
                      onChange={(e) => setSupportSettings(prev => prev ? {...prev, email: e.target.value} : {id: "", email: e.target.value, phone: "", additional_info: ""})}
                      className="mt-2 h-10 md:h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="support_phone" className="text-white text-sm md:text-base">Support Phone</Label>
                    <Input
                      id="support_phone"
                      type="tel"
                      placeholder="+260-XXX-XXXX"
                      value={supportSettings?.phone || ""}
                      onChange={(e) => setSupportSettings(prev => prev ? {...prev, phone: e.target.value} : {id: "", email: "", phone: e.target.value, additional_info: ""})}
                      className="mt-2 h-10 md:h-11"
                    />
                  </div>

                  <div>
                    <Label htmlFor="support_hours" className="text-white text-sm md:text-base">Support Hours / Additional Info</Label>
                    <Textarea
                      id="support_hours"
                      placeholder="Available Mon-Fri 9AM-5PM CAT"
                      value={supportSettings?.additional_info || ""}
                      onChange={(e) => setSupportSettings(prev => prev ? {...prev, additional_info: e.target.value} : {id: "", email: "", phone: "", additional_info: e.target.value})}
                      className="mt-2 min-h-[80px] md:min-h-[100px]"
                    />
                    <p className="text-xs text-white/60 mt-1">
                      This information will be displayed to users on the Help & Support page
                    </p>
                  </div>

                  <Button 
                    onClick={updateSupportSettings} 
                    className="w-full md:w-auto h-10 md:h-11"
                  >
                    Save Support Settings
                  </Button>
                </div>

                {/* Preview Section */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-white font-semibold mb-4 text-sm md:text-base">Preview</h3>
                  <div className="space-y-3 bg-white/5 p-4 rounded-lg border border-white/10">
                    <div>
                      <p className="text-white/60 text-xs md:text-sm">Email Support</p>
                      <p className="text-white font-medium text-sm md:text-base">{supportSettings?.email || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs md:text-sm">Phone Support</p>
                      <p className="text-white font-medium text-sm md:text-base">{supportSettings?.phone || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-white/60 text-xs md:text-sm">Support Hours</p>
                      <p className="text-white font-medium text-sm md:text-base whitespace-pre-wrap">{supportSettings?.additional_info || "Not set"}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Payment Confirmation Modal - Separate from tabs */}
        {selectedTransaction && <Card className="mt-4 md:mt-6 border-2 border-green-500 shadow-xl bg-[hsl(220,15%,16%)]">
            <CardHeader className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 md:p-6">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg text-white">
                <CheckCircle className="h-5 w-5 md:h-6 md:w-6 text-green-400" />
                Confirm Payment Completion
              </CardTitle>
              <CardDescription className="text-sm md:text-base text-white/80">
                Transaction to <strong>{selectedTransaction.receiver_name}</strong>
              </CardDescription>
              <div className="mt-3 md:mt-4 p-3 md:p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="grid grid-cols-2 gap-2 md:gap-3 text-xs md:text-sm">
                  <div>
                    <p className="text-white/60">Amount</p>
                    <p className="font-semibold text-white">${selectedTransaction.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-white/60">Fee</p>
                    <p className="font-semibold text-white">${selectedTransaction.fee.toFixed(2)}</p>
                  </div>
                  {selectedTransaction.sender_number && <div className="col-span-2">
                      <p className="text-white/60">Sender Number</p>
                      <p className="font-semibold text-white">{selectedTransaction.sender_number}</p>
                    </div>}
                  {selectedTransaction.transaction_id && <div className="col-span-2">
                      <p className="text-white/60">Transaction ID</p>
                      <p className="font-semibold text-white truncate">{selectedTransaction.transaction_id}</p>
                    </div>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4 pt-4 md:pt-6 p-3 md:p-6">
              <div>
                <Label htmlFor="sender_name" className="text-sm md:text-base font-semibold text-white">Sender Name *</Label>
                <Input id="sender_name" placeholder="Enter the name of who made the payment" value={senderName} onChange={e => setSenderName(e.target.value)} className="mt-2 h-10 md:h-12 text-sm" required />
              </div>
              <div>
                <Label htmlFor="manual_tid" className="text-sm md:text-base font-semibold text-white">TID Number *</Label>
                <Input id="manual_tid" placeholder="Enter TID manually (e.g., TIDXXX123)" value={manualTid} onChange={e => setManualTid(e.target.value)} className="mt-2 h-10 md:h-12 text-sm" required />
                <p className="text-xs text-white/60 mt-1">This TID will be sent to the sender and receiver</p>
              </div>
              <div>
                <Label htmlFor="rejection_reason" className="text-sm md:text-base font-semibold text-white">Rejection Reason (Optional)</Label>
                <Textarea id="rejection_reason" placeholder="Enter reason for rejection if rejecting this payment..." value={rejectionReason} onChange={e => setRejectionReason(e.target.value)} className="mt-2 min-h-[60px] md:min-h-[80px] text-sm" />
                <p className="text-xs text-white/60 mt-1">This will be visible to the sender</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-3 md:pt-4">
                <Button onClick={() => updateTransactionStatus(selectedTransaction.id, "deposited", undefined, "", "", manualTid, senderName)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 h-10 md:h-12 text-sm md:text-base">
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Mark as Deposited
                </Button>
                <Button onClick={() => updateTransactionStatus(selectedTransaction.id, "rejected", undefined, "", "", "", "", rejectionReason)} variant="destructive" className="flex-1 h-10 md:h-12 text-sm md:text-base">
                  <XCircle className="h-4 w-4 md:h-5 md:w-5 mr-2" />
                  Reject Payment
                </Button>
                <Button variant="outline" onClick={() => {
              setSelectedTransaction(null);
              setManualTid("");
              setSenderName("");
              setRejectionReason("");
            }} className="h-10 md:h-12 text-sm md:text-base">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>}

        {/* KYC Details Dialog */}
        <Dialog open={kycDialogOpen} onOpenChange={setKycDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6">
            <DialogHeader>
              <DialogTitle className="text-base md:text-lg">User Details & Verification</DialogTitle>
            </DialogHeader>
            {selectedKyc && <div className="space-y-4 md:space-y-6">
                {/* User Information */}
                <Card className="p-4 bg-muted/50">
                  <h3 className="font-semibold text-sm md:text-base mb-3">User Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">Full Name</p>
                      <p className="font-semibold text-sm md:text-base">{selectedKyc.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">Phone Number</p>
                      <p className="font-semibold text-sm md:text-base">{selectedKyc.phone_number}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">Country</p>
                      <p className="font-semibold text-sm md:text-base">{selectedKyc.country}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">Balance</p>
                      <p className="font-semibold text-sm md:text-base text-green-600">${selectedKyc.balance.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">Account Type</p>
                      <p className="font-semibold text-sm md:text-base">{selectedKyc.account_type || "Standard"}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">Member Since</p>
                      <p className="font-semibold text-sm md:text-base">{new Date(selectedKyc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Card>

                {/* KYC Information */}
                <Card className="p-4 bg-muted/50">
                  <h3 className="font-semibold text-sm md:text-base mb-3">Identification Documents</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">ID Type</p>
                      <p className="font-semibold text-sm md:text-base">{selectedKyc.id_type || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">ID Number</p>
                      <p className="font-semibold text-sm md:text-base">{selectedKyc.id_number || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">Verification Status</p>
                      <p className="font-semibold text-sm md:text-base">
                        {selectedKyc.verified ? <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                            Verified
                          </span> : <span className="text-yellow-600">Pending Verification</span>}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 md:space-y-4">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">ID Document</p>
                      {selectedKyc.id_document_url ? <img src={selectedKyc.id_document_url} alt="ID Document" className="w-full max-w-md rounded-lg border" /> : <p className="text-xs md:text-sm text-muted-foreground">No document uploaded</p>}
                    </div>

                    <div>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Selfie</p>
                      {selectedKyc.selfie_url ? <img src={selectedKyc.selfie_url} alt="Selfie" className="w-full max-w-md rounded-lg border" /> : <p className="text-xs md:text-sm text-muted-foreground">No selfie uploaded</p>}
                    </div>
                  </div>
                </Card>

                {/* Recent Transactions */}
                <Card className="p-4 bg-muted/50">
                  <h3 className="font-semibold text-sm md:text-base mb-3">Recent Transactions</h3>
                  {selectedUserTransactions.length === 0 ? (
                    <p className="text-xs md:text-sm text-muted-foreground">No transactions found</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUserTransactions.map(trans => (
                        <div key={trans.id} className="p-2 bg-background rounded text-xs md:text-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">{trans.receiver_name}</p>
                              <p className="text-muted-foreground">${trans.amount.toFixed(2)} USD</p>
                            </div>
                            {getStatusBadge(trans.status)}
                          </div>
                          <p className="text-muted-foreground text-xs mt-1">
                            {new Date(trans.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-3 md:pt-4">
                  {!selectedKyc.verified ? (
                    <>
                      <Button onClick={() => handleKycAction(selectedKyc.id, "approve")} className="flex-1 bg-green-600 hover:bg-green-700 gap-2 h-10 md:h-11 text-sm md:text-base">
                        <CheckCircle className="h-4 w-4" />
                        Approve & Verify
                      </Button>
                      <Button onClick={() => handleKycAction(selectedKyc.id, "decline")} variant="destructive" className="flex-1 gap-2 h-10 md:h-11 text-sm md:text-base">
                        <XCircle className="h-4 w-4" />
                        Decline
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => handleKycAction(selectedKyc.id, "unverify")} variant="destructive" className="flex-1 gap-2 h-10 md:h-11 text-sm md:text-base">
                      <XCircle className="h-4 w-4" />
                      Unverify User
                    </Button>
                  )}
                </div>
              </div>}
          </DialogContent>
        </Dialog>
      </div>
    </div>;
};
export default Admin;