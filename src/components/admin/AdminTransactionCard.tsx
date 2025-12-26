import { motion } from "framer-motion";
import { CheckCircle, XCircle, Eye, User, Phone, MapPin, DollarSign, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Transaction {
  id: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_country: string;
  amount: number;
  fee: number;
  status: string;
  exchange_rate?: number;
  created_at: string;
  sender_number?: string;
  transaction_id?: string;
  tid?: string;
  profiles?: {
    full_name: string;
    phone_number: string;
  };
}

interface AdminTransactionCardProps {
  transaction: Transaction;
  onApprove: (id: string, tid: string, sender: string) => void;
  onReject: (id: string, reason: string) => void;
  onViewProof?: (url: string) => void;
  index?: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as const
    }
  })
};

export function AdminTransactionCard({ 
  transaction, 
  onApprove, 
  onReject,
  onViewProof,
  index = 0
}: AdminTransactionCardProps) {
  const [tid, setTid] = useState("");
  const [senderName, setSenderName] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showActions, setShowActions] = useState(false);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      paid: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      deposited: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
      failed: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    
    return (
      <Badge className={cn("admin-badge border", styles[status] || "bg-slate-500/20 text-slate-400")}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleApprove = () => {
    if (!tid.trim() || !senderName.trim()) return;
    onApprove(transaction.id, tid, senderName);
    setTid("");
    setSenderName("");
    setShowActions(false);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) return;
    onReject(transaction.id, rejectionReason);
    setRejectionReason("");
    setShowActions(false);
  };

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
      className="glass-card rounded-2xl p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-admin-surface flex items-center justify-center">
            <User className="h-5 w-5 text-admin-text-muted" />
          </div>
          <div>
            <h4 className="font-semibold text-admin-text">
              {transaction.profiles?.full_name || "Unknown Sender"}
            </h4>
            <p className="text-xs text-admin-text-muted flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(transaction.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        {getStatusBadge(transaction.status)}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <p className="text-xs text-admin-text-muted">Recipient</p>
          <p className="text-sm font-medium text-admin-text flex items-center gap-1">
            <User className="h-3 w-3 text-admin-text-muted" />
            {transaction.receiver_name}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-admin-text-muted">Phone</p>
          <p className="text-sm font-medium text-admin-text flex items-center gap-1">
            <Phone className="h-3 w-3 text-admin-text-muted" />
            {transaction.receiver_phone}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-admin-text-muted">Country</p>
          <p className="text-sm font-medium text-admin-text flex items-center gap-1">
            <MapPin className="h-3 w-3 text-admin-text-muted" />
            {transaction.receiver_country}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-admin-text-muted">Amount</p>
          <p className="text-sm font-bold text-primary flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            ${transaction.amount.toFixed(2)} USD
          </p>
        </div>
      </div>

      {/* Recipient Gets */}
      <div className="glass-card-elevated rounded-xl p-3">
        <p className="text-xs text-admin-text-muted mb-1">Recipient Gets</p>
        <p className="text-lg font-bold text-emerald-400">
          {transaction.receiver_country === 'Zambia' 
            ? `${(transaction.amount * (transaction.exchange_rate || 22)).toFixed(2)} ZMW`
            : `$${transaction.amount.toFixed(2)} USD`}
        </p>
      </div>

      {/* Action Toggle */}
      {transaction.status === "pending" && (
        <>
          <Button
            variant="outline"
            onClick={() => setShowActions(!showActions)}
            className="w-full border-admin-border/50 text-admin-text hover:bg-admin-surface"
          >
            {showActions ? "Hide Actions" : "Process Transaction"}
          </Button>

          {showActions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 pt-2"
            >
              {/* Approve Section */}
              <div className="space-y-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <Label className="text-sm text-admin-text">Approve Transaction</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="TID Number"
                    value={tid}
                    onChange={(e) => setTid(e.target.value)}
                    className="glass-input text-admin-text placeholder:text-admin-text-muted"
                  />
                  <Input
                    placeholder="Sender Name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="glass-input text-admin-text placeholder:text-admin-text-muted"
                  />
                </div>
                <Button
                  onClick={handleApprove}
                  disabled={!tid.trim() || !senderName.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve & Mark Deposited
                </Button>
              </div>

              {/* Reject Section */}
              <div className="space-y-3 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <Label className="text-sm text-admin-text">Reject Transaction</Label>
                <Textarea
                  placeholder="Rejection reason..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="glass-input text-admin-text placeholder:text-admin-text-muted min-h-[80px]"
                />
                <Button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  variant="destructive"
                  className="w-full gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject Transaction
                </Button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
