import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Shield, Zap, Globe } from "lucide-react";

interface HeroSectionProps {
  amount: number;
  setAmount: (amount: number) => void;
  exchangeRate: number | null;
  recipientGets: string;
}

const HeroSection = ({ amount, setAmount, exchangeRate, recipientGets }: HeroSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 md:pt-40 md:pb-36 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl float-animation" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl float-animation-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30" style={{ background: 'radial-gradient(circle, hsl(160 84% 45% / 0.08), transparent 70%)' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 premium-badge">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span>Instant Cross-Border Transfers</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              Move Money
              <span className="block gradient-text mt-2">
                Without Borders
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Send money to loved ones across the globe. Fast, secure, and with the best exchange rates. No hidden fees.
            </p>

            {/* Trust Points */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-5 w-5 text-primary" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-5 w-5 text-primary" />
                <span>Instant Delivery</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-5 w-5 text-primary" />
                <span>24/7 Support</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="premium-button h-14 px-8 text-base font-semibold"
              >
                Start Sending
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/how-it-works")}
                className="h-14 px-8 text-base font-semibold border-border/50 bg-transparent hover:bg-card/50"
              >
                How It Works
              </Button>
            </div>
          </div>

          {/* Right - Calculator Card */}
          <div className="order-1 lg:order-2">
            <div className="glass-card-lg p-8 sm:p-10 max-w-md mx-auto glow-primary">
              <div className="space-y-6">
                <div className="text-center pb-6 border-b border-border/30">
                  <h3 className="text-2xl font-bold">Quick Calculator</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    See how much your recipient gets
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      You send
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                        className="premium-input pr-16 h-14 text-xl font-bold"
                        min="1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-primary">
                        USD
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-center py-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <ArrowRight className="h-5 w-5 text-primary rotate-90" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">
                      They receive
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={recipientGets}
                        readOnly
                        className="premium-input pr-16 h-14 text-xl font-bold bg-muted/30"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-primary">
                        ZMW
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Exchange rate</span>
                    <span className="font-semibold">
                      1 USD = {exchangeRate?.toFixed(2) || "..."} ZMW
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate("/auth")}
                  className="premium-button w-full h-14 text-base font-semibold"
                >
                  Continue Transfer
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
