import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const UploadProof = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("transaction");
  const [loading, setLoading] = useState(false);
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionCode, setTransactionCode] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const handleSubmit = async () => {
    if (!senderNumber.trim() || !transactionCode.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!transactionId) {
      toast.error("No transaction ID found");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("transactions")
      .update({ 
        sender_number: senderNumber,
        transaction_id: transactionCode 
      })
      .eq("id", transactionId);

    if (error) {
      toast.error("Failed to submit payment details");
      console.error(error);
    } else {
      toast.success("Payment details submitted successfully!");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Enter your payment details for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="senderNumber">Your Sender Number</Label>
              <Input
                id="senderNumber"
                type="text"
                placeholder="Enter your phone number used for payment"
                value={senderNumber}
                onChange={(e) => setSenderNumber(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                The phone number you used to make the payment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transactionCode">Transaction ID or Approval Code</Label>
              <Input
                id="transactionCode"
                type="text"
                placeholder="e.g., CO250822.1552.F38050 or F38050"
                value={transactionCode}
                onChange={(e) => setTransactionCode(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                This is the confirmation code you received after making the payment
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Important Information:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ensure the transaction ID is correct</li>
                <li>• Make sure the sender number matches the payment</li>
                <li>• Admin will verify your payment details</li>
                <li>• You will receive a TID after approval</li>
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-12"
              disabled={loading || !senderNumber.trim() || !transactionCode.trim()}
            >
              {loading ? "Submitting..." : "Submit Payment Details"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadProof;