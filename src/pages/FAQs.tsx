import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";

const FAQs = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click 'Sign Up' on the homepage, enter your email and create a password. Then verify your identity by uploading a valid ID document and selfie."
        },
        {
          q: "What documents do I need to verify my account?",
          a: "You need a valid government-issued ID (passport, national ID, or driver's license) and a clear selfie for identity verification."
        },
        {
          q: "How long does verification take?",
          a: "Account verification typically takes 1-24 hours. You'll receive an email once your account is verified."
        }
      ]
    },
    {
      category: "Sending Money",
      questions: [
        {
          q: "How do I send money?",
          a: "Log in, click 'Send Money', enter the amount and recipient details, review the transaction, and complete payment via mobile money."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept Ecocash, Innbucks, and OneMoney for payments from Zimbabwe."
        },
        {
          q: "How long does a transfer take?",
          a: "Most transfers are completed within minutes once payment is verified. Some transfers may take up to 24 hours."
        },
        {
          q: "What are the transfer limits?",
          a: "Transfer limits vary based on your account verification status. Verified accounts have higher limits."
        }
      ]
    },
    {
      category: "Fees & Rates",
      questions: [
        {
          q: "How much does it cost to send money?",
          a: "We charge a transparent fee on each transfer. The exact percentage is displayed before you confirm your transaction."
        },
        {
          q: "Are there any hidden fees?",
          a: "No, we believe in transparent pricing. The fee you see is the fee you pay - no surprises."
        },
        {
          q: "How do you calculate exchange rates?",
          a: "We use real-time market exchange rates, updated regularly to ensure you get the best possible rate."
        }
      ]
    },
    {
      category: "Account & Security",
      questions: [
        {
          q: "Is my money safe with TuraPay?",
          a: "Yes, we use bank-level security encryption and follow strict compliance procedures to protect your money and personal information."
        },
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on the login page, enter your email, and follow the instructions sent to your inbox."
        },
        {
          q: "Can I change my phone number?",
          a: "Yes, you can update your phone number in your account settings. You may need to verify your identity again."
        }
      ]
    },
    {
      category: "Transactions",
      questions: [
        {
          q: "How can I track my transfer?",
          a: "Go to 'Transactions' in your dashboard to see the status of all your transfers in real-time."
        },
        {
          q: "What if my transfer is delayed?",
          a: "Contact our support team immediately. Most delays are resolved within a few hours."
        },
        {
          q: "Can I cancel a transfer?",
          a: "You can cancel a transfer if it hasn't been processed yet. Contact support for assistance."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-xl font-bold text-primary">Tusapay</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Frequently Asked Questions</h1>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
          Find quick answers to common questions about Tusapay.
        </p>

        <div className="space-y-8">
          {faqs.map((category, index) => (
            <Card key={index} className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-primary">{category.category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {category.questions.map((faq, faqIndex) => (
                  <AccordionItem key={faqIndex} value={`item-${index}-${faqIndex}`}>
                    <AccordionTrigger className="text-left hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          ))}
        </div>

        <Card className="p-8 mt-12 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-4 text-center">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-6 text-center">
            Our support team is available 24/7 to help you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate("/contact-us")} variant="default">
              Contact Support
            </Button>
            <Button onClick={() => navigate("/help-center")} variant="outline">
              Visit Help Center
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default FAQs;