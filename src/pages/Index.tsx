import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SendIcon, Download, Shield, Zap, Globe2, CheckCircle2, TrendingUp, ArrowRight, Smartphone, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [amount, setAmount] = useState(100);
  const [transferFeePercentage, setTransferFeePercentage] = useState(12);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch exchange rate
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        
        if (data.rates && data.rates.ZMW) {
          setExchangeRate(data.rates.ZMW);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }

      // Fetch transfer fee from database
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'transfer_fee_percentage')
          .single();
        
        if (!error && data) {
          setTransferFeePercentage(parseFloat(data.value));
        }
      } catch (error) {
        console.error('Error fetching transfer fee:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const recipientGets = exchangeRate ? (amount * exchangeRate).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative bg-card/80 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">TuraPay</span>
            </div>
            <div className="flex items-center gap-4">
              {exchangeRate && (
                <div className="hidden sm:flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  <span className="text-sm font-semibold text-secondary">1 USD = {exchangeRate.toFixed(2)} ZMW</span>
                </div>
              )}
              <Button 
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-primary to-accent hover:shadow-lg transition-all"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-primary">Cross-Border Money Transfer</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Send Money to
              <span className="block bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Zambia in Seconds
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              Fast, secure, and reliable cross-border money transfers from Zimbabwe to Zambia. 
              Your recipient gets funds instantly to their mobile money wallet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg"
                onClick={() => navigate("/auth")}
                className="h-14 px-8 text-lg bg-gradient-to-r from-primary via-accent to-secondary hover:shadow-2xl transition-all group"
              >
                Start Sending Money
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate("/auth")}
                className="h-14 px-8 text-lg border-2 hover:bg-muted"
              >
                Receive Money
              </Button>
            </div>

          </div>

          {/* Right - Calculator Card */}
          <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <Card className="relative bg-card/80 backdrop-blur-xl border-2 border-border/50 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-3xl -translate-y-32 translate-x-32" />
              
              <div className="relative p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-foreground">Send Money</h3>
                  <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">Instant</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">You Send</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                        className="pl-12 pr-20 h-16 text-2xl font-bold border-2 focus:border-primary"
                        min="1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">USD</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ArrowRight className="h-5 w-5 text-primary rotate-90" />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Exchange Rate</span>
                      <span className="font-semibold text-foreground">
                        1 USD = {exchangeRate ? exchangeRate.toFixed(2) : '--'} ZMW
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Transfer Fee</span>
                      <span className="font-semibold text-foreground">{transferFeePercentage}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total to Pay</span>
                      <span className="font-semibold text-foreground">${(amount + (amount * transferFeePercentage / 100)).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-primary/20 pt-3 mt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground font-medium">Recipient Gets</span>
                        <span className="text-2xl font-bold text-primary">{recipientGets} ZMW</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate("/auth")}
                  className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all"
                >
                  Continue
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why Choose TuraPay?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of cross-border payments with our secure and reliable platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Transfers complete in minutes, not days. Real-time processing for instant delivery.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-secondary/50 group">
              <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary/70 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Bank-Level Security</h3>
              <p className="text-sm text-muted-foreground">
                Your money and data are protected with enterprise-grade encryption.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/50 group">
              <div className="w-14 h-14 bg-gradient-to-br from-accent to-accent/70 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Globe2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Transparent Pricing</h3>
              <p className="text-sm text-muted-foreground">
                No hidden fees. See exactly what you pay with our competitive rates.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 group">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Mobile Money</h3>
              <p className="text-sm text-muted-foreground">
                Direct delivery to Airtel Money, MTN Money, and other mobile wallets.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground">Send money in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Create Account",
                description: "Sign up in seconds with your phone number and email. Quick verification process.",
                icon: "👤"
              },
              {
                step: "2",
                title: "Choose Recipient",
                description: "Search by phone number, scan QR code, or use their payment link ID.",
                icon: "🔍"
              },
              {
                step: "3",
                title: "Send & Track",
                description: "Make payment, upload proof, and track your transfer in real-time.",
                icon: "💸"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl items-center justify-center mb-4 shadow-lg">
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center -z-10">
                    <span className="text-xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3 mt-6">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary opacity-90" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of users sending and receiving money across borders. Fast, secure, and reliable.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="h-16 px-12 text-lg bg-white text-primary hover:bg-white/90 hover:shadow-2xl transition-all"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">TuraPay</div>
                <div className="text-sm text-muted-foreground">Secure cross-border transfers</div>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">© 2024 TuraPay. All rights reserved.</p>
              <p className="text-xs text-muted-foreground mt-1">Zimbabwe ↔️ Zambia</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
