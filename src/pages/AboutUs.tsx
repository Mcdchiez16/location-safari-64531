import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Users, Target, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-xl font-bold text-primary">TuraPay</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">About TuraPay</h1>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          Making cross-border money transfers simple, fast, and secure between Zimbabwe and Zambia.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <div className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-4 bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Our Mission</h3>
            <p className="text-muted-foreground text-sm">
              To provide accessible and affordable financial services for everyone in Africa.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-4 bg-primary/10">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Our Vision</h3>
            <p className="text-muted-foreground text-sm">
              To become Africa's leading cross-border payment platform connecting communities.
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="inline-flex w-16 h-16 rounded-full items-center justify-center mb-4 bg-primary/10">
              <Award className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-bold text-xl mb-2">Our Values</h3>
            <p className="text-muted-foreground text-sm">
              Trust, transparency, and customer satisfaction are at the heart of everything we do.
            </p>
          </Card>
        </div>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            TuraPay is a leading fintech company specializing in cross-border money transfers between Zimbabwe and Zambia. 
            Founded with the mission to make international money transfers accessible to everyone, we combine cutting-edge 
            technology with local expertise to provide seamless financial services.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our platform enables thousands of users to send money to their loved ones quickly and securely, with competitive 
            exchange rates and transparent fees. We're committed to bridging the financial gap and connecting communities 
            across borders.
          </p>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">Why Choose Us?</h2>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary font-bold text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Fast Transfers</h3>
                <p className="text-muted-foreground text-sm">Most transfers complete within minutes</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary font-bold text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Competitive Rates</h3>
                <p className="text-muted-foreground text-sm">Best exchange rates with low transparent fees</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary font-bold text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Platform</h3>
                <p className="text-muted-foreground text-sm">Bank-level security to protect your money</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-primary font-bold text-sm">✓</span>
              </div>
              <div>
                <h3 className="font-semibold mb-1">24/7 Support</h3>
                <p className="text-muted-foreground text-sm">Our team is always here to help you</p>
              </div>
            </li>
          </ul>
        </Card>
      </main>
    </div>
  );
};

export default AboutUs;