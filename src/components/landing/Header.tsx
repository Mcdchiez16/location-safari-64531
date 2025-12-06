import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import logo from "@/assets/ticlapay-logo.png";

interface HeaderProps {
  exchangeRate: number | null;
}

const Header = ({ exchangeRate }: HeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-3 sm:py-4">
        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
          <img src={logo} alt="TiclaPay Logo" className="h-8 object-contain" />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {exchangeRate && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-primary">
                1 USD = {exchangeRate.toFixed(2)} ZMW
              </span>
            </div>
          )}

          <Button
            onClick={() => navigate("/auth")}
            variant="ghost"
            className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
          >
            Sign In
          </Button>

          <Button
            onClick={() => navigate("/auth")}
            className="premium-button h-9 sm:h-10 px-4 sm:px-6 text-sm font-semibold"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
