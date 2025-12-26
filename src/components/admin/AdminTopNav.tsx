import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ticlapayLogo from "@/assets/ticlapay-logo.png";

interface AdminTopNavProps {
  onMenuClick?: () => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function AdminTopNav({ onMenuClick, searchQuery, onSearchChange }: AdminTopNavProps) {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="admin-topnav sticky top-0 z-40 h-14 sm:h-16"
    >
      <div className="h-full px-3 sm:px-4 md:px-6 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-admin-text hover:bg-admin-surface h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <img 
              src={ticlapayLogo} 
              alt="Ticlapay" 
              className="h-6 w-auto object-contain"
            />
            <span className="text-sm font-semibold text-admin-text hidden sm:inline">Admin</span>
          </div>
          
          {/* Desktop Title */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-admin-text">Dashboard</h1>
            <p className="text-xs text-admin-text-muted">Management Panel</p>
          </div>
        </div>

        {/* Center - Search (hidden on mobile) */}
        {onSearchChange && (
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-muted" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 glass-input text-admin-text placeholder:text-admin-text-muted border-admin-border/40 focus:border-primary h-9"
              />
            </div>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-2">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="relative text-admin-text-muted hover:text-admin-text hover:bg-admin-surface h-9 w-9"
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-primary rounded-full animate-pulse-soft" />
            </Button>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="gap-1.5 border-admin-border/50 bg-admin-surface/50 hover:bg-admin-surface text-admin-text text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
