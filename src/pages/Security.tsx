import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Shield, Lock, Eye, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Security = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-xl font-bold text-primary">Tangila Pay</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Security at Tangila Pay</h1>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          Your security is our top priority. Learn how we protect your money and personal information.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="p-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Bank-Level Encryption</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              All data is encrypted using industry-standard 256-bit SSL encryption, the same level of security 
              used by major banks worldwide.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Authentication</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Multi-factor authentication and secure login protocols protect your account from unauthorized access.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Eye className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Fraud Monitoring</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Advanced fraud detection systems monitor transactions 24/7 to identify and prevent suspicious activity.
            </p>
          </Card>

          <Card className="p-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-3">Regulatory Compliance</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We comply with all financial regulations and maintain strict KYC (Know Your Customer) procedures.
            </p>
          </Card>
        </div>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Security Measures</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Data Protection</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All sensitive information is encrypted both in transit and at rest. We use secure servers with 
                regular security audits and penetration testing.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Identity Verification</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We verify every user's identity through government-issued ID verification and selfie matching to 
                prevent fraud and identity theft.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Transaction Security</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every transaction is verified and monitored for suspicious activity. Large or unusual transactions 
                may require additional verification.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Privacy Protection</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We never sell your personal information. Your data is used only for transaction processing and 
                service improvement.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">How You Can Stay Safe</h2>
          <ul className="space-y-3">
            {[
              "Use a strong, unique password for your Tangila Pay account",
              "Never share your password or verification codes with anyone",
              "Enable two-factor authentication for extra security",
              "Verify recipient details carefully before sending money",
              "Log out of your account on shared devices",
              "Report suspicious activity to our support team immediately",
              "Keep your contact information up to date",
              "Be cautious of phishing emails claiming to be from Tangila Pay"
            ].map((tip, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">✓</span>
                </div>
                <span className="text-muted-foreground text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Report Security Concerns</h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            If you notice any suspicious activity or security concerns, please contact our security team immediately.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={() => navigate("/contact-us")}>
              Contact Security Team
            </Button>
            <Button variant="outline" onClick={() => navigate("/help-center")}>
              Visit Help Center
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Security;