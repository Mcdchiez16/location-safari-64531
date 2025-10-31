import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Send as SendIcon } from "lucide-react";
import Navbar from "@/components/Navbar";

const Send = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [receiverName, setReceiverName] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [paymentLinkId, setPaymentLinkId] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const calculateFee = (amount: number) => {
    // Simple fee structure: $1 for every $50
    return Math.max(1, Math.floor(amount / 50));
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast.error("Please log in to continue");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setLoading(true);

    const fee = calculateFee(numAmount);

    const { error } = await supabase.from("transactions").insert({
      sender_id: userId,
      receiver_name: receiverName,
      receiver_phone: receiverPhone,
      receiver_country: "Zambia",
      amount: numAmount,
      currency: currency,
      fee: fee,
      status: "pending",
    });

    if (error) {
      toast.error("Failed to create transaction");
      console.error(error);
    } else {
      toast.success("Transfer initiated successfully!");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
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

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <SendIcon className="h-6 w-6" />
                Send Money to Zambia
              </CardTitle>
              <CardDescription>
                Send money to Zambia instantly via mobile money
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSend} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold">Recipient Details</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="receiverName">Recipient Name</Label>
                    <Input
                      id="receiverName"
                      type="text"
                      placeholder="John Mwale"
                      value={receiverName}
                      onChange={(e) => setReceiverName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiverPhone">Phone Number (Zambia)</Label>
                    <Input
                      id="receiverPhone"
                      type="tel"
                      placeholder="+260..."
                      value={receiverPhone}
                      onChange={(e) => setReceiverPhone(e.target.value)}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      MTN or Airtel Money number
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Transfer Amount</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="1"
                        placeholder="50.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Zambian Kwacha (ZMW)</Label>
                      <Input
                        type="text"
                        value={amount ? (parseFloat(amount) * 15.5).toFixed(2) : "0.00"}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  {amount && parseFloat(amount) > 0 && (
                    <Card className="bg-secondary/50">
                      <CardContent className="pt-6">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount</span>
                            <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Transfer Fee</span>
                            <span className="font-medium">${calculateFee(parseFloat(amount))}.00</span>
                          </div>
                          <div className="border-t border-border pt-2 mt-2">
                            <div className="flex justify-between">
                              <span className="font-semibold">Total</span>
                              <span className="font-bold text-primary">
                                ${(parseFloat(amount) + calculateFee(parseFloat(amount))).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Processing..." : "Send Money"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Send;
