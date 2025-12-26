import { motion } from "framer-motion";
import { TrendingUp, DollarSign, CheckCircle, Users, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsGridProps {
  stats: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
    totalUsers: number;
    pendingKyc: number;
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 24
    }
  }
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  accentBorder: string;
}

function StatCard({ title, value, icon: Icon, iconColor, bgColor, accentBorder }: StatCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative overflow-hidden rounded-xl p-4 sm:p-5",
        "bg-admin-surface/60 backdrop-blur-xl",
        "border border-admin-border/30",
        "shadow-lg shadow-black/5"
      )}
    >
      {/* Accent Line */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", accentBorder)} />
      
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Icon */}
        <div className={cn(
          "flex-shrink-0 p-2.5 sm:p-3 rounded-xl",
          bgColor
        )}>
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", iconColor)} />
        </div>
        
        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-medium text-admin-text-muted uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-admin-text mt-0.5">
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function AdminStatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    {
      title: "Total Trans.",
      value: stats.total,
      icon: TrendingUp,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/15",
      accentBorder: "bg-blue-500"
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      iconColor: "text-yellow-400",
      bgColor: "bg-yellow-500/15",
      accentBorder: "bg-yellow-500"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/15",
      accentBorder: "bg-emerald-500"
    },
    {
      title: "Users",
      value: stats.totalUsers,
      icon: Users,
      iconColor: "text-indigo-400",
      bgColor: "bg-indigo-500/15",
      accentBorder: "bg-indigo-500"
    },
    {
      title: "KYC Queue",
      value: stats.pendingKyc,
      icon: FileText,
      iconColor: "text-orange-400",
      bgColor: "bg-orange-500/15",
      accentBorder: "bg-orange-500"
    },
    {
      title: "Revenue",
      value: `$${stats.revenue.toFixed(2)}`,
      icon: DollarSign,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/15",
      accentBorder: "bg-emerald-500"
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4"
    >
      {statItems.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </motion.div>
  );
}
