import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Users, TrendingUp } from "lucide-react";
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

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, revenue: 0 });
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

      setStats({ total, pending, completed, revenue });
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

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transactions</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">{stats.pending}</p>
                </div>
                <Users className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-success">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold">${stats.revenue.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="transactions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="exchange">Exchange Rate</TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            {transactions.map((tx) => (
              <Card key={tx.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">
                        {tx.profiles?.full_name} → {tx.receiver_name}
                      </CardTitle>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Amount: ${tx.amount} (Fee: ${tx.fee})</p>
                        <p>Receiver: {tx.receiver_phone}</p>
                        <p>Method: {tx.payout_method || "Not specified"}</p>
                        <p>Date: {new Date(tx.created_at).toLocaleString()}</p>
                      </div>
                      {tx.proof_of_payment_url && (
                        <a
                          href={tx.proof_of_payment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          View Proof of Payment
                        </a>
                      )}
                      {tx.admin_notes && (
                        <p className="text-sm italic text-muted-foreground mt-2">
                          Notes: {tx.admin_notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tx.status === "completed"
                            ? "bg-success/10 text-success"
                            : tx.status === "pending"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {tx.status}
                      </span>
                      {tx.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateTransactionStatus(tx.id, "completed")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const notes = prompt("Enter rejection reason:");
                              if (notes) updateTransactionStatus(tx.id, "failed", notes);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="exchange">
            <Card>
              <CardHeader>
                <CardTitle>Manage Exchange Rate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentRate && (
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Current Rate</p>
                    <p className="text-2xl font-bold">
                      1 USD = {currentRate.rate} ZMW
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last updated: {new Date(currentRate.created_at).toLocaleString()}
                    </p>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>New Exchange Rate (USD to ZMW)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="27.5000"
                      value={newRate}
                      onChange={(e) => setNewRate(e.target.value)}
                    />
                    <Button onClick={updateExchangeRate}>Update Rate</Button>
                  </div>
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
