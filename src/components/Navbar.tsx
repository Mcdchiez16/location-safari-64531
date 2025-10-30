import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  // Don't show settings button on settings page
  const showSettingsButton = location.pathname !== '/settings';

  if (loading) {
    return null;
  }

  return (
    <>
      {/* Top Settings Button */}
      {showSettingsButton && (
        <div className="fixed top-4 right-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/settings")}
            className="rounded-full bg-background shadow-md hover:shadow-lg transition-shadow"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      )}
    </>
  );
};

export default Navbar;
