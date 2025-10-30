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
import UploadProof from "./pages/UploadProof";
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
          <Route path="/admin" element={<Admin />} />
          <Route path="/upload-proof" element={<UploadProof />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>;
export default App;