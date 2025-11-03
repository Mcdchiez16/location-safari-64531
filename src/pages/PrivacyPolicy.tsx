import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Introduction</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            At TuraPay, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you use our money transfer services.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            By using TuraPay, you agree to the collection and use of information in accordance with this policy.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Information We Collect</h2>
          
          <h3 className="text-lg font-semibold mb-3 mt-6">Personal Information</h3>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We collect personal information that you provide to us, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li>Name, email address, and phone number</li>
            <li>Government-issued identification documents</li>
            <li>Financial information for processing transactions</li>
            <li>Selfie photos for identity verification</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 mt-6">Transaction Information</h3>
          <p className="text-muted-foreground leading-relaxed mb-3">
            We collect information about your transactions, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Transfer amounts and recipient details</li>
            <li>Payment methods and proof of payment</li>
            <li>Transaction history and status updates</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">How We Use Your Information</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Process your money transfer transactions</li>
            <li>Verify your identity and prevent fraud</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Send transaction confirmations and updates</li>
            <li>Comply with legal and regulatory requirements</li>
            <li>Improve our services and user experience</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Information Sharing and Disclosure</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We do not sell your personal information. We may share your information with:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Payment processors and financial institutions to complete transactions</li>
            <li>Service providers who assist in our operations</li>
            <li>Law enforcement or regulatory authorities when required by law</li>
            <li>Third parties with your explicit consent</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security measures to protect your personal information, including 
            encryption, secure servers, and regular security audits. However, no method of transmission over 
            the internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Access and review your personal information</li>
            <li>Request corrections to inaccurate information</li>
            <li>Request deletion of your information (subject to legal requirements)</li>
            <li>Opt out of marketing communications</li>
            <li>Lodge a complaint with relevant authorities</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
          <p className="text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy or how we handle your information, please contact us at:
          </p>
          <p className="text-muted-foreground mt-4">
            Email: privacy@turapay.com<br />
            Phone: +263 123 4567
          </p>
        </Card>
      </main>
    </div>
  );
};

export default PrivacyPolicy;