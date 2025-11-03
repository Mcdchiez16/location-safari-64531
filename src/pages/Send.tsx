import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Send as SendIcon, Search, User, CheckCircle2, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReceiverProfile {
  id: string;
  full_name: string;
  phone_number: string;
  payment_link_id: string;
  verified: boolean;
}

const Send = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [lookupValue, setLookupValue] = useState("");
  const [receiverProfile, setReceiverProfile] = useState<ReceiverProfile | null>(null);
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(27.5);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");
  const [paymentNumber, setPaymentNumber] = useState("+263 77 123 4567");
  const [paymentRecipientName, setPaymentRecipientName] = useState("TuraPay");
  const [transferFeePercentage, setTransferFeePercentage] = useState(2);
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });

    // Check if payment link ID is in URL
    const linkId = searchParams.get('link');
    if (linkId) {
      setLookupValue(linkId);
      handleLookup(linkId);
    }

    // Fetch payment number, recipient name, and transfer fee from settings
    fetchPaymentNumber();
    fetchPaymentRecipientName();
    fetchTransferFee();

    // Fetch exchange rate
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [navigate, searchParams]);

  const fetchPaymentNumber = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "payment_number")
        .maybeSingle();
      
      if (!error && data) {
        setPaymentNumber(data.value);
      }
    } catch (error) {
      console.error('Error fetching payment number:', error);
    }
  };

  const fetchPaymentRecipientName = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "payment_recipient_name")
        .maybeSingle();
      
      if (!error && data) {
        setPaymentRecipientName(data.value);
      }
    } catch (error) {
      console.error('Error fetching payment recipient name:', error);
    }
  };

  const fetchTransferFee = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "transfer_fee_percentage")
        .maybeSingle();
      
      if (!error && data) {
        setTransferFeePercentage(parseFloat(data.value));
      }
    } catch (error) {
      console.error('Error fetching transfer fee:', error);
    }
  };

  const fetchExchangeRate = async () => {
    try {
      // Try multiple APIs for better accuracy
      let response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=ZMW');
      let data = await response.json();
      
      if (data.rates && data.rates.ZMW) {
        setExchangeRate(data.rates.ZMW);
        setLastUpdated(new Date());
      } else {
        // Fallback API
        response = await fetch('https://open.er-api.com/v6/latest/USD');
        data = await response.json();
        
        if (data.rates && data.rates.ZMW) {
          setExchangeRate(data.rates.ZMW);
          setLastUpdated(new Date());
        }
      }
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
      toast.error('Could not fetch live exchange rate');
    }
  };

  const handleLookup = async (value?: string) => {
    const searchValue = value || lookupValue;
    if (!searchValue) {
      toast.error("Please enter a phone number or payment link");
      return;
    }

    setLoading(true);

    try {
      // If it's a payment link ID (no digits or mostly letters), search directly
      if (!/\d{3,}/.test(searchValue)) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, phone_number, payment_link_id, verified")
          .eq("payment_link_id", searchValue.trim())
          .maybeSingle();

        if (error && error.code !== "PGRST116") throw error;

        if (data) {
          setReceiverProfile(data);
          toast.success(`Receiver found: ${data.full_name}`);
        } else {
          toast.error("Receiver not found. Please check the payment link.");
          setReceiverProfile(null);
        }
        setLoading(false);
        return;
      }

      // For phone numbers, first try normalizing
      const { data: normalizedData, error: normalizeError } = await supabase
        .rpc('normalize_phone_number', { phone: searchValue });

      if (normalizeError) {
        console.error("Normalization error:", normalizeError);
        // Fallback to raw search if normalization fails
      }

      const normalizedPhone = normalizedData || searchValue;

      // Search by normalized phone
      let { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone_number, payment_link_id, verified")
        .eq("phone_number", normalizedPhone)
        .maybeSingle();

      // If not found with normalized, try raw phone as fallback
      if (!data && normalizedPhone !== searchValue) {
        const fallback = await supabase
          .from("profiles")
          .select("id, full_name, phone_number, payment_link_id, verified")
          .eq("phone_number", searchValue.trim())
          .maybeSingle();
        
        data = fallback.data;
        error = fallback.error;
      }

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setReceiverProfile(data);
        setLookupValue("");
        toast.success(`Receiver found: ${data.full_name}`);
      } else {
        toast.error("Receiver not found. Please check the phone number or payment link.");
        setReceiverProfile(null);
      }
    } catch (error) {
      console.error("Lookup error:", error);
      toast.error("Error searching for receiver");
      setReceiverProfile(null);
    }

    setLoading(false);
  };

  const calculateFee = (amount: number) => {
    return (amount * transferFeePercentage) / 100;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!payoutMethod) {
      toast.error("Please select a payout method");
      return;
    }

    setShowPaymentInstructions(true);
  };

  const handleConfirmPayment = async () => {
    if (!senderNumber.trim()) {
      toast.error("Please enter your sender number");
      return;
    }

    if (!transactionId.trim()) {
      toast.error("Please enter the transaction ID");
      return;
    }

    if (!userId || !receiverProfile) {
      toast.error("Please select a receiver first");
      return;
    }

    setLoading(true);

    const transferFee = calculateFee(parseFloat(amount));

    // Fetch sender name from current user's profile
    const { data: senderProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .single();

    const { error, data } = await supabase.from("transactions").insert({
      sender_id: userId,
      sender_name: senderProfile?.full_name || "",
      receiver_name: receiverProfile.full_name,
      receiver_phone: receiverProfile.phone_number,
      receiver_country: "Zambia",
      amount: parseFloat(amount),
      currency: "USD",
      fee: transferFee,
      exchange_rate: exchangeRate,
      payout_method: payoutMethod,
      status: "pending",
      sender_number: senderNumber,
      transaction_id: transactionId,
    }).select();

    if (error) {
      toast.error("Failed to create transaction");
      console.error(error);
    } else {
      toast.success("Transaction submitted successfully! Awaiting admin approval.");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  const recipientGets = amount ? (parseFloat(amount) * exchangeRate).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-semibold text-foreground">TuraPay</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')} 
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center gap-3">
            <SendIcon className="h-8 w-8 text-primary" />
            Send Money
          </h1>
          <p className="text-lg text-muted-foreground">
            Send money to Zambia instantly via mobile money
          </p>
        </div>

        {/* Lookup Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary to-accent px-8 py-6">
            <h2 className="text-xl font-semibold text-primary-foreground flex items-center gap-3">
              <Search className="h-6 w-6" />
              Find Receiver
            </h2>
            <p className="text-primary-foreground/90 mt-1">Enter phone number or payment link to find receiver</p>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="lookup" className="text-sm font-medium text-foreground">
                  Phone Number
                </Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    id="lookup"
                    type="text"
                    placeholder="+260..."
                    value={lookupValue}
                    onChange={(e) => setLookupValue(e.target.value)}
                    className="h-12"
                  />
                  <Button 
                    onClick={() => handleLookup()}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-accent px-8"
                  >
                    {loading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>

              {receiverProfile && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 sm:p-6 mt-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-2xl flex-shrink-0">
                      {receiverProfile.full_name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-base sm:text-lg font-bold text-foreground truncate">{receiverProfile.full_name}</h3>
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                        {receiverProfile.verified && (
                          <div className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs font-medium">Verified</span>
                          </div>
                        )}
                      </div>
                      <div className="inline-flex items-center gap-2 bg-background/60 px-3 py-1.5 rounded-lg border border-border">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-mono font-medium text-foreground">{receiverProfile.phone_number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Send Money Form */}
        {receiverProfile && !showPaymentInstructions && (
          <form onSubmit={handleProceedToPayment}>
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-6">
              <div className="px-8 py-6 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground">Transfer Amount</h2>
              </div>
              <div className="p-8">
                <div className="mb-6">
                  <Label htmlFor="amount" className="text-sm font-medium text-foreground block mb-2">
                    Amount to Send
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">$</span>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10 pr-16 h-16 text-2xl font-semibold focus:border-primary"
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">USD</span>
                  </div>
                </div>

                <div className="mb-6">
                  <Label htmlFor="payoutMethod" className="text-sm font-medium text-foreground block mb-2">
                    Recipient will receive via
                  </Label>
                  <Select value={payoutMethod} onValueChange={setPayoutMethod} required>
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Select payout method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MTN Money">MTN Money</SelectItem>
                      <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">You send</span>
                        <span className="font-medium text-foreground">${parseFloat(amount).toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Transfer fee ({transferFeePercentage}%)</span>
                        <span className="font-medium text-foreground">${calculateFee(parseFloat(amount)).toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Exchange rate</span>
                        <span className="font-medium text-foreground">1 USD = {exchangeRate} ZMW</span>
                      </div>
                      <div className="border-t border-primary/20 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-foreground font-medium">Recipient gets</span>
                          <span className="font-bold text-2xl text-primary">{recipientGets} ZMW</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full mt-8 h-14 text-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg" 
                  disabled={loading || !amount || parseFloat(amount) <= 0 || !payoutMethod}
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Payment Instructions */}
        {receiverProfile && showPaymentInstructions && (
          <div className="space-y-6">
            <Card className="overflow-hidden shadow-lg border-2 border-primary/20">
              <div className="bg-gradient-to-r from-primary to-accent px-4 sm:px-8 py-6">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground">Payment Instructions</h2>
                <p className="text-sm sm:text-base text-primary-foreground/90 mt-1">Complete your transfer in 3 steps</p>
              </div>
              
              <div className="p-4 sm:p-8 space-y-6">
                {/* Step 1 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                    <h3 className="font-semibold text-foreground text-base sm:text-lg">Send Money</h3>
                  </div>
                  <div className="ml-11 bg-secondary/10 rounded-xl p-4 sm:p-6 border-2 border-secondary/30">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Send this amount:</p>
                    <p className="text-2xl sm:text-3xl font-bold text-secondary mb-3">${(parseFloat(amount) + calculateFee(parseFloat(amount))).toFixed(2)}</p>
                    <div className="bg-card rounded-lg p-3 sm:p-4 border border-border">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">To this number:</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground mb-2">{paymentNumber}</p>
                      <p className="text-sm font-semibold text-primary mb-1">{paymentRecipientName}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Via: EcoCash</p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                    <h3 className="font-semibold text-foreground text-base sm:text-lg">Enter Payment Details</h3>
                  </div>
                  <div className="ml-11 space-y-4">
                    <div>
                      <Label htmlFor="senderNumber" className="text-sm font-medium text-foreground mb-2 block">
                        Your Phone Number *
                      </Label>
                      <Input
                        id="senderNumber"
                        type="text"
                        placeholder="e.g., +263 77 123 4567"
                        value={senderNumber}
                        onChange={(e) => setSenderNumber(e.target.value)}
                        className="h-12 text-base"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Enter the phone number you used to send the payment
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="transactionId" className="text-sm font-medium text-foreground mb-2 block">
                        Transaction ID *
                      </Label>
                      <Input
                        id="transactionId"
                        type="text"
                        placeholder="e.g., CO250822.1552.F38050 or F38050"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="h-12 text-base"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Enter the transaction ID from your payment confirmation
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
                    <h3 className="font-semibold text-foreground text-base sm:text-lg">Confirm & Submit</h3>
                  </div>
                  <div className="ml-11 bg-success/10 border border-success/30 rounded-xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-medium text-foreground mb-2">✅ Ready to submit:</p>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>Your transaction will be reviewed by our admin team</li>
                      <li>You'll be notified once the payment is confirmed</li>
                      <li>The recipient will receive their funds shortly after</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handleConfirmPayment}
                    className="w-full h-12 sm:h-14 text-sm sm:text-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg font-bold" 
                    disabled={loading || !senderNumber.trim() || !transactionId.trim()}
                  >
                    {loading ? "Processing..." : "Submit Transaction"}
                  </Button>

                  <Button 
                    variant="outline"
                    onClick={() => setShowPaymentInstructions(false)}
                    className="w-full h-10 sm:h-12 text-sm sm:text-base"
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Send;
