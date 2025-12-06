import { Zap, Shield, Globe2, Smartphone } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant transfers to mobile money wallets. Your recipient gets funds in minutes, not days.",
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Advanced encryption and fraud protection. Your money and data are always safe with us.",
    },
    {
      icon: Globe2,
      title: "Competitive Rates",
      description: "Best exchange rates with transparent pricing. No hidden fees, what you see is what you pay.",
    },
    {
      icon: Smartphone,
      title: "Mobile Money",
      description: "Direct to Airtel and MTN Money wallets. Simple, convenient, and reliable delivery.",
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="premium-badge inline-block mb-4">Why TiclaPay</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Built for Modern
            <span className="gradient-text"> Transfers</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of cross-border payments with features designed for you
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} className="feature-card group">
                <div className="icon-container w-14 h-14 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
