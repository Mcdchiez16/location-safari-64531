import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  FileText, 
  Shield, 
  Users, 
  Settings as SettingsIcon, 
  HelpCircle,
  X,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AdminSidebarNewProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const menuItems = [
  { 
    title: "Pending", 
    value: "pending", 
    icon: LayoutDashboard,
    badge: null,
    color: "text-yellow-400"
  },
  { 
    title: "All Transactions", 
    value: "all", 
    icon: FileText,
    badge: null,
    color: "text-blue-400"
  },
  { 
    title: "KYC Verification", 
    value: "kyc", 
    icon: Shield,
    badge: null,
    color: "text-emerald-400"
  },
  { 
    title: "Users", 
    value: "users", 
    icon: Users,
    badge: null,
    color: "text-indigo-400"
  },
  { 
    title: "Settings", 
    value: "settings", 
    icon: SettingsIcon,
    badge: null,
    color: "text-slate-400"
  },
  { 
    title: "Support", 
    value: "support", 
    icon: HelpCircle,
    badge: null,
    color: "text-orange-400"
  },
];

const sidebarVariants = {
  hidden: { x: -280, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring" as const,
      stiffness: 300,
      damping: 30
    }
  }
};

const itemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const
    }
  })
};

export function AdminSidebarNew({ 
  activeTab, 
  onTabChange, 
  isOpen = true,
  onClose 
}: AdminSidebarNewProps) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 admin-sidebar",
          "flex flex-col",
          !isOpen && "hidden lg:flex"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-admin-border/40">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/20 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-admin-text text-sm">Admin Panel</h2>
              <p className="text-xs text-admin-text-muted">Ticlapay</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-admin-text-muted hover:text-admin-text"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item, index) => {
            const isActive = activeTab === item.value;
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.value}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onTabChange(item.value);
                  onClose?.();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left group",
                  isActive 
                    ? "glass-card-elevated text-admin-text" 
                    : "text-admin-text-muted hover:text-admin-text hover:bg-admin-surface/50"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg transition-colors duration-200",
                  isActive 
                    ? "bg-admin-surface" 
                    : "bg-transparent group-hover:bg-admin-surface/50"
                )}>
                  <Icon className={cn("h-4 w-4", isActive ? item.color : "")} />
                </div>
                <span className="font-medium text-sm">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary">
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-admin-border/40">
          <div className="glass-card rounded-xl p-4">
            <p className="text-xs text-admin-text-muted mb-1">System Status</p>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm text-admin-text font-medium">All systems operational</span>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
