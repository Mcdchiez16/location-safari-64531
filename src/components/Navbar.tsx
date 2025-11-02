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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold text-white">TuraPay</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map(item => <Button key={item.path} onClick={() => navigate(item.path)} variant="ghost" className={`text-white hover:bg-white/20 ${location.pathname === item.path ? 'bg-white/20' : ''}`}>
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>)}
          </nav>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col space-y-2 mt-8">
                {menuItems.map(item => <Button key={item.path} onClick={() => handleNavigate(item.path)} variant="ghost" className={`justify-start ${location.pathname === item.path ? 'bg-accent' : ''}`}>
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>)}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>;
};
export default Navbar;