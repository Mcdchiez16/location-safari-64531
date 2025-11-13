import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsOfService = () => {
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
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing and using Tangila Pay's services, you accept and agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our services.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Eligibility</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            To use Tangila Pay, you must:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Be at least 18 years old</li>
            <li>Have the legal capacity to enter into binding contracts</li>
            <li>Provide accurate and complete information during registration</li>
            <li>Comply with all applicable laws and regulations</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Account Registration and Security</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you create an account:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
            <li>You must provide accurate and current information</li>
            <li>You are responsible for maintaining the confidentiality of your password</li>
            <li>You must notify us immediately of any unauthorized access</li>
            <li>You are responsible for all activities under your account</li>
          </ul>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to suspend or terminate accounts that violate these terms.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Service Description</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Tangila Pay provides money transfer services between Zimbabwe and Zambia. Our services include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Cross-border money transfers</li>
            <li>Real-time exchange rate information</li>
            <li>Transaction tracking and history</li>
            <li>Customer support</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Fees and Charges</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We charge a transparent fee for each transaction. The fee structure:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Is displayed before you confirm any transaction</li>
            <li>May vary based on transaction amount and method</li>
            <li>Does not include third-party charges (e.g., mobile money fees)</li>
            <li>Is subject to change with notice</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Transaction Processing</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            When you initiate a transaction:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>You must provide accurate recipient information</li>
            <li>Transactions are processed based on payment verification</li>
            <li>We reserve the right to delay or cancel suspicious transactions</li>
            <li>Transfer times may vary based on verification requirements</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Prohibited Activities</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            You may not use Tangila Pay to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Engage in fraudulent or illegal activities</li>
            <li>Money laundering or financing terrorism</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Impersonate another person or entity</li>
            <li>Interfere with the proper functioning of our services</li>
          </ul>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            Tangila Pay shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
            resulting from your use of our services. Our total liability shall not exceed the amount of fees paid 
            by you in the transaction giving rise to the claim.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Termination</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may suspend or terminate your access to our services at any time, with or without cause, with or 
            without notice. You may also terminate your account by contacting customer support.
          </p>
        </Card>

        <Card className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Changes to Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            We reserve the right to modify these terms at any time. We will notify you of significant changes 
            via email or through our platform. Your continued use of our services after changes constitutes 
            acceptance of the new terms.
          </p>
        </Card>

        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
          <p className="text-muted-foreground leading-relaxed">
            For questions about these Terms of Service, please contact:
          </p>
          <p className="text-muted-foreground mt-4">
            Email: legal@tangilapay.com<br />
            Phone: +263 123 4567
          </p>
        </Card>
      </main>
    </div>
  );
};

export default TermsOfService;