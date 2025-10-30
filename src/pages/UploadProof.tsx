import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Upload, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";

const UploadProof = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const transactionId = searchParams.get("transaction");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and PDF files are allowed");
      return;
    }

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${session.user.id}/${transactionId}_${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(fileName);

      setUploadedUrl(urlData.publicUrl);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedUrl || !transactionId) {
      toast.error("Please upload a file first");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("transactions")
      .update({ proof_of_payment_url: uploadedUrl } as any)
      .eq("id", transactionId);

    if (error) {
      toast.error("Failed to submit proof of payment");
      console.error(error);
    } else {
      toast.success("Proof of payment submitted successfully!");
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-6 w-6" />
              Upload Proof of Payment
            </CardTitle>
            <CardDescription>
              Upload your payment receipt or proof of payment for verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="file">Payment Proof (JPG, PNG, or PDF)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                <input
                  id="file"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <label
                  htmlFor="file"
                  className="cursor-pointer flex flex-col items-center"
                >
                  {uploadedUrl ? (
                    <>
                      <CheckCircle className="h-12 w-12 text-success mb-2" />
                      <p className="text-sm font-medium text-success">
                        File uploaded successfully
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Click to upload a different file
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">
                        {uploading ? "Uploading..." : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Max file size: 5MB
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Important Information:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Ensure the payment details are clearly visible</li>
                <li>• Include transaction reference or confirmation number</li>
                <li>• Make sure the amount matches your transfer</li>
                <li>• Admin will review and process your transfer</li>
              </ul>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
              disabled={loading || !uploadedUrl}
            >
              {loading ? "Submitting..." : "Submit Proof of Payment"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UploadProof;
