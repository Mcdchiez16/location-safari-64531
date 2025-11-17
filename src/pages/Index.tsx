import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Shield, Zap, Globe2, TrendingUp, ArrowRight, Smartphone, CheckCircle, Clock, Lock, User, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import InteractiveBackground from "@/components/InteractiveBackground";
import logo from "@/assets/logo.png";
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
            <div className="flex items-center space-x-2 group cursor-pointer" onClick={() => navigate("/")}>
              <img src={logo} alt="Ticlapay Logo" className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl object-cover shadow-lg group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105" />
              <span className="text-xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent font-bold font-mono text-center sm:text-xl">Ticla-Pay</span>
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
            icon: User,
            color: "from-blue-500 to-purple-500"
          }, {
            step: "2",
            title: "Enter Transfer Details",
            description: "Choose your recipient and enter the amount you want to send.",
            icon: Wallet,
            color: "from-purple-500 to-pink-500"
          }, {
            step: "3",
            title: "Complete Payment",
            description: "Pay securely via mobile money and your recipient gets funds instantly.",
            icon: CheckCircle,
            color: "from-pink-500 to-red-500"
          }].map((item, index) => {
            const IconComponent = item.icon;
            return <div key={index} className="relative">
                <Card className="p-8 text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 bg-gradient-to-br from-card to-card/50">
                  <div className={`inline-flex w-20 h-20 rounded-3xl items-center justify-center mb-6 shadow-xl bg-gradient-to-br ${item.color}`}>
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </Card>
                {index < 2 && <div className="hidden md:block absolute top-1/2 left-full w-full h-1 -translate-x-4 -translate-y-1/2">
                    <div className="w-8 h-8 absolute left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <ArrowRight className="h-8 w-8 text-primary" />
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
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl font-bold text-primary font-mono">​Ticla-Pay</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fast and secure money transfers from Zimbabwe to Zambia. Your trusted cross-border payment partner.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-base mb-3 text-foreground">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li onClick={() => navigate("/about-us")} className="hover:text-primary cursor-pointer transition-colors">About Us</li>
                <li onClick={() => navigate("/how-it-works")} className="hover:text-primary cursor-pointer transition-colors">How It Works</li>
                <li onClick={() => navigate("/pricing")} className="hover:text-primary cursor-pointer transition-colors">Pricing</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-base mb-3 text-foreground">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li onClick={() => navigate("/help-center")} className="hover:text-primary cursor-pointer transition-colors">Help Center</li>
                <li onClick={() => navigate("/contact-us")} className="hover:text-primary cursor-pointer transition-colors">Contact Us</li>
                <li onClick={() => navigate("/faqs")} className="hover:text-primary cursor-pointer transition-colors">FAQs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-base mb-3 text-foreground">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li onClick={() => navigate("/privacy-policy")} className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</li>
                <li onClick={() => navigate("/terms-of-service")} className="hover:text-primary cursor-pointer transition-colors">Terms of Service</li>
                <li onClick={() => navigate("/security")} className="hover:text-primary cursor-pointer transition-colors">Security</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t pt-8 text-center">
            <p className="text-sm text-muted-foreground">© 2024 Ticla-Pay. All rights reserved. Secure cross-border payments made easy.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;