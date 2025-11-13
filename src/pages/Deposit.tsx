import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCardDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!phoneNumber) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('lipila-deposit', {
        body: {
          amount: parseFloat(amount),
          currency: 'ZMW',
          accountNumber: phoneNumber,
        },
      });

      if (error) throw error;

      if (data.success) {
        setReferenceId(data.referenceId);
        toast({
          title: "Payment Request Created",
          description: "Please complete the payment on your device. We'll check the status automatically.",
        });

        // Poll for status
        setTimeout(() => checkPaymentStatus(data.referenceId), 5000);
      }
    } catch (error) {
      console.error('Deposit error:', error);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to create payment request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (refId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('lipila-deposit', {
        body: {
          referenceId: refId,
          amount: parseFloat(amount),
          accountNumber: phoneNumber,
        },
      });

      if (error) throw error;

      if (data.status === 'Successful') {
        toast({
          title: "Deposit Successful",
          description: `Your account has been credited with ZMW ${amount}`,
        });
        setTimeout(() => navigate("/dashboard"), 2000);
      } else if (data.status === 'Pending') {
        toast({
          title: "Payment Pending",
          description: "Please complete the payment prompt on your device",
        });
        setTimeout(() => checkPaymentStatus(refId), 5000);
      } else if (data.status === 'Failed') {
        toast({
          title: "Payment Failed",
          description: data.message || "The payment was not successful",
          variant: "destructive",
        });
        setReferenceId(null);
      }
    } catch (error) {
      console.error('Status check error:', error);
    }
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

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                Deposit Funds
              </CardTitle>
              <CardDescription>
                Add money to your wallet using card payment via Lipila
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (ZMW)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="50.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={loading || referenceId !== null}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+260 XXX XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading || referenceId !== null}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your mobile number for payment confirmation
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Secure Card Payment</Label>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Powered by Lipila</p>
                        <p className="text-xs text-muted-foreground">
                          You'll receive a payment prompt on your device to complete the transaction securely
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleCardDeposit}
                  className="w-full"
                  disabled={loading || !amount || parseFloat(amount) <= 0 || !phoneNumber || referenceId !== null}
                >
                  {loading ? "Processing..." : referenceId ? "Waiting for Payment..." : "Proceed to Payment"}
                </Button>

                {referenceId && (
                  <div className="text-center text-sm text-muted-foreground">
                    <p>Payment initiated. Reference: {referenceId.slice(0, 8)}...</p>
                    <p className="mt-1">Checking payment status...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
