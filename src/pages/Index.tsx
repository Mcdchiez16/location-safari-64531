import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import TrustIndicators from "@/components/landing/TrustIndicators";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [amount, setAmount] = useState(100);
  const [transferFeePercentage, setTransferFeePercentage] = useState(12);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await response.json();
        if (data.rates && data.rates.ZMW) {
          setExchangeRate(data.rates.ZMW);
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
      }

      try {
        const { data, error } = await supabase
          .from("settings")
          .select("value")
          .eq("key", "transfer_fee_percentage")
          .single();

        if (!error && data) {
          setTransferFeePercentage(parseFloat(data.value));
        }
      } catch (error) {
        console.error("Error fetching transfer fee:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  const recipientGets = exchangeRate
    ? (amount * exchangeRate).toFixed(2)
    : "0.00";

  return (
    <div className="min-h-screen bg-background">
      <Header exchangeRate={exchangeRate} />
      <HeroSection
        amount={amount}
        setAmount={setAmount}
        exchangeRate={exchangeRate}
        recipientGets={recipientGets}
      />
      <TrustIndicators />
      <FeaturesSection />
      <HowItWorks />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
