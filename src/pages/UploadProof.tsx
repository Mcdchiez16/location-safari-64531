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
  const [senderName, setSenderName] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

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
    if (!senderName.trim() || !paymentProofFile) {
      toast.error("Please provide both your name and payment screenshot");
      return;
    }

    if (!transactionId) {
      toast.error("No transaction ID found");
      return;
    }

    setLoading(true);

    try {
      // Upload the payment proof
      const fileExt = paymentProofFile.name.split('.').pop();
      const fileName = `${transactionId}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, paymentProofFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      // Update the transaction with payment proof and sender name
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          payment_proof_url: publicUrl,
          sender_name: senderName,
          status: 'pending'
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      toast.success("Payment proof submitted successfully!");
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error submitting proof:', error);
      toast.error(error.message || "Failed to submit payment proof");
    } finally {
      setLoading(false);
    }
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
              <CheckCircle className="h-6 w-6 text-primary" />
              Upload Payment Proof
            </CardTitle>
            <CardDescription>
              Provide your transaction details to complete the payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="senderName">Name on Transaction</Label>
              <Input
                id="senderName"
                type="text"
                placeholder="Enter the name that appears on your transaction"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Enter the exact name shown on your payment confirmation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentProof">Payment Screenshot</Label>
              <Input
                id="paymentProof"
                type="file"
                accept="image/*"
                onChange={(e) => setPaymentProofFile(e.target.files?.[0] || null)}
                className="h-12 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
              <p className="text-xs text-muted-foreground">
                Upload a clear screenshot of your payment confirmation
              </p>
            </div>

            {paymentProofFile && (
              <div className="p-3 bg-primary/10 rounded-lg flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{paymentProofFile.name}</span>
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Important:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Make sure the screenshot is clear and readable</li>
                <li>• Include the full transaction details</li>
                <li>• Admin will verify your payment</li>
                <li>• You'll receive your TID after approval</li>
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full h-12"
              disabled={loading || !senderName.trim() || !paymentProofFile}
            >
              {loading ? "Submitting..." : "Submit Payment Proof"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadProof;