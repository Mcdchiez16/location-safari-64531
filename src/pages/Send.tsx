import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, User, Building2, Upload } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const Send = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [step, setStep] = useState<"details" | "confirm" | "upload">("details");
  
  // Form state
  const [recipientType, setRecipientType] = useState<"person" | "bank">("person");
  const [transferType, setTransferType] = useState<"local" | "international">("local");
  const [recipientIdentifier, setRecipientIdentifier] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [amount, setAmount] = useState("");
  const [comments, setComments] = useState("");
  
  // Upload state
  const [senderName, setSenderName] = useState("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const handleProceed = () => {
    if (!recipientIdentifier.trim()) {
      toast.error("Please enter recipient name or number");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    setStep("confirm");
  };

  const handleConfirm = () => {
    setStep("upload");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setPaymentProofFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async () => {
    if (!senderName.trim()) {
      toast.error("Please enter your name as it appears on the transaction");
      return;
    }
    if (!paymentProofFile) {
      toast.error("Please upload payment proof");
      return;
    }
    if (!userId) {
      toast.error("Please log in to continue");
      return;
    }

    setLoading(true);

    try {
      // Upload payment proof
      const fileExt = paymentProofFile.name.split('.').pop();
      const fileName = `${userId}_${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('payment-proofs')
        .upload(fileName, paymentProofFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(fileName);

      // Create transaction
      const { error: insertError } = await supabase.from("transactions").insert({
        sender_id: userId,
        receiver_name: recipientName || recipientIdentifier,
        receiver_phone: recipientIdentifier,
        receiver_country: transferType === "local" ? "Zambia" : "International",
        amount: parseFloat(amount),
        currency: "ZMW",
        fee: 0,
        status: "pending",
        payment_proof_url: publicUrl,
        sender_name: senderName,
      });

      if (insertError) throw insertError;

      toast.success("Transaction submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => {
            if (step === "details") {
              navigate("/dashboard");
            } else if (step === "confirm") {
              setStep("details");
            } else {
              setStep("confirm");
            }
          }}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {step === "details" ? "Back to Dashboard" : "Go Back"}
        </Button>

        <Card className="border-none shadow-lg">
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg">
            <h1 className="text-2xl font-bold">Send Money</h1>
          </div>
          
          <CardContent className="p-6 space-y-6">
            {step === "details" && (
              <>
                <div>
                  <Label className="text-muted-foreground mb-3 block">To</Label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setRecipientType("person")}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        recipientType === "person"
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <User className={`h-8 w-8 ${recipientType === "person" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium">Person</span>
                    </button>
                    <button
                      onClick={() => setRecipientType("bank")}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                        recipientType === "bank"
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:border-primary/50"
                      }`}
                    >
                      <Building2 className={`h-8 w-8 ${recipientType === "bank" ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="font-medium">Banks</span>
                    </button>
                  </div>
                </div>

                <Tabs value={transferType} onValueChange={(v) => setTransferType(v as "local" | "international")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="local">LOCAL</TabsTrigger>
                    <TabsTrigger value="international">INTERNATIONAL</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-4">RECIPIENT DETAILS</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipientIdentifier">Recipient Name or Number</Label>
                      <Input
                        id="recipientIdentifier"
                        placeholder="Enter Recipient Name or Number"
                        value={recipientIdentifier}
                        onChange={(e) => setRecipientIdentifier(e.target.value)}
                      />
                    </div>

                    {recipientIdentifier && (
                      <div className="space-y-2">
                        <Label htmlFor="recipientName">Recipient Name</Label>
                        <Input
                          id="recipientName"
                          placeholder="Full Name"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="amount">Enter Amount</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold text-lg">ZMW</span>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="flex-1 text-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="comments">Comments (Optional)</Label>
                      <Textarea
                        id="comments"
                        placeholder="Enter Comment"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </Button>
                  <Button
                    onClick={handleProceed}
                    className="flex-1"
                  >
                    Proceed
                  </Button>
                </div>
              </>
            )}

            {step === "confirm" && (
              <>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Confirm Transaction Details</h2>
                  
                  <div className="space-y-3 bg-secondary/20 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Recipient:</span>
                      <span className="font-medium">{recipientName || recipientIdentifier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-bold text-primary">ZMW {amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium capitalize">{transferType}</span>
                    </div>
                    {comments && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Comments:</span>
                        <span className="font-medium text-sm">{comments}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-lg">Payment Instructions</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Please send the money to the following details:
                    </p>
                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground">Mobile Number</span>
                        <p className="font-bold text-lg">+260 97 123 4567</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Account Name</span>
                        <p className="font-medium">Ticlapay</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Amount to Send</span>
                        <p className="font-bold text-primary text-lg">ZMW {amount}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleConfirm}
                  className="w-full"
                  size="lg"
                >
                  I've Sent the Money - Upload Proof
                </Button>
              </>
            )}

            {step === "upload" && (
              <>
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Payment Proof
                  </h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="senderName">Name on Transaction</Label>
                    <Input
                      id="senderName"
                      placeholder="Enter name as it appears on the transaction"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the exact name that appears on your payment receipt
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proof">Payment Screenshot</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                      <input
                        type="file"
                        id="proof"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="proof"
                        className="cursor-pointer flex flex-col items-center gap-3"
                      >
                        <Upload className="h-12 w-12 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {paymentProofFile ? paymentProofFile.name : "Click to upload screenshot"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {previewUrl && (
                    <div className="space-y-2">
                      <Label>Preview</Label>
                      <img
                        src={previewUrl}
                        alt="Payment proof preview"
                        className="w-full h-auto rounded-lg border border-border max-h-96 object-contain"
                      />
                    </div>
                  )}
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? "Submitting..." : "Submit Transaction"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Send;
