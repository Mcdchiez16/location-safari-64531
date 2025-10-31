import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings, Home, Send, Users, History, Menu, X, Search } from "lucide-react";
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
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setAccountType(data.account_type);
    }
    setLoading(false);
  };

  // Don't show navbar on landing or auth pages
  if (location.pathname === '/' || location.pathname === '/auth') {
    return null;
  }

  if (loading) {
    return null;
  }

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Send, label: "Send Money", path: "/send" },
    { icon: Users, label: "Recipients", path: "/recipients" },
    { icon: History, label: "Transactions", path: "/transactions" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-secondary shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2 group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center group-hover:bg-primary/90 transition-all">
              <span className="text-2xl font-bold text-white">T</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">TuraPay</span>
          </button>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 hidden md:flex"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-white hover:bg-white/10"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-secondary border-l border-white/10">
                <nav className="flex flex-col space-y-2 mt-8">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigate(item.path)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? "bg-white/10 text-white font-semibold"
                            : "text-white/80 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
