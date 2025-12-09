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
        const { data, error } = await supabase.from('settings').select('value').eq('key', 'transfer_fee_percentage').single();
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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(217_91%_98%)] via-[hsl(210_100%_99%)] to-[hsl(220_70%_98%)]">
      {/* Claymorphism Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled 
        ? 'bg-[hsl(0_0%_100%/0.85)] backdrop-blur-xl shadow-[0_8px_32px_hsl(217_91%_60%/0.08)] border-b border-[hsl(0_0%_100%/0.6)]' 
        : 'bg-transparent backdrop-blur-sm'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center group cursor-pointer" onClick={() => navigate("/")}>
              <img src={logo} alt="TiclaPay Logo" className="h-7 sm:h-8 object-contain transition-all duration-300 group-hover:scale-105 rounded-md" />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {exchangeRate && (
                <div className="clay-badge flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse flex-shrink-0" />
                  <span className="text-[10px] sm:text-sm font-bold text-primary whitespace-nowrap">
                    ${exchangeRate.toFixed(2)}
                  </span>
                </div>
              )}

              <button 
                onClick={() => navigate("/auth")} 
                className="clay-button px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm text-primary-foreground font-bold whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Claymorphism */}
      <section className="relative overflow-hidden py-24 sm:py-28 md:py-36 lg:py-44 clay-section">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className="clay-badge inline-flex items-center gap-2 px-5 py-2.5">
                <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse" />
                <span className="text-sm sm:text-base font-bold text-primary">Instant Cross-Border Transfers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-foreground">
                Bridge The Gap
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mt-2">
                  Zimbabwe to Zambia
                </span>
              </h1>

              <p className="text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold text-muted-foreground">
                Send money instantly with competitive rates and zero hassle. Your trusted partner for seamless cross-border payments.
              </p>

              {/* Key Benefits - Clay Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto lg:mx-0">
                <div className="clay-card flex items-center gap-3 p-4">
                  <div className="clay-icon w-10 h-10 flex items-center justify-center shrink-0">
                    <Lock className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-bold text-foreground">100% Secure</span>
                </div>
                <div className="clay-card flex items-center gap-3 p-4">
                  <div className="clay-icon w-10 h-10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-bold text-foreground">24/7 Support</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <button 
                  onClick={() => navigate("/auth")} 
                  className="clay-button h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg font-bold text-primary-foreground flex items-center justify-center gap-2"
                >
                  Start Sending Now
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Right - Calculator Card with Claymorphism */}
            <div className="order-1 lg:order-2">
              <div className="clay-hero-card p-8 sm:p-10 max-w-md mx-auto">
                <div className="space-y-6">
                  <div className="text-center pb-5 border-b border-[hsl(217_91%_60%/0.1)]">
                    <h3 className="text-xl sm:text-2xl text-foreground font-bold">Calculate Transfer</h3>
                    <p className="text-sm text-muted-foreground mt-2">See what you'll send and they'll receive</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="clay-icon w-7 h-7 flex items-center justify-center text-xs text-primary-foreground font-bold">1</span>
                      You send
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(Number(e.target.value) || 0)} 
                        className="clay-input w-full pr-20 h-14 text-lg sm:text-xl font-bold px-5 focus:outline-none" 
                        min="1" 
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-base sm:text-lg text-primary">USD</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-foreground flex items-center gap-2">
                      <span className="clay-icon w-7 h-7 flex items-center justify-center text-xs text-primary-foreground font-bold">2</span>
                      They receive
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={recipientGets} 
                        readOnly 
                        className="clay-input w-full pr-20 h-14 text-lg sm:text-xl font-bold px-5 bg-[hsl(0_0%_97%)]" 
                      />
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-base sm:text-lg text-primary">ZMW</span>
                    </div>
                  </div>

                  <div className="clay-card p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Exchange rate</span>
                      <span className="font-bold text-foreground">1 USD = {exchangeRate?.toFixed(2)} ZMW</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => navigate("/auth")} 
                    className="clay-button w-full h-14 text-base font-bold text-primary-foreground flex items-center justify-center gap-2"
                  >
                    Continue to Send
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators with Claymorphism */}
      <section className="relative py-16 sm:py-20 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">Trusted by Thousands</h2>
              <p className="text-lg text-muted-foreground">Join our growing community of satisfied users</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { value: "10K+", label: "Active Users" },
                { value: "$2M+", label: "Transferred" },
                { value: "99.9%", label: "Success Rate" },
                { value: "<30min", label: "Avg. Transfer Time" }
              ].map((stat, index) => (
                <div key={index} className="clay-stat p-6 text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Claymorphism */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden clay-section">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14 md:mb-18">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">Why Choose Ticlapay?</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of cross-border payments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Lightning Fast", description: "Instant transfers to mobile money wallets. Your recipient gets funds in minutes, not days.", gradient: "from-primary to-accent" },
              { icon: Shield, title: "Bank-Level Security", description: "Advanced encryption and fraud protection. Your money and data are always safe with us.", gradient: "from-secondary to-primary" },
              { icon: Globe2, title: "Competitive Rates", description: "Best exchange rates with transparent pricing. No hidden fees, ever.", gradient: "from-accent to-secondary" },
              { icon: Smartphone, title: "Mobile Money", description: "Direct to Airtel and MTN Money wallets. Simple, convenient, and reliable.", gradient: "from-primary to-secondary" }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="clay-card p-8 group">
                  <div className={`clay-icon w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works with Claymorphism */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14 md:mb-18">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground">How It Works</h2>
            <p className="text-lg md:text-xl text-muted-foreground">Send money in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { step: "1", title: "Create Your Account", description: "Sign up in seconds with your phone and email. Quick verification process.", icon: User },
              { step: "2", title: "Enter Transfer Details", description: "Choose your recipient and enter the amount you want to send.", icon: Wallet },
              { step: "3", title: "Complete Payment", description: "Pay securely via mobile money and your recipient gets funds instantly.", icon: CheckCircle }
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div key={index} className="relative group">
                  <div className="clay-card-elevated p-8 text-center h-full">
                    <div className="clay-icon inline-flex w-16 h-16 items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-4 -left-4 clay-button w-12 h-12 flex items-center justify-center font-bold text-lg text-primary-foreground">
                      {item.step}
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-1 -translate-x-4 -translate-y-1/2">
                      <div className="w-8 h-8 absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <ArrowRight className="h-8 w-8 text-primary/40" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section with Claymorphism */}
      <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-95" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of people sending money across borders with Ticlapay. Fast, secure, and reliable.
          </p>
          <button 
            onClick={() => navigate("/auth")} 
            className="clay-card h-16 sm:h-18 px-10 sm:px-14 text-base sm:text-lg font-bold text-primary bg-background inline-flex items-center gap-3 hover:scale-105 transition-transform duration-300"
          >
            Create Free Account
            <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-primary/95 via-primary to-primary/90 text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="pt-16 pb-12">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
              <div className="lg:max-w-sm">
                <div className="inline-flex items-center gap-3 mb-6 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3">
                  <img src={logo} alt="TiclaPay Logo" className="h-8 object-contain brightness-0 invert" />
                </div>
                <p className="text-primary-foreground/80 leading-relaxed mb-6">
                  Fast and secure cross-border money transfers. Your trusted payment partner for seamless international remittances.
                </p>
                <div className="flex gap-3">
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692h1.971v3z" /></svg>
                  </a>
                  <a href="#" className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all hover:scale-110">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/60">Company</h3>
                  <ul className="space-y-3">
                    <li><span onClick={() => navigate("/about-us")} className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors inline-flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary-foreground transition-all" />About Us</span></li>
                    <li><span onClick={() => navigate("/how-it-works")} className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors inline-flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary-foreground transition-all" />How It Works</span></li>
                    <li><span onClick={() => navigate("/pricing")} className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors inline-flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary-foreground transition-all" />Pricing</span></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/60">Support</h3>
                  <ul className="space-y-3">
                    <li><span onClick={() => navigate("/help-center")} className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors inline-flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary-foreground transition-all" />Help Center</span></li>
                    <li><span onClick={() => navigate("/contact-us")} className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors inline-flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary-foreground transition-all" />Contact Us</span></li>
                    <li><span onClick={() => navigate("/faqs")} className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors inline-flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary-foreground transition-all" />FAQs</span></li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-4 text-primary-foreground/60">Legal</h3>
                  <ul className="space-y-3">
                    <li><span onClick={() => navigate("/privacy-policy")} className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors inline-flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary-foreground transition-all" />Privacy Policy</span></li>
                    <li><span onClick={() => navigate("/terms-of-service")} className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors inline-flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary-foreground transition-all" />Terms of Service</span></li>
                    <li><span onClick={() => navigate("/security")} className="text-primary-foreground/80 hover:text-primary-foreground cursor-pointer transition-colors inline-flex items-center gap-2 group"><span className="w-0 group-hover:w-2 h-0.5 bg-primary-foreground transition-all" />Security</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60">© 2024 TiclaPay. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Secure Payments
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Fast Transfers
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;