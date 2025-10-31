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
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Users, TrendingUp, Settings as SettingsIcon, Search, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  created_at: string;
  profiles?: { full_name: string; phone_number: string };
}

interface User {
  id: string;
  full_name: string;
  phone_number: string;
  country: string;
  balance: number;
  verified: boolean;
  created_at: string;
}

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, revenue: 0, totalUsers: 0 });
  const [newTransferFee, setNewTransferFee] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

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

      // Load users
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;
      setUsers(usersData || []);

      // Load settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("settings")
        .select("*");

      if (settingsError) throw settingsError;
      setSettings(settingsData || []);

      // Calculate stats
      const totalTrans = transData?.length || 0;
      const pendingTrans = transData?.filter(t => t.status === "pending").length || 0;
      const completedTrans = transData?.filter(t => t.status === "completed").length || 0;
      const revenue = transData?.reduce((sum, t) => sum + (t.fee || 0), 0) || 0;

      setStats({
        total: totalTrans,
        pending: pendingTrans,
        completed: completedTrans,
        revenue: revenue,
        totalUsers: usersData?.length || 0
      });

      // Get current transfer fee
      const transferFeeSetting = settingsData?.find(s => s.key === "transfer_fee_percentage");
      if (transferFeeSetting) {
        setNewTransferFee(transferFeeSetting.value);
      }

    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const updateTransactionStatus = async (transactionId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { status };
      if (notes) updateData.admin_notes = notes;

      const { error } = await supabase
        .from("transactions")
        .update(updateData)
        .eq("id", transactionId);

      if (error) throw error;

      toast.success(`Transaction ${status}`);
      loadData();
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Failed to update transaction");
    }
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
        return <Badge className="bg-green-500">Completed</Badge>;
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">T</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">TuraPay Admin</h1>
                <p className="text-sm text-muted-foreground">Dashboard & Management</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')} 
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue (Fees)</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.revenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Management</CardTitle>
                <CardDescription>Review and manage all transactions</CardDescription>
                
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
                            {transaction.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => updateTransactionStatus(transaction.id, "completed")}
                                  className="bg-green-500 hover:bg-green-600"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => updateTransactionStatus(transaction.id, "failed", "Rejected by admin")}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {transaction.payment_proof_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(transaction.payment_proof_url, "_blank")}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Proof
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

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No users found</p>
                  ) : (
                    users.map((user) => (
                      <Card key={user.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground">{user.full_name}</h4>
                              {user.verified && (
                                <Badge className="bg-green-500">Verified</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.phone_number}</p>
                            <p className="text-sm text-muted-foreground">Country: {user.country}</p>
                            <p className="text-sm text-muted-foreground">
                              Balance: {user.country === "Zambia" ? "ZMW" : "USD"} {user.balance.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Joined: {new Date(user.created_at).toLocaleDateString()}
                            </p>
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
                <CardDescription>Manage platform configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Transfer Fee Setting */}
                <div className="space-y-4 p-4 border border-border rounded-lg">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">Transfer Fee Percentage</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Set the percentage fee charged on each transfer
                    </p>
                  </div>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <Label htmlFor="transfer-fee">Fee Percentage (%)</Label>
                      <Input
                        id="transfer-fee"
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={newTransferFee}
                        onChange={(e) => setNewTransferFee(e.target.value)}
                        placeholder="Enter percentage"
                      />
                    </div>
                    <Button onClick={updateTransferFee}>
                      Update Fee
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current fee: {settings.find(s => s.key === "transfer_fee_percentage")?.value || "12"}%
                  </p>
                </div>

                {/* Other Settings Display */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Other Settings</h3>
                  {settings.filter(s => s.key !== "transfer_fee_percentage").map((setting) => (
                    <Card key={setting.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-foreground capitalize">
                            {setting.key.replace(/_/g, " ")}
                          </h4>
                          <Badge variant="outline">{setting.value}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
