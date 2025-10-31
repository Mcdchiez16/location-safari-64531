import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Send as SendIcon, QrCode, Search, User, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ReceiverProfile {
  id: string;
  full_name: string;
  phone_number: string;
  payment_link_id: string;
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
  const transferFee = 2.99;
  const paymentNumber = "+263 77 123 4567"; // Admin payment number

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

    // Fetch exchange rate
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [navigate, searchParams]);

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

    // Search by phone number or payment link ID
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone_number, payment_link_id")
      .or(`phone_number.eq.${searchValue},payment_link_id.eq.${searchValue}`)
      .eq("account_type", "receiver")
      .single();

    if (error || !data) {
      toast.error("Receiver not found. Please check the phone number or payment link.");
      setReceiverProfile(null);
    } else {
      setReceiverProfile(data);
      toast.success(`Receiver found: ${data.full_name}`);
    }

    setLoading(false);
  };

  const calculateFee = (amount: number) => {
    return transferFee;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setShowPaymentInstructions(true);
  };

  const handleConfirmPayment = async () => {
    if (!senderName.trim()) {
      toast.error("Please enter the name on your transaction");
      return;
    }

    if (!userId || !receiverProfile) {
      toast.error("Please select a receiver first");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("transactions").insert({
      sender_id: userId,
      receiver_name: receiverProfile.full_name,
      receiver_phone: receiverProfile.phone_number,
      receiver_country: "Zambia",
      amount: parseFloat(amount),
      currency: "USD",
      fee: transferFee,
      exchange_rate: exchangeRate,
      status: "pending",
    });

    if (error) {
      toast.error("Failed to create transaction");
      console.error(error);
    } else {
      toast.success("Transaction recorded! Please upload proof of payment.");
      navigate("/upload-proof");
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
            <p className="text-primary-foreground/90 mt-1">Enter phone number, scan QR code, or use payment link</p>
          </div>

          <div className="p-8">
            <Tabs defaultValue="phone" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-xl p-1 mb-6">
                <TabsTrigger 
                  value="phone" 
                  className="flex gap-2 items-center data-[state=active]:bg-white rounded-lg py-3 font-medium"
                >
                  <Search className="h-4 w-4" /> Phone / Link
                </TabsTrigger>
                <TabsTrigger 
                  value="qr" 
                  className="flex gap-2 items-center data-[state=active]:bg-white rounded-lg py-3 font-medium"
                >
                  <QrCode className="h-4 w-4" /> Scan QR Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="phone">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="lookup" className="text-sm font-medium text-foreground">
                      Phone Number or Payment Link
                    </Label>
                    <div className="flex gap-3 mt-2">
                      <Input
                        id="lookup"
                        type="text"
                        placeholder="+260... or payment link ID"
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
                    <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 mt-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-2xl">
                          {receiverProfile.full_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-foreground">{receiverProfile.full_name}</h3>
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </div>
                          <p className="text-muted-foreground">{receiverProfile.phone_number}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="qr">
                <div className="text-center py-12 bg-muted rounded-xl border-2 border-dashed border-border">
                  <QrCode className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-foreground mb-2 font-medium">QR Code Scanner</p>
                  <p className="text-sm text-muted-foreground">
                    Scan the receiver's QR code to automatically fill their details
                  </p>
                  <Button className="mt-6 bg-gradient-to-r from-primary to-accent">
                    Open Camera
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
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

                {amount && parseFloat(amount) > 0 && (
                  <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Exchange rate</span>
                        <span className="font-medium text-foreground">1 USD = {exchangeRate} ZMW</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Transfer fee</span>
                        <span className="font-semibold text-foreground">${transferFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total to pay</span>
                        <span className="font-semibold text-foreground">
                          ${(parseFloat(amount) + transferFee).toFixed(2)}
                        </span>
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
                  disabled={loading || !amount || parseFloat(amount) <= 0}
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
                    <p className="text-2xl sm:text-3xl font-bold text-secondary mb-3">${(parseFloat(amount) + transferFee).toFixed(2)}</p>
                    <div className="bg-card rounded-lg p-3 sm:p-4 border border-border">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">To this number:</p>
                      <p className="text-xl sm:text-2xl font-bold text-foreground mb-2">{paymentNumber}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Via: EcoCash / Airtel Money / OneMoney</p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                    <h3 className="font-semibold text-foreground text-base sm:text-lg">Note the Transaction Name</h3>
                  </div>
                  <div className="ml-11">
                    <Label htmlFor="senderName" className="text-sm font-medium text-foreground mb-2 block">
                      Name on Transaction
                    </Label>
                    <Input
                      id="senderName"
                      type="text"
                      placeholder="e.g., John Doe"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="h-12 text-base"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Enter the name exactly as shown on your payment receipt
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">3</div>
                    <h3 className="font-semibold text-foreground text-base sm:text-lg">Upload Proof</h3>
                  </div>
                  <div className="ml-11 bg-warning/10 border border-warning/30 rounded-xl p-3 sm:p-4">
                    <p className="text-xs sm:text-sm font-medium text-foreground mb-2">📸 Remember to:</p>
                    <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                      <li>Take a clear screenshot of your payment confirmation</li>
                      <li>Make sure the amount and transaction details are visible</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <Button 
                    onClick={handleConfirmPayment}
                    className="w-full h-12 sm:h-14 text-sm sm:text-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg font-bold" 
                    disabled={loading || !senderName.trim()}
                  >
                    {loading ? "Processing..." : "Continue to Upload Proof"}
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
