import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, UserPlus, Send, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-xl font-bold text-primary">Ticlapay</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">How It Works</h1>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          Send money in three simple steps. Fast, secure, and reliable.
        </p>

        <div className="space-y-8 mb-12">
          <Card className="p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-blue-500 to-blue-600" />
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-bold text-primary">01</span>
                  <h2 className="text-2xl font-bold">Create Your Account</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Sign up for free in just a few minutes. Provide your basic information and verify your identity 
                  to get started. We follow strict KYC procedures to ensure security for all users.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Enter your email and create a password
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Verify your identity with a valid ID
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Account verified within 24 hours
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-green-500 to-green-600" />
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                <Send className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-bold text-primary">02</span>
                  <h2 className="text-2xl font-bold">Enter Transfer Details</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Choose how much you want to send and enter your recipient's information. See the exact amount 
                  they'll receive with our live exchange rate calculator.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Enter amount in USD
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Add recipient's phone number and name
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    View total cost with transparent fees
                  </li>
                </ul>
              </div>
            </div>
          </Card>

          <Card className="p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-purple-500 to-purple-600" />
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-bold text-primary">03</span>
                  <h2 className="text-2xl font-bold">Pay & Track</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Complete your payment using mobile money. Upload proof of payment and track your transfer 
                  in real-time. Your recipient gets the money instantly once verified.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Pay via Ecocash, Innbucks, or OneMoney
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Upload payment proof for verification
                  </li>
                  <li className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Recipient receives money instantly
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Ready to Send Money?</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Join thousands of users who trust Ticlapay for their cross-border transfers. Fast, secure, and reliable.
          </p>
          <Button onClick={() => navigate("/auth")} size="lg" className="gap-2">
            Create Free Account
            <ArrowLeft className="h-4 w-4 rotate-180" />
          </Button>
        </Card>
      </main>
    </div>
  );
};

export default HowItWorks;