import { LayoutDashboard, FileText, Shield, Users, Settings as SettingsIcon, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const items = [
  { title: "Pending", value: "pending", icon: LayoutDashboard },
  { title: "All Transactions", value: "all", icon: FileText },
  { title: "KYC Verification", value: "kyc", icon: Shield },
  { title: "Users", value: "users", icon: Users },
  { title: "Settings", value: "settings", icon: SettingsIcon },
  { title: "Support Settings", value: "support", icon: HelpCircle },
];

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  return (
    <div className="w-60 bg-[hsl(220,15%,14%)] border-r border-white/10 min-h-screen">
      <div className="p-4">
        <h3 className="text-white/80 text-sm font-semibold mb-4">Admin Panel</h3>
        <nav className="space-y-1">
          {items.map((item) => {
            const isActive = activeTab === item.value;
            const Icon = item.icon;
            return (
              <button
                key={item.value}
                onClick={() => onTabChange(item.value)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                  isActive 
                    ? "bg-white/10 text-white font-medium" 
                    : "text-white/60 hover:bg-white/5 hover:text-white/80"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
