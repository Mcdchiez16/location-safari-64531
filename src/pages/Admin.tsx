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
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Users, TrendingUp, Settings as SettingsIcon, UserCircle, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Transaction {
  id: string;
  sender_id: string;
  receiver_name: string;
  receiver_phone: string;
  amount: number;
  fee: number;
  status: string;
  payout_method?: string;
  proof_of_payment_url?: string;
  admin_notes?: string;
  created_at: string;
  profiles?: { full_name: string; phone_number: string };
}

interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
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
  const [newRate, setNewRate] = useState("");
  const [currentRate, setCurrentRate] = useState<ExchangeRate | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    // Check if user has admin role
    const { data: roles } = await supabase
      .from("user_roles" as any)
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/dashboard");
      return;
    }

    setIsAdmin(true);
    loadDashboardData();
  };

  const loadDashboardData = async () => {
    // Load transactions with sender info
    const { data: txData, error: txError } = await supabase
      .from("transactions")
      .select(`
        *,
        profiles:sender_id (full_name, phone_number)
      `)
      .order("created_at", { ascending: false });

    if (!txError && txData) {
      setTransactions(txData);

      // Calculate stats
      const total = txData.length;
      const pending = txData.filter(t => t.status === "pending").length;
      const completed = txData.filter(t => t.status === "completed").length;
      const revenue = txData.reduce((sum, t) => sum + (t.fee || 0), 0);

      setStats((prev) => ({ ...prev, total, pending, completed, revenue }));
    }

    // Load users
    const { data: usersData } = await supabase
      .from("profiles")
      .select("id, full_name, phone_number, country, balance, verified, created_at");

    if (usersData) {
      const usersWithEmails = await Promise.all(
        usersData.map(async (user) => {
          const { data: authData } = await supabase.auth.admin.getUserById(user.id);
          return {
            ...user,
            email: authData?.user?.email || "N/A",
          };
        })
      );
      setUsers(usersWithEmails as User[]);
      setStats((prev) => ({ ...prev, totalUsers: usersData.length }));
    }

    // Load settings
    const { data: settingsData } = await supabase
      .from("settings" as any)
      .select("*");

    if (settingsData) {
      setSettings(settingsData as any);
    }

    // Load current exchange rate
    const { data: rateData } = await supabase
      .from("exchange_rates" as any)
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (rateData) {
      setCurrentRate(rateData as any);
    }

    setLoading(false);
  };

  const updateTransactionStatus = async (
    transactionId: string,
    status: string,
    notes?: string
  ) => {
    const updateData: any = {
      status,
      admin_notes: notes,
    };

    if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("transactions")
      .update(updateData)
      .eq("id", transactionId);

    if (error) {
      toast.error("Failed to update transaction");
      console.error(error);
    } else {
      toast.success(`Transaction marked as ${status}`);
      loadDashboardData();
    }
  };

  const updateExchangeRate = async () => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Please enter a valid rate");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Deactivate current rate
    if (currentRate) {
      await supabase
        .from("exchange_rates" as any)
        .update({ is_active: false })
        .eq("id", currentRate.id);
    }

    // Insert new rate
    const { error } = await supabase.from("exchange_rates" as any).insert({
      from_currency: "USD",
      to_currency: "ZMW",
      rate,
      created_by: session.user.id,
      is_active: true,
    });

    if (error) {
      toast.error("Failed to update rate");
      console.error(error);
    } else {
      toast.success("Exchange rate updated");
      setNewRate("");
      loadDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate("/dashboard")}
              className="mb-2 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Admin Control Center
            </h1>
            <p className="text-muted-foreground mt-1">Manage your TuraPay platform</p>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Transactions</p>
                  <p className="text-3xl font-bold mt-1">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending</p>
                  <p className="text-3xl font-bold mt-1 text-warning">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-warning/10 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Completed</p>
                  <p className="text-3xl font-bold mt-1 text-success">{stats.completed}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Users</p>
                  <p className="text-3xl font-bold mt-1">{stats.totalUsers}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Revenue</p>
                  <p className="text-3xl font-bold mt-1">${stats.revenue.toFixed(2)}</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="exchange">Exchange Rates</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Management</CardTitle>
                <CardDescription>Review and manage all platform transactions</CardDescription>
              </CardHeader>
            </Card>
            {transactions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No transactions yet</p>
                </CardContent>
              </Card>
            ) : (
              transactions.map((tx) => (
                <Card key={tx.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">
                            {tx.profiles?.full_name} → {tx.receiver_name}
                          </CardTitle>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              tx.status === "completed"
                                ? "bg-success/10 text-success"
                                : tx.status === "pending"
                                ? "bg-warning/10 text-warning"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {tx.status.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <p><span className="font-medium">Amount:</span> ${tx.amount}</p>
                          <p><span className="font-medium">Fee:</span> ${tx.fee}</p>
                          <p><span className="font-medium">Receiver:</span> {tx.receiver_phone}</p>
                          <p><span className="font-medium">Method:</span> {tx.payout_method || "Not specified"}</p>
                          <p className="md:col-span-2"><span className="font-medium">Date:</span> {new Date(tx.created_at).toLocaleString()}</p>
                        </div>
                        {tx.proof_of_payment_url && (
                          <a
                            href={tx.proof_of_payment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                          >
                            📄 View Proof of Payment
                          </a>
                        )}
                        {tx.admin_notes && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-xs font-medium mb-1">Admin Notes:</p>
                            <p className="text-sm text-muted-foreground italic">{tx.admin_notes}</p>
                          </div>
                        )}
                      </div>
                      {tx.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="gap-2"
                            onClick={() => updateTransactionStatus(tx.id, "completed")}
                          >
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                            onClick={() => {
                              const notes = prompt("Enter rejection reason:");
                              if (notes) updateTransactionStatus(tx.id, "failed", notes);
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage platform users</CardDescription>
              </CardHeader>
            </Card>
            <div className="grid gap-4">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <UserCircle className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="font-bold text-lg">{user.full_name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="grid md:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                            <p><span className="font-medium">Phone:</span> {user.phone_number}</p>
                            <p><span className="font-medium">Country:</span> {user.country}</p>
                            <p><span className="font-medium">Balance:</span> ${user.balance?.toFixed(2) || "0.00"}</p>
                            <p><span className="font-medium">Joined:</span> {new Date(user.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {user.verified ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-success/10 text-success">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-warning/10 text-warning">
                            UNVERIFIED
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exchange">
            <Card>
              <CardHeader>
                <CardTitle>Exchange Rate Management</CardTitle>
                <CardDescription>Update currency exchange rates for the platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {currentRate && (
                  <div className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border-2 border-primary/20">
                    <p className="text-sm text-muted-foreground mb-2 font-medium">Current Active Rate</p>
                    <p className="text-4xl font-bold mb-1">
                      1 USD = {currentRate.rate} ZMW
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Last updated: {new Date(currentRate.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Set New Exchange Rate (USD to ZMW)</Label>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="27.5000"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                      className="text-lg h-12"
                    />
                    <Button onClick={updateExchangeRate} className="h-12 px-8">
                      Update Rate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    This will deactivate the current rate and set a new active rate for all transactions
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Platform Settings</CardTitle>
                <CardDescription>Configure global platform parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div key={setting.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-semibold text-sm uppercase tracking-wide text-primary mb-1">
                            {setting.key.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">{setting.description}</p>
                          <p className="text-2xl font-bold">{setting.value}</p>
                        </div>
                        <SettingsIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                  {settings.length === 0 && (
                    <p className="text-center py-8 text-muted-foreground">No settings configured</p>
                  )}
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
