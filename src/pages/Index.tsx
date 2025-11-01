import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Zap, Globe2, TrendingUp, ArrowRight, Smartphone } from "lucide-react";
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
        const {
          data,
          error
        } = await supabase.from('settings').select('value').eq('key', 'transfer_fee_percentage').single();
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
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 rounded-md">
              
              <span className="text-xl sm:text-2xl text-primary font-bold">TuraPay</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {exchangeRate && <div className="hidden sm:flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 rounded-full">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  <span className="text-xs sm:text-sm font-semibold text-primary">1 USD = {exchangeRate.toFixed(2)} ZMW</span>
                </div>}
              <Button onClick={() => navigate("/auth")} className="text-xs sm:text-sm px-3 sm:px-6 h-8 sm:h-10">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-4 sm:space-y-6 text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-semibold text-primary">Zimbabwe to Zambia Transfer</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Send Money to
                <span className="block text-primary mt-1 sm:mt-2">
                  Zambia Instantly
                </span>
              </h1>

              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Fast, secure, and reliable money transfers. Your recipient gets funds instantly to their mobile money wallet with competitive rates.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button size="lg" onClick={() => navigate("/auth")} className="h-11 sm:h-12 md:h-14 px-6 sm:px-8 text-sm sm:text-base">
                  Start Sending Money
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </div>
            </div>

            {/* Right - Calculator Card */}
            <div className="order-1 lg:order-2">
              <Card className="bg-card shadow-xl rounded-2xl border p-4 sm:p-6 md:p-8 max-w-md mx-auto">
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">You pay</label>
                    <div className="relative">
                      <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} className="pr-16 h-12 sm:h-14 text-lg sm:text-xl font-bold" min="1" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sm">USD</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                      <ArrowRight className="h-5 w-5 rotate-90 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">They receive</label>
                    <div className="relative">
                      <Input type="text" value={recipientGets} readOnly className="pr-16 h-12 sm:h-14 text-lg sm:text-xl font-bold bg-muted" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-sm">ZMW</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-muted-foreground">Receive method</label>
                    <Input type="text" value="Mobile Money (MTN/Airtel)" readOnly className="h-10 sm:h-12 text-xs sm:text-sm bg-muted" />
                  </div>

                  <div className="rounded-xl p-3 sm:p-4 space-y-2 bg-primary/5">
                    <p className="text-xs sm:text-sm font-semibold text-center text-primary">
                      Competitive rates • Instant delivery • Secure
                    </p>
                  </div>

                  <Button onClick={() => navigate("/auth")} className="w-full h-12 sm:h-14 text-sm sm:text-base font-bold">
                    Get Started
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-primary">About TuraPay</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
              Your trusted partner for fast and affordable money transfers from Zimbabwe to Zambia.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-card rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-10 border">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center text-primary">Our Mission</h3>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed text-center text-muted-foreground">
              Making cross-border payments easy, secure, and convenient. TuraPay enables instant payments 
              across Africa by providing reliable money transfer services that connect families and businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-primary">Why Choose TuraPay?</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Secure and reliable cross-border payments
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group hover:border-primary/50">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform bg-gradient-to-br from-primary to-accent">
                <Zap className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2 text-primary">Lightning Fast</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Instant transfers to mobile money wallets in minutes
              </p>
            </Card>

            <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group hover:border-primary/50">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform bg-gradient-to-br from-secondary to-primary">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2 text-primary">Secure</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Bank-level encryption and security protocols
              </p>
            </Card>

            <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group hover:border-primary/50">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform bg-gradient-to-br from-accent to-secondary">
                <Globe2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2 text-primary">Great Rates</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Competitive exchange rates with transparent pricing
              </p>
            </Card>

            <Card className="p-4 sm:p-6 hover:shadow-xl transition-all duration-300 group hover:border-primary/50">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform bg-gradient-to-br from-primary to-secondary">
                <Smartphone className="h-6 w-6 sm:h-7 sm:w-7 text-primary-foreground" />
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2 text-primary">Mobile Money</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Direct to Airtel and MTN Money wallets
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-primary">How It Works</h2>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground">Send money in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {[{
            step: "1",
            title: "Create Account",
            description: "Sign up in seconds with your phone and email",
            icon: "👤"
          }, {
            step: "2",
            title: "Enter Details",
            description: "Choose recipient and enter amount to send",
            icon: "💰"
          }, {
            step: "3",
            title: "Make Payment",
            description: "Pay via EcoCash and recipient gets funds instantly",
            icon: "✅"
          }].map((item, index) => <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex w-14 h-14 sm:w-16 sm:h-16 rounded-2xl items-center justify-center mb-4 shadow-lg bg-gradient-to-br from-primary to-accent">
                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-primary">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground px-2">{item.description}</p>
                </div>
                {index < 2 && <div className="hidden md:block absolute top-8 left-full w-full h-0.5 -translate-x-8 bg-gradient-to-r from-primary/50 to-transparent" />}
              </div>)}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 overflow-hidden bg-gradient-to-br from-primary to-accent">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-4 sm:mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-primary-foreground/90 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-4">
            Join thousands sending money across borders with TuraPay
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")} className="h-12 sm:h-14 md:h-16 px-6 sm:px-8 md:px-10 text-sm sm:text-base md:text-lg bg-background text-primary hover:bg-background/90">
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                
                <span className="text-lg sm:text-xl font-bold text-primary">TuraPay</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Fast and secure money transfers from Zimbabwe to Zambia
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 text-primary">Company</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>About Us</li>
                <li>How It Works</li>
                <li>Pricing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 text-primary">Support</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>FAQs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 text-primary">Legal</h3>
              <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © 2024 TuraPay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;