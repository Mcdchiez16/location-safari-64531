import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Send from "./pages/Send";
import Settings from "./pages/Settings";
import Verification from "./pages/Verification";
import PaymentLink from "./pages/PaymentLink";
import Deposit from "./pages/Deposit";
import NotFound from "./pages/NotFound";
import Recipients from "./pages/Recipients";
import Admin from "./pages/Admin";
import AdminAuth from "./pages/AdminAuth";
import UploadProof from "./pages/UploadProof";
import Transactions from "./pages/Transactions";
import Referrals from "./pages/Referrals";
import AboutUs from "./pages/AboutUs";
import HowItWorks from "./pages/HowItWorks";
import Pricing from "./pages/Pricing";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import FAQs from "./pages/FAQs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Security from "./pages/Security";
const queryClient = new QueryClient();
const App = () => <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/send" element={<Send />} />
          <Route path="/deposit" element={<Deposit />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/payment-link" element={<PaymentLink />} />
          <Route path="/recipients" element={<Recipients />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/referrals" element={<Referrals />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/faqs" element={<FAQs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/security" element={<Security />} />
          <Route path="/admin/login" element={<AdminAuth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/upload-proof" element={<UploadProof />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;
export default App;