import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      
      {/* Glow Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Ready to Get
            <span className="gradient-text block">Started?</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 leading-relaxed">
            Join thousands of people sending money across borders with TiclaPay. 
            Fast, secure, and reliable transfers worldwide.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/auth")}
            className="premium-button h-14 sm:h-16 px-10 sm:px-14 text-base sm:text-lg font-semibold"
          >
            Create Free Account
            <ArrowRight className="ml-3 h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
