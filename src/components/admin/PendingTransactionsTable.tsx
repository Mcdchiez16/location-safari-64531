import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Eye,
  User,
  Phone,
  MapPin,
  Clock,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  ExternalLink,
  Banknote,
  CreditCard,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  sender_id: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_country: string;
  amount: number;
  fee: number;
  status: string;
  exchange_rate?: number;
  total_amount?: number;
  payout_method?: string;
  payment_proof_url?: string;
  admin_notes?: string;
  payment_reference?: string;
  payment_date?: string;
  admin_payment_proof_url?: string;
  created_at: string;
  sender_number?: string;
  transaction_id?: string;
  tid?: string;
  rejection_reason?: string;
  profiles?: {
    full_name: string;
    phone_number: string;
  };
}

interface PendingTransactionsTableProps {
  transactions: Transaction[];
  onApprove: (id: string, status: string, notes?: string, reference?: string, proofUrl?: string, tid?: string, sender?: string) => void;
  onReject: (id: string, status: string, notes?: string, reference?: string, proofUrl?: string, tid?: string, sender?: string, reason?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 }
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" as const }
  }
};

export function PendingTransactionsTable({
  transactions,
  onApprove,
  onReject,
  searchQuery,
  setSearchQuery
}: PendingTransactionsTableProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [tid, setTid] = useState("");
  const [senderName, setSenderName] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const pendingTransactions = transactions
    .filter(t => t.status === "pending")
    .filter(t =>
      t.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.receiver_phone.includes(searchQuery) ||
      (t.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortField === "date") {
        return sortOrder === "desc"
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
    });

  const toggleSort = (field: "date" | "amount") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const toggleRowExpand = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleApprove = () => {
    if (!selectedTransaction || !tid.trim() || !senderName.trim()) return;
    onApprove(selectedTransaction.id, "deposited", undefined, undefined, undefined, tid, senderName);
    resetForm();
  };

  const handleReject = () => {
    if (!selectedTransaction || !rejectionReason.trim()) return;
    onReject(selectedTransaction.id, "rejected", undefined, undefined, undefined, undefined, undefined, rejectionReason);
    resetForm();
  };

  const resetForm = () => {
    setTid("");
    setSenderName("");
    setRejectionReason("");
    setSelectedTransaction(null);
    setSheetOpen(false);
  };

  const openDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setSheetOpen(true);
  };

  const formatCurrency = (amount: number, country: string, rate?: number) => {
    if (country === "Zambia") {
      return `${(amount * (rate || 22)).toLocaleString()} ZMW`;
    }
    return `$${amount.toFixed(2)} USD`;
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return "Just now";
  };

  return (
    <>
      {/* Header Section */}
      <Card className="bg-admin-surface/50 border-admin-border/30 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold text-admin-text flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-yellow-400" />
                </div>
                Pending Transactions
              </CardTitle>
              <CardDescription className="text-admin-text-muted mt-1">
                {pendingTransactions.length} transaction{pendingTransactions.length !== 1 ? "s" : ""} awaiting approval
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-admin-text-muted" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-admin-bg/50 border-admin-border/50 text-admin-text placeholder:text-admin-text-muted h-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {pendingTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 text-center"
            >
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium text-admin-text mb-1">All Caught Up!</h3>
              <p className="text-sm text-admin-text-muted">No pending transactions to review</p>
            </motion.div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow className="border-admin-border/30 hover:bg-transparent">
                      <TableHead className="text-admin-text-muted font-medium">Sender</TableHead>
                      <TableHead className="text-admin-text-muted font-medium">Recipient</TableHead>
                      <TableHead className="text-admin-text-muted font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("amount")}
                          className="h-auto p-0 text-admin-text-muted hover:text-admin-text font-medium hover:bg-transparent"
                        >
                          Amount
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-admin-text-muted font-medium">Recipient Gets</TableHead>
                      <TableHead className="text-admin-text-muted font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("date")}
                          className="h-auto p-0 text-admin-text-muted hover:text-admin-text font-medium hover:bg-transparent"
                        >
                          Date
                          <ArrowUpDown className="ml-1 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-admin-text-muted font-medium text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {pendingTransactions.map((transaction, index) => (
                        <motion.tr
                          key={transaction.id}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          custom={index}
                          className="border-admin-border/20 hover:bg-admin-surface/30 transition-colors group"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-admin-surface flex items-center justify-center ring-1 ring-admin-border/30">
                                <User className="h-4 w-4 text-admin-text-muted" />
                              </div>
                              <div>
                                <p className="font-medium text-admin-text text-sm">
                                  {transaction.profiles?.full_name || "Unknown"}
                                </p>
                                <p className="text-xs text-admin-text-muted">
                                  {transaction.profiles?.phone_number || "—"}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-admin-text text-sm">{transaction.receiver_name}</p>
                              <div className="flex items-center gap-1 text-xs text-admin-text-muted">
                                <Phone className="h-3 w-3" />
                                {transaction.receiver_phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-admin-text">${transaction.amount.toFixed(2)}</span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-emerald-400">
                              {formatCurrency(transaction.amount, transaction.receiver_country, transaction.exchange_rate)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5 text-admin-text-muted text-sm">
                              <Clock className="h-3.5 w-3.5" />
                              {getTimeAgo(transaction.created_at)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openDetails(transaction)}
                                className="h-8 text-admin-text-muted hover:text-admin-text hover:bg-admin-surface"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild className="opacity-100 group-hover:opacity-0 absolute right-4">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-admin-text-muted">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-admin-surface border-admin-border">
                                <DropdownMenuItem
                                  onClick={() => openDetails(transaction)}
                                  className="text-admin-text hover:bg-admin-bg cursor-pointer"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-admin-border" />
                                <DropdownMenuItem
                                  onClick={() => openDetails(transaction)}
                                  className="text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openDetails(transaction)}
                                  className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-admin-border/20">
                <AnimatePresence>
                  {pendingTransactions.map((transaction, index) => (
                    <Collapsible
                      key={transaction.id}
                      open={expandedRows.has(transaction.id)}
                      onOpenChange={() => toggleRowExpand(transaction.id)}
                    >
                      <motion.div
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        custom={index}
                        className="p-4"
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-admin-surface flex items-center justify-center ring-1 ring-admin-border/30">
                                <User className="h-5 w-5 text-admin-text-muted" />
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-admin-text text-sm">
                                  {transaction.profiles?.full_name || "Unknown"}
                                </p>
                                <p className="text-xs text-admin-text-muted">{getTimeAgo(transaction.created_at)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-semibold text-admin-text">${transaction.amount.toFixed(2)}</p>
                                <p className="text-xs text-emerald-400">
                                  {formatCurrency(transaction.amount, transaction.receiver_country, transaction.exchange_rate)}
                                </p>
                              </div>
                              {expandedRows.has(transaction.id) ? (
                                <ChevronUp className="h-5 w-5 text-admin-text-muted" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-admin-text-muted" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-4"
                          >
                            <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-admin-bg/50">
                              <div>
                                <p className="text-xs text-admin-text-muted">Recipient</p>
                                <p className="text-sm font-medium text-admin-text">{transaction.receiver_name}</p>
                              </div>
                              <div>
                                <p className="text-xs text-admin-text-muted">Phone</p>
                                <p className="text-sm font-medium text-admin-text">{transaction.receiver_phone}</p>
                              </div>
                              <div>
                                <p className="text-xs text-admin-text-muted">Country</p>
                                <p className="text-sm font-medium text-admin-text">{transaction.receiver_country}</p>
                              </div>
                              <div>
                                <p className="text-xs text-admin-text-muted">Fee</p>
                                <p className="text-sm font-medium text-admin-text">${transaction.fee?.toFixed(2) || "0.00"}</p>
                              </div>
                            </div>

                            <Button
                              onClick={() => openDetails(transaction)}
                              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Review & Process
                            </Button>
                          </motion.div>
                        </CollapsibleContent>
                      </motion.div>
                    </Collapsible>
                  ))}
                </AnimatePresence>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg bg-admin-bg border-admin-border overflow-y-auto">
          <SheetHeader className="space-y-1">
            <SheetTitle className="text-admin-text flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Clock className="h-4 w-4 text-yellow-400" />
              </div>
              Transaction Review
            </SheetTitle>
            <SheetDescription className="text-admin-text-muted">
              Review and process this pending transaction
            </SheetDescription>
          </SheetHeader>

          {selectedTransaction && (
            <div className="mt-6 space-y-6">
              {/* Transaction Summary */}
              <Card className="bg-admin-surface/50 border-admin-border/30">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-admin-bg flex items-center justify-center ring-2 ring-admin-border/30">
                        <User className="h-6 w-6 text-admin-text-muted" />
                      </div>
                      <div>
                        <p className="font-semibold text-admin-text">
                          {selectedTransaction.profiles?.full_name || "Unknown Sender"}
                        </p>
                        <p className="text-sm text-admin-text-muted">
                          {selectedTransaction.profiles?.phone_number || "—"}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      Pending
                    </Badge>
                  </div>

                  <Separator className="bg-admin-border/30" />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-admin-text-muted flex items-center gap-1">
                        <User className="h-3 w-3" /> Recipient
                      </p>
                      <p className="text-sm font-medium text-admin-text">
                        {selectedTransaction.receiver_name}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-admin-text-muted flex items-center gap-1">
                        <Phone className="h-3 w-3" /> Phone
                      </p>
                      <p className="text-sm font-medium text-admin-text">
                        {selectedTransaction.receiver_phone}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-admin-text-muted flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Country
                      </p>
                      <p className="text-sm font-medium text-admin-text">
                        {selectedTransaction.receiver_country}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-admin-text-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Date
                      </p>
                      <p className="text-sm font-medium text-admin-text">
                        {new Date(selectedTransaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amount Card */}
              <Card className="bg-admin-surface/50 border-admin-border/30 overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-admin-text-muted">Amount Sent</span>
                    <span className="text-lg font-bold text-admin-text">
                      ${selectedTransaction.amount.toFixed(2)} USD
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-admin-text-muted">Transfer Fee</span>
                    <span className="text-sm text-admin-text">
                      ${selectedTransaction.fee?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                  <Separator className="bg-admin-border/30" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-admin-text">Recipient Gets</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {formatCurrency(
                        selectedTransaction.amount,
                        selectedTransaction.receiver_country,
                        selectedTransaction.exchange_rate
                      )}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Action Forms */}
              <div className="space-y-4">
                {/* Approve Form */}
                <Card className="bg-emerald-500/5 border-emerald-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-emerald-400 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Approve Transaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-admin-text-muted">TID Number</Label>
                        <Input
                          placeholder="Enter TID"
                          value={tid}
                          onChange={(e) => setTid(e.target.value)}
                          className="bg-admin-bg/50 border-admin-border/50 text-admin-text placeholder:text-admin-text-muted h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-admin-text-muted">Sender Name</Label>
                        <Input
                          placeholder="Enter sender"
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          className="bg-admin-bg/50 border-admin-border/50 text-admin-text placeholder:text-admin-text-muted h-9"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleApprove}
                      disabled={!tid.trim() || !senderName.trim()}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve & Mark Deposited
                    </Button>
                  </CardContent>
                </Card>

                {/* Reject Form */}
                <Card className="bg-red-500/5 border-red-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-red-400 flex items-center gap-2">
                      <XCircle className="h-4 w-4" />
                      Reject Transaction
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-admin-text-muted">Rejection Reason</Label>
                      <Textarea
                        placeholder="Enter the reason for rejection..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="bg-admin-bg/50 border-admin-border/50 text-admin-text placeholder:text-admin-text-muted min-h-[80px] resize-none"
                      />
                    </div>
                    <Button
                      onClick={handleReject}
                      disabled={!rejectionReason.trim()}
                      variant="destructive"
                      className="w-full disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Transaction
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
