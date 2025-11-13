import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Search, MessageCircle, Mail, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const HelpCenter = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const helpTopics = [
    {
      title: "Getting Started",
      articles: [
        "How to create an account",
        "Verifying your identity",
        "Setting up your profile"
      ]
    },
    {
      title: "Sending Money",
      articles: [
        "How to send money",
        "Payment methods accepted",
        "Transfer limits and fees"
      ]
    },
    {
      title: "Account & Security",
      articles: [
        "Keeping your account secure",
        "Resetting your password",
        "Two-factor authentication"
      ]
    },
    {
      title: "Transactions",
      articles: [
        "Tracking your transfer",
        "Transaction status explained",
        "Canceling a transfer"
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
          <h1 className="text-xl font-bold text-primary">Tangila Pay</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">Help Center</h1>
        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          Find answers to common questions and get the help you need.
        </p>

        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {helpTopics.map((topic, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold mb-4">{topic.title}</h2>
              <ul className="space-y-3">
                {topic.articles.map((article, articleIndex) => (
                  <li key={articleIndex}>
                    <button className="text-muted-foreground hover:text-primary transition-colors text-left text-sm">
                      {article}
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-4 text-center">Still Need Help?</h2>
          <p className="text-muted-foreground mb-6 text-center">
            Our support team is here to assist you 24/7
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <Button variant="outline" className="gap-2 h-auto py-4 flex-col">
              <MessageCircle className="h-6 w-6 text-primary" />
              <span className="font-semibold">Live Chat</span>
              <span className="text-xs text-muted-foreground">Available now</span>
            </Button>
            <Button variant="outline" className="gap-2 h-auto py-4 flex-col">
              <Mail className="h-6 w-6 text-primary" />
              <span className="font-semibold">Email Us</span>
              <span className="text-xs text-muted-foreground">support@tangilapay.com</span>
            </Button>
            <Button variant="outline" className="gap-2 h-auto py-4 flex-col">
              <Phone className="h-6 w-6 text-primary" />
              <span className="font-semibold">Call Us</span>
              <span className="text-xs text-muted-foreground">+263 123 4567</span>
            </Button>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default HelpCenter;