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
      staggerChildren: 0.08
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
}

function StatCard({ title, value, icon: Icon, iconColor, bgColor }: StatCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="admin-stat-card rounded-2xl p-5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-admin-text-muted uppercase tracking-wide">
            {title}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-admin-text">
            {value}
          </p>
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          bgColor
        )}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}

export function AdminStatsGrid({ stats }: StatsGridProps) {
  const statItems = [
    {
      title: "Total Transactions",
      value: stats.total,
      icon: TrendingUp,
      iconColor: "text-blue-400",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: Clock,
      iconColor: "text-yellow-400",
      bgColor: "bg-yellow-500/10"
    },
    {
      title: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      iconColor: "text-indigo-400",
      bgColor: "bg-indigo-500/10"
    },
    {
      title: "Pending KYC",
      value: stats.pendingKyc,
      icon: FileText,
      iconColor: "text-orange-400",
      bgColor: "bg-orange-500/10"
    },
    {
      title: "Revenue (Fees)",
      value: `$${stats.revenue.toFixed(2)}`,
      icon: DollarSign,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10"
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
    >
      {statItems.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </motion.div>
  );
}
