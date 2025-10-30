import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function Deposit() {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      return;
    }
    
    setLoading(true);
    
    // In a real implementation, this would integrate with Lipila API
    // For now, we'll just simulate a successful deposit
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 2000);
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
              <CardTitle className="text-2xl">
                Deposit Funds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label>Card Payment</Label>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <p className="text-sm">
                      You'll be redirected to Lipila to securely enter your card details
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleDeposit}
                  className="w-full"
                  disabled={loading || !amount || parseFloat(amount) <= 0}
                >
                  {loading ? "Processing..." : "Proceed to Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
