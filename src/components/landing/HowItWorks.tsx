import { User, Wallet, CheckCircle, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "1",
      title: "Create Account",
      description: "Sign up in seconds with your phone and email. Quick verification process.",
      icon: User,
    },
    {
      step: "2",
      title: "Enter Details",
      description: "Choose your recipient and enter the amount you want to send.",
      icon: Wallet,
    },
    {
      step: "3",
      title: "Complete Transfer",
      description: "Pay securely via mobile money and your recipient gets funds instantly.",
      icon: CheckCircle,
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/30 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="premium-badge inline-block mb-4">Simple Process</span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Send money in 3 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="relative">
                <div className="feature-card text-center h-full">
                  <div className="step-number mx-auto mb-6">
                    {item.step}
                  </div>
                  <div className="icon-container w-16 h-16 mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {index < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-4 w-8 -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-primary/40" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
