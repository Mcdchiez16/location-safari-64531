import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Plus, Edit2, Trash2, User } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Recipient {
  id: string;
  full_name: string;
  phone_number: string;
  country: string;
  payout_method: string;
}

const Recipients = () => {
  const navigate = useNavigate();
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [payoutMethod, setPayoutMethod] = useState("");

  useEffect(() => {
    checkAuth();
    loadRecipients();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadRecipients = async () => {
    const { data, error } = await supabase
      .from("recipients" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load recipients");
      console.error(error);
    } else {
      setRecipients((data || []) as any);
    }
  };

  const resetForm = () => {
    setFullName("");
    setPhoneNumber("");
    setPayoutMethod("");
    setEditingRecipient(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (editingRecipient) {
      // Update existing recipient
      const { error } = await supabase
        .from("recipients" as any)
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
          payout_method: payoutMethod,
        })
        .eq("id", editingRecipient.id);

      if (error) {
        toast.error("Failed to update recipient");
        console.error(error);
      } else {
        toast.success("Recipient updated successfully");
        setDialogOpen(false);
        resetForm();
        loadRecipients();
      }
    } else {
      // Create new recipient
      const { error } = await supabase.from("recipients" as any).insert({
        user_id: session.user.id,
        full_name: fullName,
        phone_number: phoneNumber,
        country: "Zambia",
        payout_method: payoutMethod,
      });

      if (error) {
        toast.error("Failed to add recipient");
        console.error(error);
      } else {
        toast.success("Recipient added successfully");
        setDialogOpen(false);
        resetForm();
        loadRecipients();
      }
    }

    setLoading(false);
  };

  const handleEdit = (recipient: Recipient) => {
    setEditingRecipient(recipient);
    setFullName(recipient.full_name);
    setPhoneNumber(recipient.phone_number);
    setPayoutMethod(recipient.payout_method);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipient?")) return;

    const { error } = await supabase
      .from("recipients" as any)
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete recipient");
      console.error(error);
    } else {
      toast.success("Recipient deleted");
      loadRecipients();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Recipients</h1>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Recipient
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingRecipient ? "Edit Recipient" : "Add New Recipient"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Mwale"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number (Zambia)</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+260..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payoutMethod">Payout Method</Label>
                  <Select value={payoutMethod} onValueChange={setPayoutMethod} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payout method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Airtel Money">Airtel Money</SelectItem>
                      <SelectItem value="MTN Money">MTN Money</SelectItem>
                      <SelectItem value="Manual">Manual Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Saving..." : editingRecipient ? "Update Recipient" : "Add Recipient"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {recipients.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <User className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No recipients yet</p>
                <p className="text-sm text-muted-foreground">
                  Add recipients to send money quickly
                </p>
              </CardContent>
            </Card>
          ) : (
            recipients.map((recipient) => (
              <Card key={recipient.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                        {recipient.full_name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{recipient.full_name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{recipient.phone_number}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {recipient.payout_method}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(recipient)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(recipient.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Recipients;
