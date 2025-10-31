import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SendIcon, Download, Shield, Zap, Globe2, CheckCircle2, TrendingUp, ArrowRight, Smartphone, Clock, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-image.jpg";

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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlays */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Hero Image Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        
        {/* Lighter Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/60 via-primary/50 to-accent/60" />
        
        {/* Additional Subtle Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
        
        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-primary via-primary to-primary/90 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4 md:py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl md:text-3xl font-bold text-primary-foreground">T</span>
              </div>
              <span className="text-2xl md:text-3xl font-bold text-primary-foreground">TuraPay</span>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              {exchangeRate && (
                <div className="hidden sm:flex items-center gap-2 px-4 md:px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <TrendingUp className="h-4 w-4 text-white" />
                  <span className="text-xs md:text-sm font-bold text-white">1 USD = {exchangeRate.toFixed(2)} ZMW</span>
                </div>
              )}
              <Button 
                onClick={() => navigate("/auth")}
                className="text-sm md:text-base px-5 md:px-7 h-10 md:h-11 font-bold bg-white text-primary hover:bg-white/90 transition-all shadow-lg"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 md:space-y-8 animate-fade-in text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm border border-white/20">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-xs md:text-sm font-semibold text-white">Zimbabwe to Zambia Money Transfer</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-white">
                Send Money to
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-accent to-secondary mt-2">
                  Zambia Instantly
                </span>
              </h1>

              <p className="text-base md:text-lg lg:text-xl leading-relaxed text-white/90 max-w-2xl mx-auto lg:mx-0">
                We help you send more money home with our competitive rates. Fast, secure, and reliable cross-border money transfers. Your recipient gets funds instantly to their mobile money wallet.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg bg-white hover:bg-white/90 text-primary transition-all font-bold shadow-xl hover:shadow-2xl"
                >
                  Start Sending Money
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="h-12 md:h-14 px-6 md:px-8 text-base md:text-lg bg-white/10 backdrop-blur-sm border-2 border-white text-white hover:bg-white/20 transition-all font-bold"
                >
                  Learn More
                </Button>
              </div>
            </div>

            {/* Right - Calculator Card */}
            <div className="relative animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <Card className="relative bg-card/98 backdrop-blur-xl shadow-2xl overflow-hidden rounded-2xl border-2 border-white/20">
                <div className="relative p-6 md:p-8 space-y-6">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">You pay</label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                        className="pr-24 h-14 text-xl font-bold border-2 bg-background"
                        min="1"
                        placeholder="Enter amount"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground font-bold text-sm">USD</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                      <ArrowRight className="h-5 w-5 rotate-90 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">They receive</label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={recipientGets}
                        readOnly
                        className="pr-24 h-14 text-xl font-bold border-2 bg-muted"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground font-bold text-sm">ZMW</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground">Receive method</label>
                    <div className="relative">
                      <Input
                        type="text"
                        value="Mobile Money (MTN/Airtel)"
                        readOnly
                        className="h-12 text-sm border-2 bg-muted"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl p-4 space-y-2 bg-primary/10">
                    <p className="text-sm font-bold text-center text-primary">
                      Competitive rates • Instant delivery • Secure transfers
                    </p>
                    <p className="text-xs text-center text-muted-foreground">
                      Prices may vary slightly at time of order
                    </p>
                  </div>

                  <Button 
                    onClick={() => navigate("/auth")}
                    className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-all shadow-lg"
                  >
                    Get Started
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* About TuraPay Section */}
      <section className="relative py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">About TuraPay</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              TuraPay is your trusted partner for fast and affordable money transfers from Zimbabwe to Zambia. 
              We combine advanced technology with accessible cash collection points to ensure your family gets 
              the money they need, when they need it.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-card rounded-2xl shadow-lg p-6 md:p-10 mb-12 border">
            <h3 className="text-2xl font-bold mb-6 text-center text-primary">Our Mission</h3>
            <p className="text-foreground text-lg leading-relaxed text-center">
              Making cross-border payments easy, secure, and convenient. TuraPay enables instant payments 
              across Africa by providing reliable money transfer services that connect families and businesses. 
              We understand the importance of financial connectivity and strive to make every transaction seamless.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">Why Choose TuraPay?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the future of cross-border payments with our secure and reliable platform
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 group hover:border-primary/50">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-gradient-to-br from-primary to-accent">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">
                Transfers complete in minutes, not days. Real-time processing ensures your recipient gets funds instantly to their mobile money wallet.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 group hover:border-primary/50">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-gradient-to-br from-secondary to-primary">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">Bank-Level Security</h3>
              <p className="text-sm text-muted-foreground">
                Your money and personal data are protected with enterprise-grade encryption and security protocols at every step.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 group hover:border-primary/50">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-gradient-to-br from-accent to-secondary">
                <Globe2 className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">Competitive Rates</h3>
              <p className="text-sm text-muted-foreground">
                No hidden fees. Transparent pricing with competitive exchange rates so you know exactly what you're paying.
              </p>
            </Card>

            <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 group hover:border-primary/50">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform bg-gradient-to-br from-primary to-secondary">
                <Smartphone className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-primary">Mobile Money Direct</h3>
              <p className="text-sm text-muted-foreground">
                Direct delivery to Airtel Money and MTN Money wallets. Recipients get instant access to funds on their phones.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-16 md:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-primary">How It Works</h2>
            <p className="text-lg text-muted-foreground">Send money in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Create Account",
                description: "Sign up in seconds with your phone number and email. Quick verification process to get you started.",
                icon: "👤"
              },
              {
                step: "2",
                title: "Enter Details",
                description: "Choose your recipient by phone number or payment link, enter the amount, and see the exact rate.",
                icon: "💰"
              },
              {
                step: "3",
                title: "Make Payment",
                description: "Pay via EcoCash, provide payment confirmation, and your recipient gets funds instantly via mobile money.",
                icon: "✅"
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-4 shadow-lg bg-gradient-to-br from-primary to-accent">
                    <span className="text-3xl">{item.icon}</span>
                  </div>
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center -z-10 bg-primary/10">
                    <span className="text-xl font-bold text-primary">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 mt-6 text-primary">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-0.5 -translate-x-8 bg-gradient-to-r from-primary/50 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 md:py-20 overflow-hidden bg-gradient-to-br from-primary via-accent to-secondary">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of users sending and receiving money across borders with TuraPay. 
            Fast, secure, and reliable transfers from Zimbabwe to Zambia with competitive rates.
          </p>
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="h-14 md:h-16 px-8 md:px-12 text-base md:text-lg bg-white text-primary hover:bg-white/90 hover:shadow-2xl transition-all font-bold"
          >
            Create Free Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">TuraPay</div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your trusted partner for fast and affordable cross-border money transfers between Zimbabwe and Zambia.
              </p>
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">Send Money</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Receive Money</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Mobile Money Transfers</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Currency Exchange</li>
              </ul>
            </div>
            <div>
              <h4 className="text-foreground font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary cursor-pointer transition-colors">Help Center</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Track Transfer</li>
                <li className="hover:text-primary cursor-pointer transition-colors">Contact Us</li>
                <li className="hover:text-primary cursor-pointer transition-colors">FAQs</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">© 2024 TuraPay. All rights reserved.</p>
              <p className="text-sm text-muted-foreground">Zimbabwe ↔️ Zambia Money Transfers</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
