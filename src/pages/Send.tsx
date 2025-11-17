import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Send as SendIcon, Search, User, CheckCircle2, Shield, CreditCard, Smartphone, BadgeCheck } from "lucide-react";
import { detectCardType, formatCardNumber, formatCardExpiry } from "@/lib/cardUtils";
import Navbar from "@/components/Navbar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import logo from "@/assets/logo.png";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Validation schemas
const transactionSchema = z.object({
  amount: z.number().positive({
    message: "Amount must be greater than 0"
  }).max(1000000, {
    message: "Amount cannot exceed $1,000,000"
  }).refine(val => Number.isFinite(val), {
    message: "Invalid amount"
  }),
  senderNumber: z.string().trim().min(1, {
    message: "Sender number is required"
  }).regex(/^\+?[\d\s\-()]+$/, {
    message: "Invalid phone number format"
  }).max(20, {
    message: "Phone number too long"
  }),
  transactionId: z.string().trim().min(1, {
    message: "Transaction ID is required"
  }).max(100, {
    message: "Transaction ID too long"
  })
});
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
  const [countryCode, setCountryCode] = useState("+260");
  const [lookupValue, setLookupValue] = useState("");
  const [receiverProfile, setReceiverProfile] = useState<ReceiverProfile | null>(null);
  const [autoLookupTimer, setAutoLookupTimer] = useState<NodeJS.Timeout | null>(null);
  const [amount, setAmount] = useState("");
  const [exchangeRate, setExchangeRate] = useState(27.5);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showPaymentInstructions, setShowPaymentInstructions] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("Mobile Money"); // Default to Mobile Money for Zambia
  const [paymentMethod, setPaymentMethod] = useState<"mobile" | "card" | "">("");
  const [paymentNumber, setPaymentNumber] = useState("+263 77 123 4567");
  const [paymentRecipientName, setPaymentRecipientName] = useState("Ticlapay");
  const [transferFeePercentage, setTransferFeePercentage] = useState(2);
  const [unverifiedLimit, setUnverifiedLimit] = useState(20);
  const [maxTransferLimit, setMaxTransferLimit] = useState(10000);
  const [senderNumber, setSenderNumber] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [senderVerified, setSenderVerified] = useState(false);
  const [processingCardPayment, setProcessingCardPayment] = useState(false);
  const [cardPaymentReference, setCardPaymentReference] = useState<string | null>(null);

  // Card details state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');
  const [cardPaymentsEnabled, setCardPaymentsEnabled] = useState(true);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [senderNameOnTransaction, setSenderNameOnTransaction] = useState("");
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
        // Fetch sender's verification status
        fetchSenderProfile(session.user.id);
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
    fetchUnverifiedLimit();
    fetchMaxTransferLimit();
    fetchCardPaymentsEnabled();

    // Fetch exchange rate
    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 300000); // Update every 5 minutes
    return () => clearInterval(interval);
  }, [navigate, searchParams]);
  const fetchSenderProfile = async (userId: string) => {
    try {
      const {
        data,
        error
      } = await supabase.from("profiles").select("verified").eq("id", userId).single();
      if (!error && data) {
        setSenderVerified(data.verified || false);
      }
    } catch (error) {
      console.error('Error fetching sender profile:', error);
    }
  };
  const fetchPaymentNumber = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("settings").select("value").eq("key", "payment_number").maybeSingle();
      if (!error && data) {
        setPaymentNumber(data.value);
      }
    } catch (error) {
      console.error('Error fetching payment number:', error);
    }
  };
  const fetchPaymentRecipientName = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("settings").select("value").eq("key", "payment_recipient_name").maybeSingle();
      if (!error && data) {
        setPaymentRecipientName(data.value);
      }
    } catch (error) {
      console.error('Error fetching payment recipient name:', error);
    }
  };
  const fetchTransferFee = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("settings").select("value").eq("key", "transfer_fee_percentage").maybeSingle();
      if (!error && data) {
        setTransferFeePercentage(parseFloat(data.value));
      }
    } catch (error) {
      console.error('Error fetching transfer fee:', error);
    }
  };
  const fetchUnverifiedLimit = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("settings").select("value").eq("key", "unverified_send_limit").maybeSingle();
      if (!error && data) {
        const v = parseFloat(data.value);
        if (!isNaN(v) && v >= 0) setUnverifiedLimit(v);
      }
    } catch (error) {
      console.error('Error fetching unverified send limit:', error);
    }
  };
  const fetchMaxTransferLimit = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("settings").select("value").eq("key", "max_transfer_limit").maybeSingle();
      if (!error && data) {
        const limit = parseFloat(data.value);
        if (!isNaN(limit) && limit > 0) setMaxTransferLimit(limit);
      }
    } catch (error) {
      console.error('Error fetching max transfer limit:', error);
    }
  };
  const fetchCardPaymentsEnabled = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from("settings").select("value").eq("key", "card_payments_enabled").maybeSingle();
      if (!error && data) {
        setCardPaymentsEnabled(data.value === 'true');
      }
    } catch (error) {
      console.error('Error fetching card payments setting:', error);
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
    const searchValue = value || getFullPhoneNumber();
    if (!searchValue) {
      toast.error("Please enter a phone number or payment link");
      return;
    }
    setLoading(true);
    try {
      // If it's a payment link ID (no digits or mostly letters), use backend RPC to bypass RLS safely
      if (!/\d{3,}/.test(searchValue)) {
        const {
          data,
          error
        } = await supabase.rpc('find_profile_by_payment_link', {
          _link: searchValue.trim()
        });
        if (error) throw error;
        const profile = Array.isArray(data) ? data[0] : data;
        if (profile) {
          setReceiverProfile(profile as ReceiverProfile);
          toast.success(`Receiver found: ${profile.full_name}`);
        } else {
          toast.error("Receiver not found. Please check the payment link.");
          setReceiverProfile(null);
        }
        setLoading(false);
        return;
      }

      // Phone lookup via RPC (handles normalization and RLS)
      const {
        data,
        error
      } = await supabase.rpc('find_profile_by_phone', {
        _phone: searchValue
      });
      if (error) throw error;
      const profile = Array.isArray(data) ? data[0] : data;
      if (profile) {
        setReceiverProfile(profile as ReceiverProfile);
        setLookupValue("");
        toast.success(`Receiver found: ${profile.full_name}`);
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

  // Handle lookup value change with auto-lookup for 9-digit numbers
  const handleLookupChange = (value: string) => {
    // Clear existing timer
    if (autoLookupTimer) {
      clearTimeout(autoLookupTimer);
    }

    // Only allow numbers (no + or other symbols in the input itself)
    const cleaned = value.replace(/\D/g, '');
    setLookupValue(cleaned);

    // Auto-lookup when 9 digits are entered
    if (cleaned.length === 9) {
      const fullNumber = countryCode + cleaned;
      const timer = setTimeout(() => {
        handleLookup(fullNumber);
      }, 500);
      setAutoLookupTimer(timer);
    }
  };
  const getFullPhoneNumber = () => {
    return countryCode + lookupValue;
  };
  const calculateFee = (amount: number) => {
    return amount * transferFeePercentage / 100;
  };
  const handleCardPayment = async () => {
    // Validate card details
    if (!cardNumber.trim() || !cardExpiry.trim() || !cardCVV.trim() || !cardholderName.trim()) {
      toast.error("Please fill in all card details");
      return;
    }

    // Basic card number validation (13-19 digits)
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleanCardNumber)) {
      toast.error("Invalid card number");
      return;
    }

    // Expiry validation (MM/YY format)
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      toast.error("Invalid expiry date. Use MM/YY format");
      return;
    }

    // CVV validation (3-4 digits)
    if (!/^\d{3,4}$/.test(cardCVV)) {
      toast.error("Invalid CVV");
      return;
    }
    setProcessingCardPayment(true);
    setCardPaymentReference("pending");
    try {
      const totalAmount = parseFloat(amount) + calculateFee(parseFloat(amount));
      const {
        data,
        error
      } = await supabase.functions.invoke('lipila-deposit', {
        body: {
          amount: totalAmount,
          currency: 'USD',
          cardNumber: cleanCardNumber,
          cardExpiry,
          cardCVV,
          cardholderName
        }
      });
      if (error) throw error;
      if (data.referenceId) {
        setCardPaymentReference(data.referenceId);
        toast.info("Processing payment...");

        // Poll for status
        setTimeout(() => checkCardPaymentStatus(data.referenceId, totalAmount), 5000);
      }
    } catch (error) {
      console.error('Card payment error:', error);
      toast.error(error.message || "Failed to process card payment");
      setProcessingCardPayment(false);
    }
  };
  const checkCardPaymentStatus = async (refId: string, totalAmount: number) => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('lipila-deposit', {
        body: {
          referenceId: refId,
          amount: totalAmount
        }
      });
      if (error) throw error;
      if (data.status === 'Successful') {
        toast.success("Payment successful! Sending money to receiver...");
        // Create transaction and initiate disbursement
        await createTransactionAfterPayment(refId, totalAmount);
      } else if (data.status === 'Pending') {
        setTimeout(() => checkCardPaymentStatus(refId, totalAmount), 5000);
      } else if (data.status === 'Failed') {
        toast.error(data.message || "Payment failed");
        setProcessingCardPayment(false);
        setCardPaymentReference(null);
      }
    } catch (error) {
      console.error('Status check error:', error);
      setTimeout(() => checkCardPaymentStatus(refId, totalAmount), 5000);
    }
  };
  const createTransactionAfterPayment = async (paymentRef: string, totalAmount: number) => {
    try {
      const {
        data: insertData,
        error: insertError
      } = await supabase.from("transactions").insert({
        sender_id: userId,
        receiver_name: receiverProfile!.full_name,
        receiver_phone: receiverProfile!.phone_number,
        receiver_country: "Zambia",
        amount: parseFloat(amount),
        currency: "USD",
        exchange_rate: exchangeRate,
        fee: calculateFee(parseFloat(amount)),
        total_amount: parseFloat(amount) + calculateFee(parseFloat(amount)),
        payout_method: payoutMethod,
        sender_name: senderName,
        sender_number: cardholderName,
        // Use cardholder name for card payments
        transaction_id: paymentRef,
        payment_reference: paymentRef,
        status: "processing"
      }).select().single();
      if (insertError) throw insertError;

      // Initiate disbursement to receiver
      const amountInZMW = parseFloat(amount) * exchangeRate;
      const {
        data: disbursementData,
        error: disbursementError
      } = await supabase.functions.invoke('lipila-disbursement', {
        body: {
          amount: amountInZMW,
          currency: 'ZMW',
          accountNumber: receiverProfile!.phone_number,
          transactionId: insertData.id
        }
      });
      if (disbursementError) {
        console.error('Disbursement error:', disbursementError);
        toast.warning("Payment received but disbursement failed. Our team will process manually.");
      } else {
        toast.success("Transfer completed! Money sent to receiver.");
      }
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error('Transaction creation error:', error);
      toast.error("Payment successful but failed to create transaction record");
    } finally {
      setProcessingCardPayment(false);
      setCardPaymentReference(null);
    }
  };
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Check if amount exceeds maximum transfer limit
    if (numAmount > maxTransferLimit) {
      toast.error(`Maximum transfer amount is $${maxTransferLimit} USD. Please enter a lower amount.`);
      return;
    }

    // Check if unverified user is trying to send more than allowed limit
    if (!senderVerified && numAmount > unverifiedLimit) {
      toast.error(`Unverified users can only send up to $${unverifiedLimit} USD. Please complete verification to send larger amounts.`);
      return;
    }
    if (!payoutMethod) {
      toast.error("Please select a payout method");
      return;
    }
    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }
    setShowPaymentInstructions(true);
  };
  const handleConfirmPayment = async () => {
    if (!receiverProfile || !userId) {
      toast.error("Missing required information");
      return;
    }

    // Show upload proof dialog
    setShowPaymentInstructions(false);
    setShowProofUpload(true);
  };

  const handleConfirmPaymentAndNavigate = async () => {
    if (!userId || !receiverProfile || !amount) {
      toast.error("Missing required information");
      return;
    }

    setLoading(true);
    try {
      // Create the transaction first
      const {
        data: insertData,
        error: insertError
      } = await supabase.from("transactions").insert({
        sender_id: userId,
        receiver_name: receiverProfile.full_name,
        receiver_phone: receiverProfile.phone_number,
        receiver_country: "Zambia",
        amount: parseFloat(amount),
        currency: "USD",
        exchange_rate: exchangeRate,
        fee: calculateFee(parseFloat(amount)),
        total_amount: parseFloat(amount) + calculateFee(parseFloat(amount)),
        payout_method: payoutMethod,
        status: "pending"
      }).select().single();
      
      if (insertError) throw insertError;

      // Navigate to upload proof page with transaction ID
      navigate(`/upload-proof?transaction=${insertData.id}`);
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      toast.error(error.message || "Failed to create transaction");
    } finally {
      setLoading(false);
    }
  };
  const recipientGets = amount ? (parseFloat(amount) * exchangeRate).toFixed(2) : "0.00";
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src={logo} alt="Tangila Pay Logo" className="w-8 h-8 rounded-lg object-cover shadow-lg" />
              <span className="font-mono text-blue-500 text-lg font-bold">Ticla-Pay</span>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2 transition-all hover-scale border-primary/20 bg-blue-600 hover:bg-blue-500 text-slate-50">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 flex items-center gap-2 sm:gap-3">
            <SendIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            Send Money
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Send money to Zambia instantly via mobile money
          </p>
        </div>

        {/* Lookup Section */}
        <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-primary to-accent px-4 sm:px-8 py-4 sm:py-6">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-foreground flex items-center gap-2 sm:gap-3">
              <Search className="h-5 w-5 sm:h-6 sm:w-6" />
              Find Receiver
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/90 mt-1">Enter phone number to find receiver</p>
          </div>

          <div className="p-8">
            <div className="space-y-4">
              <div>
                <Label htmlFor="lookup" className="text-sm font-medium text-foreground mb-2 block">
                  Phone Number
                </Label>
                <div className="flex gap-3 mt-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium text-muted-foreground pointer-events-none">
                      +260
                    </span>
                    <Input id="lookup" type="tel" placeholder="976 543 210" value={lookupValue} onChange={e => handleLookupChange(e.target.value)} className="h-12 text-base font-medium tracking-wide bg-card border border-primary/20 hover:border-primary/50 focus:border-primary rounded-lg pl-16 pr-4 transition-all placeholder:text-muted-foreground/60" maxLength={9} />
                  </div>
                  
                </div>
                {lookupValue && <p className="text-xs text-muted-foreground mt-2">
                    {lookupValue.length}/9 digits • Full number: {getFullPhoneNumber()}
                  </p>}
              </div>
            </div>
          </div>

          {receiverProfile && <div className="p-8 pt-0">
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg sm:text-xl font-bold text-foreground">{receiverProfile.full_name}</h3>
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                        {receiverProfile.verified && <div className="flex items-center gap-1 bg-green-500/10 text-green-600 px-2 py-1 rounded-full">
                            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span className="text-xs font-medium">Verified</span>
                          </div>}
                      </div>
                      <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-background/80 px-4 py-2 rounded-lg border border-border/60">
                          <User className="h-5 w-5 text-primary" />
                          <span className="text-base sm:text-lg font-mono font-semibold text-foreground">{receiverProfile.phone_number}</span>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </div>
            </div>}
        </div>

        {/* Send Money Form */}
        {receiverProfile && !showPaymentInstructions && <form onSubmit={handleProceedToPayment}>
            <div className="bg-card rounded-2xl shadow-sm border border-border overflow-hidden mb-6">
              <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-border">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground">Transfer Amount</h2>
              </div>
              <div className="p-4 sm:p-8">
                <div className="mb-6">
                  <Label htmlFor="amount" className="text-sm font-medium text-foreground block mb-2">
                    Recipient will receive (in USD)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-base sm:text-lg">$</span>
                    <Input id="amount" type="number" step="0.01" min="1" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} className="pl-8 sm:pl-10 pr-12 sm:pr-16 h-12 sm:h-16 text-xl sm:text-2xl font-semibold focus:border-primary" required />
                    <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm sm:text-base">USD</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">This is the amount your recipient will receive before conversion to ZMW</p>
                </div>

                

                <div className="mb-6">
                  <Label className="text-sm font-medium text-foreground block mb-3">
                    How would you like to pay?
                  </Label>
                  <RadioGroup value={paymentMethod} onValueChange={value => setPaymentMethod(value as "mobile" | "card")} required>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                        <RadioGroupItem value="mobile" id="mobile" />
                        <Label htmlFor="mobile" className="flex items-center gap-3 cursor-pointer flex-1">
                          <Smartphone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium">Mobile Money</p>
                            <p className="text-xs text-muted-foreground">Pay via EcoCash</p>
                          </div>
                        </Label>
                      </div>
                      {cardPaymentsEnabled && <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                          <RadioGroupItem value="card" id="card" />
                          <Label htmlFor="card" className="flex items-center gap-3 cursor-pointer flex-1">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <div>
                              <p className="font-medium">Card Payment</p>
                              <p className="text-xs text-muted-foreground">Mastercard, Visa via Lipila</p>
                            </div>
                          </Label>
                        </div>}
                    </div>
                  </RadioGroup>
                </div>

                {amount && parseFloat(amount) > 0 && <div className="bg-primary/10 rounded-xl p-4 sm:p-6 border border-primary/20">
                    <div className="space-y-3">
                      
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Transfer fee ({transferFeePercentage}%)</span>
                        <span className="font-medium text-foreground">+ ${calculateFee(parseFloat(amount)).toFixed(2)} USD</span>
                      </div>
                      <div className="border-t border-primary/20 pt-2 mt-2 mb-3">
                        <div className="flex justify-between items-center">
                          <span className="text-foreground font-semibold text-sm sm:text-base lg:text-lg">Total you send</span>
                          <span className="font-bold text-base sm:text-lg lg:text-xl text-foreground">${(parseFloat(amount) + calculateFee(parseFloat(amount))).toFixed(2)} USD</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground">Exchange rate</span>
                        <span className="font-medium text-foreground">1 USD = {exchangeRate} ZMW</span>
                      </div>
                      <div className="border-t border-primary/20 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-foreground font-medium text-sm sm:text-base">Recipient receives</span>
                          <span className="font-bold text-lg sm:text-xl lg:text-2xl text-primary">{recipientGets} ZMW</span>
                        </div>
                      </div>
                    </div>
                  </div>}

                <Button type="submit" className="w-full mt-6 sm:mt-8 h-12 sm:h-14 text-base sm:text-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg" disabled={loading || !amount || parseFloat(amount) <= 0 || !payoutMethod || !paymentMethod}>
                  Continue to Payment
                </Button>
              </div>
            </div>
          </form>}

        {/* Payment Instructions */}
        {receiverProfile && showPaymentInstructions && <div className="space-y-6">
            <Card className="overflow-hidden shadow-lg border-2 border-primary/20">
              <div className="bg-gradient-to-r from-primary to-accent px-4 sm:px-8 py-6">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground">Payment Instructions</h2>
                <p className="text-sm sm:text-base text-primary-foreground/90 mt-1">Complete your transfer in 3 steps</p>
              </div>
              
              <div className="p-4 sm:p-8 space-y-6">
                {/* Step 1 - Different for mobile vs card */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">1</div>
                    <h3 className="font-semibold text-foreground text-base sm:text-lg">
                      {paymentMethod === "mobile" ? "Where to Send the Money" : "Pay with Card"}
                    </h3>
                  </div>
                  <div className="ml-11 bg-secondary/10 rounded-xl p-4 sm:p-6 border-2 border-secondary/30">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">
                      {paymentMethod === "mobile" ? "Send this exact amount:" : "Amount to pay:"}
                    </p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary mb-3">${(parseFloat(amount) + calculateFee(parseFloat(amount))).toFixed(2)}</p>
                    
                    {paymentMethod === "mobile" ? <div className="bg-card rounded-lg p-3 sm:p-4 border border-border">
                        <p className="text-xs sm:text-sm font-semibold text-primary mb-2">📱 Send money to:</p>
                        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mb-2">{paymentNumber}</p>
                        <p className="text-xs sm:text-sm font-semibold text-foreground mb-1">Recipient: {paymentRecipientName}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">Method: EcoCash</p>
                      </div> : <div className="bg-card rounded-lg p-3 sm:p-4 border border-border space-y-4">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <p className="text-sm font-semibold text-primary">Secure Card Payment via Lipila</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Enter your card details below. Your payment will be processed securely.
                        </p>
                        
                        {/* Cardholder Name */}
                        <div>
                          <Label htmlFor="cardholderName" className="text-sm font-medium text-foreground mb-2 block">
                            Cardholder Name *
                          </Label>
                          <Input id="cardholderName" type="text" placeholder="John Doe" value={cardholderName} onChange={e => setCardholderName(e.target.value)} className="h-12 text-base" required disabled={processingCardPayment || cardPaymentReference !== null} />
                        </div>

                        {/* Card Number */}
                        <div>
                          <Label htmlFor="cardNumber" className="text-sm font-medium text-foreground mb-2 block">
                            Card Number *
                          </Label>
                          <div className="relative">
                            <Input id="cardNumber" type="text" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e => {
                        const formatted = formatCardNumber(e.target.value);
                        setCardNumber(formatted);
                        setCardType(detectCardType(formatted));
                      }} maxLength={19} className="h-12 text-base pr-12" required disabled={processingCardPayment || cardPaymentReference !== null} />
                            {cardType !== 'unknown' && <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {cardType === 'visa' && <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                                    <BadgeCheck className="h-4 w-4" />
                                    <span>Visa</span>
                                  </div>}
                                {cardType === 'mastercard' && <div className="flex items-center gap-1 text-xs font-semibold text-primary">
                                    <BadgeCheck className="h-4 w-4" />
                                    <span>Mastercard</span>
                                  </div>}
                              </div>}
                          </div>
                        </div>

                        {/* Expiry and CVV */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cardExpiry" className="text-sm font-medium text-foreground mb-2 block">
                              Expiry Date *
                            </Label>
                            <Input id="cardExpiry" type="text" placeholder="MM/YY" value={cardExpiry} onChange={e => {
                        const formatted = formatCardExpiry(e.target.value);
                        setCardExpiry(formatted);
                      }} maxLength={5} className="h-12 text-base" required disabled={processingCardPayment || cardPaymentReference !== null} />
                          </div>
                          <div>
                            <Label htmlFor="cardCVV" className="text-sm font-medium text-foreground mb-2 block">
                              CVV *
                            </Label>
                            <Input id="cardCVV" type="text" placeholder="123" value={cardCVV} onChange={e => setCardCVV(e.target.value.replace(/\D/g, ''))} maxLength={4} className="h-12 text-base" required disabled={processingCardPayment || cardPaymentReference !== null} />
                          </div>
                        </div>

                        {!cardPaymentReference ? <Button onClick={handleCardPayment} className="w-full" disabled={processingCardPayment || !cardNumber || !cardExpiry || !cardCVV || !cardholderName}>
                            {processingCardPayment ? "Processing..." : "Pay with Card"}
                          </Button> : <div className="text-center text-sm">
                            <p className="font-medium text-primary">Payment initiated</p>
                            <p className="text-muted-foreground mt-1">Ref: {cardPaymentReference.slice(0, 8)}...</p>
                            <p className="text-muted-foreground">Waiting for payment completion...</p>
                          </div>}
                      </div>}
                  </div>
                </div>

                {/* Step 2 - Confirm Payment */}
                {paymentMethod === "mobile" && <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">2</div>
                      <h3 className="font-semibold text-foreground text-base sm:text-lg">Confirm Payment</h3>
                    </div>
                    <div className="ml-11 bg-success/10 border border-success/30 rounded-xl p-3 sm:p-4">
                      <p className="text-xs sm:text-sm font-medium text-foreground mb-2">After sending the money:</p>
                      <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 ml-4 list-disc">
                        <li>Click the "I've Sent the Money" button below</li>
                        <li>You'll be asked to upload a screenshot of your payment</li>
                        <li>Our admin team will review and confirm your payment</li>
                      </ul>
                    </div>

                    <div className="space-y-3 pt-4">
                      <Button onClick={handleConfirmPayment} className="w-full h-12 sm:h-14 text-sm sm:text-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg font-bold" disabled={loading}>
                        {loading ? "Processing..." : "I've Sent the Money"}
                      </Button>

                      <Button variant="outline" onClick={() => setShowPaymentInstructions(false)} className="w-full h-10 sm:h-12 text-sm sm:text-base">
                        Go Back
                      </Button>
                    </div>
                  </div>}

                {/* For card payment, just show a back button */}
                {paymentMethod === "card" && !processingCardPayment && !cardPaymentReference && <div className="pt-4">
                    <Button variant="outline" onClick={() => setShowPaymentInstructions(false)} className="w-full h-10 sm:h-12 text-sm sm:text-base">
                      Go Back
                    </Button>
                  </div>}
              </div>
            </Card>
          </div>}

        {/* Payment Confirmation Section */}
        {showProofUpload && <div className="space-y-6">
            <Card className="overflow-hidden shadow-lg border-2 border-primary/20">
              <div className="bg-gradient-to-r from-primary to-accent px-4 sm:px-8 py-6">
                <h2 className="text-xl sm:text-2xl font-bold text-primary-foreground">Confirm Payment</h2>
                <p className="text-sm sm:text-base text-primary-foreground/90 mt-1">Click below to upload your payment proof</p>
              </div>
              
              <div className="p-4 sm:p-8 space-y-6">
                <div className="bg-muted/50 border border-border rounded-xl p-4 sm:p-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-1" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Next Step</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        You'll be taken to a page where you can upload your payment screenshot and enter the name on your transaction.
                      </p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleConfirmPaymentAndNavigate} 
                  className="w-full h-12 sm:h-14 text-sm sm:text-lg bg-gradient-to-r from-primary to-accent hover:shadow-lg font-bold"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Continue to Upload Proof"}
                </Button>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowProofUpload(false);
                    setShowPaymentInstructions(true);
                  }} 
                  className="w-full h-10 sm:h-12 text-sm sm:text-base"
                  disabled={loading}
                >
                  Go Back
                </Button>
              </div>
            </Card>
          </div>}
      </div>
    </div>;
};

export default Send;