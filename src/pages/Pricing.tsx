import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Pricing = () => {
  const navigate = useNavigate();
  const [feePercentage, setFeePercentage] = useState(5);

  useEffect(() => {
    const fetchFee = async () => {
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "transfer_fee_percentage")
        .single();
      
      if (data) {
        setFeePercentage(parseFloat(data.value));
      }
    };
    fetchFee();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-xl font-bold text-primary">Tangila Pay</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Simple & Transparent Pricing</h1>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          No hidden fees. Just clear, straightforward pricing for your cross-border transfers.
        </p>

        <Card className="p-8 mb-8 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-2">Transfer Fee</h2>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-6xl font-bold text-primary">{feePercentage}%</span>
              <span className="text-muted-foreground text-xl">per transfer</span>
            </div>
          </div>
          <p className="text-center text-muted-foreground mb-6">
            One simple fee on all transfers. No surprises, no hidden charges.
          </p>
          <div className="flex justify-center">
            <Button onClick={() => navigate("/auth")} size="lg">
              Start Sending Money
            </Button>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">What's Included</h3>
            <ul className="space-y-3">
              {[
                "Live exchange rates",
                "Instant transfers",
                "Mobile money payout",
                "24/7 customer support",
                "Transaction tracking",
                "Secure payments"
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Example Transfer</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-muted-foreground">You send</span>
                <span className="font-bold text-lg">$100.00 USD</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-muted-foreground">Transfer fee ({feePercentage}%)</span>
                <span className="font-bold text-lg text-destructive">-${(100 * feePercentage / 100).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-muted-foreground">Total cost</span>
                <span className="font-bold text-lg">${(100 + 100 * feePercentage / 100).toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-foreground font-semibold">Recipient gets</span>
                <span className="font-bold text-2xl text-primary">ZMW 2,800*</span>
              </div>
              <p className="text-xs text-muted-foreground">
                * Amount in ZMW depends on current exchange rate
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">Why Our Pricing?</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Transparent & Fair</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We believe in transparent pricing. What you see is what you pay - no hidden fees, no surprises.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Competitive Rates</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our rates are among the best in the market, ensuring you get maximum value for your money.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Live Exchange Rates</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We use real-time exchange rates so your recipient always gets the best possible amount.
              </p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Pricing;