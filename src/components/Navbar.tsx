import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Home, Send, Users, History, Menu, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    loadAccountType();
  }, []);
  const loadAccountType = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }
    const {
      data
    } = await supabase.from("profiles").select("account_type").eq("id", session.user.id).single();
    if (data) {
      setAccountType(data.account_type);
    }
    setLoading(false);
  };

  // Don't show navbar on landing or auth pages, or when user is logged in
  if (location.pathname === '/' || location.pathname === '/auth' || accountType) {
    return null;
  }
  if (loading) {
    return null;
  }
  const menuItems = [{
    icon: Home,
    label: "Dashboard",
    path: "/dashboard"
  }, {
    icon: Send,
    label: "Send Money",
    path: "/send"
  }, {
    icon: Users,
    label: "Recipients",
    path: "/recipients"
  }, {
    icon: History,
    label: "Transactions",
    path: "/transactions"
  }, {
    icon: Settings,
    label: "Settings",
    path: "/settings"
  }];
  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };
  return <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg">
      <div className="container mx-auto px-4">
        
      </div>
    </div>;
};
export default Navbar;