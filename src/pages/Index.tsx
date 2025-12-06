import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Zap, Globe2, TrendingUp, ArrowRight, Smartphone, CheckCircle, Clock, Lock, User, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/ticlapay-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [amount, setAmount] = useState(100);
  const [transferFeePercentage, setTransferFeePercentage] = useState(12);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        const data = await response.json();
        if (data.rates && data.rates.ZMW) {
          setExchangeRate(data.rates.ZMW);
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }

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

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant transfers to mobile money wallets. Your recipient gets funds in minutes, not days."
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Advanced encryption and fraud protection. Your money and data are always safe with us."
    },
    {
      icon: Globe2,
      title: "Competitive Rates",
      description: "Best exchange rates with transparent pricing. No hidden fees, ever."
    },
    {
      icon: Smartphone,
      title: "Mobile Money",
      description: "Direct to Airtel and MTN Money wallets. Simple, convenient, and reliable."
    }
  ];

  const steps = [
    { step: "1", title: "Create Your Account", description: "Sign up in seconds with your phone and email. Quick verification process.", icon: User },
    { step: "2", title: "Enter Transfer Details", description: "Choose your recipient and enter the amount you want to send.", icon: Wallet },
    { step: "3", title: "Complete Payment", description: "Pay securely via mobile money and your recipient gets funds instantly.", icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background shadow-md border-b border-border">
        <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 sm:py-4">
          {/* Logo */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
            <img 
              src={logo} 
              alt="TiclaPay Logo" 
              className="h-6 sm:h-10 md:h-14 object-contain" 
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {exchangeRate && (
              <div className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-2 bg-muted rounded-full border border-border">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                <span className="text-xs sm:text-sm font-bold text-primary">
                  ${exchangeRate.toFixed(2)}
                </span>
              </div>
            )}

            <Button 
              onClick={() => navigate("/auth")} 
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-5 h-8 sm:h-10 text-xs sm:text-sm font-semibold rounded-lg"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 md:pt-48 md:pb-32 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl float-animation" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-accent/10 rounded-full blur-3xl float-animation-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className="clay-badge inline-flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-foreground">Instant Cross-Border Transfers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
                Send Money
                <span className="block text-gradient mt-2">
                  Across Borders
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Fast, secure, and affordable international transfers. Send money to loved ones anywhere with competitive rates.
              </p>

              {/* Key Benefits */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <div className="clay-card-sm flex items-center gap-3 px-4 py-3">
                  <Lock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">100% Secure</span>
                </div>
                <div className="clay-card-sm flex items-center gap-3 px-4 py-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">24/7 Support</span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")} 
                  className="clay-button h-14 px-10 text-lg font-bold text-primary-foreground"
                >
                  Start Sending Now
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right - Calculator Card */}
            <div className="order-1 lg:order-2">
              <div className="clay-card-lg p-8 sm:p-10 max-w-md mx-auto">
                <div className="space-y-6">
                  <div className="text-center pb-6 border-b border-border">
                    <h3 className="text-xl sm:text-2xl font-bold text-foreground">Calculate Transfer</h3>
                    <p className="text-sm text-muted-foreground mt-2">See what you'll send and they'll receive</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="clay-icon w-7 h-7 text-xs text-primary-foreground">1</span>
                      You send
                    </label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(Number(e.target.value) || 0)} 
                        className="clay-input pr-20 h-14 text-xl font-bold" 
                        min="1" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-lg text-primary">USD</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="clay-icon w-7 h-7 text-xs text-primary-foreground">2</span>
                      They receive
                    </label>
                    <div className="relative">
                      <Input 
                        type="text" 
                        value={recipientGets} 
                        readOnly 
                        className="clay-input pr-20 h-14 text-xl font-bold bg-muted/30" 
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-lg text-primary">ZMW</span>
                    </div>
                  </div>

                  <div className="clay-card-sm p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Exchange rate</span>
                      <span className="font-semibold text-foreground">1 USD = {exchangeRate?.toFixed(2)} ZMW</span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => navigate("/auth")} 
                    className="clay-button w-full h-14 text-base font-bold text-primary-foreground"
                  >
                    Continue to Send
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 sm:py-20 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Trusted by Thousands</h2>
              <p className="text-lg text-muted-foreground">Join our growing community of satisfied users</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "10K+", label: "Active Users" },
                { value: "$2M+", label: "Transferred" },
                { value: "99.9%", label: "Success Rate" },
                { value: "<30min", label: "Avg. Transfer Time" }
              ].map((stat, index) => (
                <div key={index} className="clay-stat">
                  <div className="text-3xl sm:text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">Why Choose TiclaPay?</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of cross-border payments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index} 
                  className="clay-card p-8 transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="clay-icon w-16 h-16 mb-6 group-hover:scale-110 transition-transform">
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-lg md:text-xl text-muted-foreground">Send money in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="relative">
                  <div className="clay-card p-8 text-center h-full transition-all duration-300 hover:-translate-y-2">
                    <div className="clay-icon w-16 h-16 mx-auto mb-6">
                      <IconComponent className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-4 -left-4 clay-icon w-12 h-12 text-lg font-bold">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-8 -translate-y-1/2 -translate-x-4">
                      <ArrowRight className="h-8 w-8 text-primary/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-accent opacity-95" />
        <div className="absolute inset-0">
          <div className="absolute top-10 left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of people sending money across borders with TiclaPay. Fast, secure, and reliable transfers worldwide.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth")} 
            className="h-14 sm:h-16 px-10 sm:px-14 text-base sm:text-lg font-bold bg-background text-primary hover:bg-background/95 shadow-2xl transition-all hover:scale-105"
          >
            Create Free Account
            <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center mb-4">
                <img src={logo} alt="TiclaPay Logo" className="h-16 md:h-20 object-contain" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fast and secure international money transfers. Your trusted partner for seamless cross-border payments worldwide.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-base mb-4 text-foreground">Company</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li onClick={() => navigate("/about-us")} className="hover:text-primary cursor-pointer transition-colors">About Us</li>
                <li onClick={() => navigate("/how-it-works")} className="hover:text-primary cursor-pointer transition-colors">How It Works</li>
                <li onClick={() => navigate("/pricing")} className="hover:text-primary cursor-pointer transition-colors">Pricing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-base mb-4 text-foreground">Support</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li onClick={() => navigate("/help-center")} className="hover:text-primary cursor-pointer transition-colors">Help Center</li>
                <li onClick={() => navigate("/contact-us")} className="hover:text-primary cursor-pointer transition-colors">Contact Us</li>
                <li onClick={() => navigate("/faqs")} className="hover:text-primary cursor-pointer transition-colors">FAQs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-base mb-4 text-foreground">Legal</h3>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li onClick={() => navigate("/privacy-policy")} className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</li>
                <li onClick={() => navigate("/terms-of-service")} className="hover:text-primary cursor-pointer transition-colors">Terms of Service</li>
                <li onClick={() => navigate("/security")} className="hover:text-primary cursor-pointer transition-colors">Security</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">© 2024 TiclaPay. All rights reserved. Secure cross-border payments made easy.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;