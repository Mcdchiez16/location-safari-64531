import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Zap, Globe2, TrendingUp, ArrowRight, Smartphone, CheckCircle, Clock, Lock, User, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import InteractiveBackground from "@/components/InteractiveBackground";
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
  return <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10">
      {/* Elegant Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-background/80 backdrop-blur-xl shadow-lg border-b border-primary/10' : 'bg-transparent backdrop-blur-md border-b border-white/5'}`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center group cursor-pointer" onClick={() => navigate("/")}>
              <img src={logo} alt="TiclaPay Logo" className="h-7 sm:h-8 object-contain transition-all duration-300 group-hover:scale-105 rounded-md" />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {exchangeRate && <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-sm rounded-full border border-primary/30 shadow-lg">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse flex-shrink-0" />
                  <span className="text-[10px] sm:text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
                    ${exchangeRate.toFixed(2)}
                  </span>
                </div>}

              <Button onClick={() => navigate("/auth")} className="px-3 sm:px-5 h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-primary to-accent hover:from-accent hover:to-primary shadow-lg hover:shadow-xl transition-all font-semibold whitespace-nowrap">​Get Started </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Interactive 3D Background */}
      <section className="relative overflow-hidden py-20 sm:py-24 md:py-32 lg:py-40">
        {/* Interactive 3D Background */}
        <InteractiveBackground />
        
        {/* Gradient Base Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/5 to-background pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-transparent to-background/80 pointer-events-none"></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center max-w-7xl mx-auto">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full border border-primary/30">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm sm:text-base font-semibold text-primary">Instant Cross-Border Transfers</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                Bridge The Gap
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent mt-2">
                  Zimbabwe to Zambia
                </span>
              </h1>

              <p className="text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed md:text-base font-semibold text-slate-950">
                Send money instantly with competitive rates and zero hassle. Your trusted partner for seamless cross-border payments.
              </p>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto lg:mx-0">
                
                <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm p-3 rounded-lg border">
                  <Lock className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">100% Secure</span>
                </div>
                <div className="flex items-center gap-2 bg-card/80 backdrop-blur-sm p-3 rounded-lg border">
                  <Clock className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Button size="lg" onClick={() => navigate("/auth")} className="h-12 sm:h-14 px-8 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all">
                  Start Sending Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right - Calculator Card */}
            <div className="order-1 lg:order-2">
              <Card className="bg-card/95 backdrop-blur-sm shadow-2xl rounded-3xl border-2 p-6 sm:p-8 max-w-md mx-auto">
                <div className="space-y-6">
                  <div className="text-center pb-4 border-b">
                    <h3 className="text-lg sm:text-xl text-foreground font-bold">Calculate Transfer</h3>
                    <p className="text-sm text-muted-foreground mt-1">See what you'll send and they'll receive</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">1</span>
                      You send
                    </label>
                    <div className="relative">
                      <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value) || 0)} className="pr-20 h-12 text-lg sm:h-14 sm:text-xl font-bold border-2 focus:border-primary" min="1" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-base sm:text-lg text-primary">USD</span>
                    </div>
                  </div>

                  

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">2</span>
                      They receive
                    </label>
                    <div className="relative">
                      <Input type="text" value={recipientGets} readOnly className="pr-20 h-12 text-lg sm:h-14 sm:text-xl font-bold bg-muted/50 border-2" />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-base sm:text-lg text-primary">ZMW</span>
                    </div>
                  </div>

                  <div className="rounded-xl p-4 bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Exchange rate</span>
                      <span className="font-semibold text-foreground">1 USD = {exchangeRate?.toFixed(2)} ZMW</span>
                    </div>
                    
                  </div>

                  <Button onClick={() => navigate("/auth")} className="w-full h-14 text-base font-bold shadow-lg hover:shadow-xl transition-all">
                    Continue to Send
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="relative py-12 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.1),transparent_70%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Trusted by Thousands</h2>
              <p className="text-lg text-muted-foreground">Join our growing community of satisfied users</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-primary">$2M+</div>
                <div className="text-sm text-muted-foreground">Transferred</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl sm:text-5xl font-bold text-primary">{"<30min"}</div>
                <div className="text-sm text-muted-foreground">Avg. Transfer Time</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Why Choose Ticlapay?</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of cross-border payments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-8 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br from-primary to-accent shadow-lg">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Instant transfers to mobile money wallets. Your recipient gets funds in minutes, not days.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br from-secondary to-primary shadow-lg">
                <Shield className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Bank-Level Security</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Advanced encryption and fraud protection. Your money and data are always safe with us.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br from-accent to-secondary shadow-lg">
                <Globe2 className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Competitive Rates</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Best exchange rates with transparent pricing. No hidden fees, ever.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-2xl transition-all duration-300 group hover:-translate-y-2 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br from-primary to-secondary shadow-lg">
                <Smartphone className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Mobile Money</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Direct to Airtel and MTN Money wallets. Simple, convenient, and reliable.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-primary/5 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.1),transparent_60%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-lg md:text-xl text-muted-foreground">Send money in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[{
            step: "1",
            title: "Create Your Account",
            description: "Sign up in seconds with your phone and email. Quick verification process.",
            icon: User
          }, {
            step: "2",
            title: "Enter Transfer Details",
            description: "Choose your recipient and enter the amount you want to send.",
            icon: Wallet
          }, {
            step: "3",
            title: "Complete Payment",
            description: "Pay securely via mobile money and your recipient gets funds instantly.",
            icon: CheckCircle
          }].map((item, index) => {
            const IconComponent = item.icon;
            return <div key={index} className="relative group">
                <Card className="p-8 text-center hover:shadow-2xl transition-all duration-500 border hover:border-primary/30 bg-card/50 backdrop-blur-sm h-full">
                  <div className="inline-flex w-16 h-16 rounded-2xl items-center justify-center mb-6 bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    <IconComponent className="w-8 h-8 text-primary" />
                  </div>
                  <div className="absolute -top-3 -left-3 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </Card>
                {index < 2 && <div className="hidden md:block absolute top-1/2 left-full w-full h-1 -translate-x-4 -translate-y-1/2">
                    <div className="w-8 h-8 absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <ArrowRight className="h-8 w-8 text-primary/40" />
                     </div>
                  </div>}
              </div>;
          })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary opacity-95" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of people sending money across borders with Ticlapay. Fast, secure, and reliable.
          </p>
          <Button size="lg" onClick={() => navigate("/auth")} className="h-14 sm:h-16 px-8 sm:px-12 text-base sm:text-lg font-bold bg-background text-primary hover:bg-background/90 shadow-2xl hover:shadow-3xl transition-all hover:scale-105">
            Create Free Account
            <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-br from-primary/95 via-primary to-primary/90 text-primary-foreground overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Top section with wave separator */}
          <div className="pt-16 pb-12">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
              {/* Brand section */}
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

              {/* Links sections */}
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
          
          {/* Bottom bar */}
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
    </div>;
};
export default Index;