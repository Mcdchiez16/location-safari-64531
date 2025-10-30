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
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Users, TrendingUp, Settings as SettingsIcon, UserCircle, AlertCircle, Search, Download, Filter, Shield, Clock, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  kyc_verified?: boolean;
  kyc_document_url?: string;
  profiles?: { full_name: string; phone_number: string; email?: string };
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    loadMockData();
  }, []);

  const loadMockData = () => {
    // Mock Transactions Data
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        sender_id: "user1",
        receiver_name: "John Kabwe",
        receiver_phone: "+260977123456",
        amount: 500,
        fee: 5,
        status: "pending",
        payout_method: "Mobile Money",
        proof_of_payment_url: "https://example.com/proof1.pdf",
        kyc_verified: false,
        kyc_document_url: "https://example.com/kyc1.pdf",
        created_at: new Date(Date.now() - 3600000).toISOString(),
        profiles: { full_name: "Alice Mwansa", phone_number: "+260966789012", email: "alice.mwansa@example.com" }
      },
      {
        id: "2",
        sender_id: "user2",
        receiver_name: "Mary Phiri",
        receiver_phone: "+260955987654",
        amount: 250,
        fee: 2.5,
        status: "completed",
        payout_method: "Bank Transfer",
        admin_notes: "Verified and processed successfully",
        kyc_verified: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        profiles: { full_name: "David Banda", phone_number: "+260977456789", email: "david.banda@example.com" }
      },
      {
        id: "3",
        sender_id: "user3",
        receiver_name: "Joseph Tembo",
        receiver_phone: "+260965432109",
        amount: 1000,
        fee: 10,
        status: "pending",
        payout_method: "Cash Pickup",
        proof_of_payment_url: "https://example.com/proof3.pdf",
        kyc_verified: false,
        kyc_document_url: "https://example.com/kyc3.pdf",
        created_at: new Date(Date.now() - 7200000).toISOString(),
        profiles: { full_name: "Grace Lungu", phone_number: "+260966111222", email: "grace.lungu@example.com" }
      },
      {
        id: "4",
        sender_id: "user4",
        receiver_name: "Ruth Chanda",
        receiver_phone: "+260977888999",
        amount: 750,
        fee: 7.5,
        status: "completed",
        payout_method: "Mobile Money",
        admin_notes: "Processed on time",
        kyc_verified: true,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        profiles: { full_name: "Peter Zulu", phone_number: "+260955333444", email: "peter.zulu@example.com" }
      }
    ];

    // Mock Users Data
    const mockUsers: User[] = [
      {
        id: "user1",
        full_name: "Alice Mwansa",
        email: "alice.mwansa@example.com",
        phone_number: "+260966789012",
        country: "Zambia",
        balance: 1500,
        verified: true,
        created_at: new Date(Date.now() - 2592000000).toISOString()
      },
      {
        id: "user2",
        full_name: "David Banda",
        email: "david.banda@example.com",
        phone_number: "+260977456789",
        country: "Zambia",
        balance: 500,
        verified: true,
        created_at: new Date(Date.now() - 5184000000).toISOString()
      },
      {
        id: "user3",
        full_name: "Grace Lungu",
        email: "grace.lungu@example.com",
        phone_number: "+260966111222",
        country: "Zambia",
        balance: 2000,
        verified: false,
        created_at: new Date(Date.now() - 1296000000).toISOString()
      },
      {
        id: "user4",
        full_name: "Peter Zulu",
        email: "peter.zulu@example.com",
        phone_number: "+260955333444",
        country: "Zambia",
        balance: 800,
        verified: true,
        created_at: new Date(Date.now() - 7776000000).toISOString()
      }
    ];

    // Mock Settings Data
    const mockSettings: Setting[] = [
      {
        id: "1",
        key: "min_transfer_amount",
        value: "10",
        description: "Minimum transfer amount in USD"
      },
      {
        id: "2",
        key: "max_transfer_amount",
        value: "5000",
        description: "Maximum transfer amount in USD"
      },
      {
        id: "3",
        key: "transaction_fee_percentage",
        value: "1",
        description: "Transaction fee as percentage"
      },
      {
        id: "4",
        key: "support_email",
        value: "support@turapay.com",
        description: "Customer support email address"
      }
    ];

    // Mock Exchange Rate
    const mockRate: ExchangeRate = {
      id: "rate1",
      from_currency: "USD",
      to_currency: "ZMW",
      rate: 26.5,
      is_active: true,
      created_at: new Date().toISOString()
    };

    setTransactions(mockTransactions);
    setUsers(mockUsers);
    setSettings(mockSettings);
    setCurrentRate(mockRate);

    // Calculate stats
    const total = mockTransactions.length;
    const pending = mockTransactions.filter(t => t.status === "pending").length;
    const completed = mockTransactions.filter(t => t.status === "completed").length;
    const revenue = mockTransactions.reduce((sum, t) => sum + t.fee, 0);
    
    setStats({
      total,
      pending,
      completed,
      revenue,
      totalUsers: mockUsers.length
    });

    setIsAdmin(true);
    setLoading(false);
  };

  const updateTransactionStatus = (
    transactionId: string,
    status: string,
    notes?: string
  ) => {
    // Update transaction status in mock data
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, status, admin_notes: notes }
          : tx
      )
    );

    // Recalculate stats
    setTimeout(() => {
      const pending = transactions.filter(t => t.status === "pending").length;
      const completed = transactions.filter(t => t.status === "completed").length;
      setStats(prev => ({ ...prev, pending, completed }));
    }, 100);

    toast.success(`Transaction marked as ${status}`);
  };

  const updateKYCStatus = (transactionId: string, verified: boolean) => {
    setTransactions(prev => 
      prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, kyc_verified: verified }
          : tx
      )
    );
    toast.success(`KYC ${verified ? "verified" : "rejected"} successfully`);
  };

  const exportTransactions = () => {
    const csvContent = [
      ["ID", "Sender", "Receiver", "Amount (USD)", "Amount (ZMW)", "Fee", "Status", "KYC Status", "Date"],
      ...filteredTransactions.map(tx => [
        tx.id,
        tx.profiles?.full_name || "Unknown",
        tx.receiver_name,
        tx.amount,
        (tx.amount * (currentRate?.rate || 26.5)).toFixed(2),
        tx.fee,
        tx.status,
        tx.kyc_verified ? "Verified" : "Pending",
        new Date(tx.created_at).toLocaleString()
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    toast.success("Transactions exported successfully");
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.receiver_phone.includes(searchQuery);
    const matchesFilter = filterStatus === "all" || tx.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const updateExchangeRate = () => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Please enter a valid rate");
      return;
    }

    // Update mock exchange rate
    const newMockRate: ExchangeRate = {
      id: `rate${Date.now()}`,
      from_currency: "USD",
      to_currency: "ZMW",
      rate,
      is_active: true,
      created_at: new Date().toISOString()
    };

    setCurrentRate(newMockRate);
    setNewRate("");
    toast.success("Exchange rate updated");
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
            <Card className="shadow-xl">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl">Transaction Management</CardTitle>
                    <CardDescription>Review and manage all platform transactions</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={exportTransactions} className="gap-2">
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by sender, receiver, or phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <Filter className="h-4 w-4 mr-2" />
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
              </CardContent>
            </Card>
            {filteredTransactions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No transactions yet</p>
                </CardContent>
              </Card>
            ) : (
              filteredTransactions.map((tx) => (
                <Card key={tx.id} className="hover:shadow-lg transition-all border-l-4 border-l-primary/20 hover:border-l-primary">
                  <CardHeader>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">
                              {tx.profiles?.full_name} → {tx.receiver_name}
                            </CardTitle>
                            <Badge
                              variant={tx.status === "completed" ? "default" : tx.status === "pending" ? "secondary" : "destructive"}
                              className="uppercase"
                            >
                              {tx.status}
                            </Badge>
                            {tx.kyc_verified ? (
                              <Badge variant="default" className="gap-1 bg-success/10 text-success hover:bg-success/20">
                                <Shield className="h-3 w-3" />
                                KYC Verified
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="gap-1 bg-warning/10 text-warning hover:bg-warning/20">
                                <Clock className="h-3 w-3" />
                                KYC Pending
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{tx.profiles?.email}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Amount (USD)</p>
                          <p className="text-2xl font-bold text-primary">${tx.amount.toFixed(2)}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 rounded-lg border border-accent/20">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Amount (ZMW)</p>
                          <p className="text-2xl font-bold text-accent">
                            K {(tx.amount * (currentRate?.rate || 26.5)).toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">Rate: {currentRate?.rate || 26.5}</p>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-secondary/5 to-secondary/10 rounded-lg border border-secondary/20">
                          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Transaction Fee</p>
                          <p className="text-2xl font-bold">${tx.fee.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground">Receiver Phone:</span>
                          <span className="font-mono">{tx.receiver_phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-muted-foreground">Payout Method:</span>
                          <Badge variant="outline">{tx.payout_method || "Not specified"}</Badge>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <span className="font-medium text-muted-foreground">Transaction Date:</span>
                          <span>{new Date(tx.created_at).toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {tx.proof_of_payment_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.open(tx.proof_of_payment_url, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                            View Payment Proof
                          </Button>
                        )}
                        {tx.kyc_document_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => window.open(tx.kyc_document_url, "_blank")}
                          >
                            <Eye className="h-4 w-4" />
                            View KYC Document
                          </Button>
                        )}
                      </div>

                      {tx.admin_notes && (
                        <div className="p-4 bg-muted/50 rounded-lg border border-border">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Admin Notes</p>
                          <p className="text-sm italic">{tx.admin_notes}</p>
                        </div>
                      )}

                      {tx.status === "pending" && (
                        <div className="flex flex-col gap-3 pt-3 border-t border-border">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="gap-2 flex-1"
                              onClick={() => updateTransactionStatus(tx.id, "completed", "Transaction approved and completed")}
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve Transaction
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-2 flex-1"
                              onClick={() => {
                                const notes = prompt("Enter rejection reason:");
                                if (notes) updateTransactionStatus(tx.id, "failed", notes);
                              }}
                            >
                              <XCircle className="h-4 w-4" />
                              Reject Transaction
                            </Button>
                          </div>
                          {!tx.kyc_verified && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 flex-1"
                                onClick={() => updateKYCStatus(tx.id, true)}
                              >
                                <Shield className="h-4 w-4" />
                                Verify KYC
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2 flex-1 text-destructive hover:text-destructive"
                                onClick={() => updateKYCStatus(tx.id, false)}
                              >
                                <XCircle className="h-4 w-4" />
                                Reject KYC
                              </Button>
                            </div>
                          )}
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
