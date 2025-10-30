import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Upload, Check, Shield } from "lucide-react";
import Navbar from "@/components/Navbar";

interface Profile {
  id: string;
  full_name: string;
  phone_number: string;
  country: string;
  id_type: string | null;
  id_number: string | null;
  id_document_url: string | null;
  selfie_url: string | null;
  verified: boolean;
}

const Verification = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [idType, setIdType] = useState("");
  const [idNumber, setIdNumber] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (error) {
      toast.error("Error loading profile");
      console.error(error);
    } else {
      setProfile(data);
      setIdType(data.id_type || "");
      setIdNumber(data.id_number || "");
    }
    setLoading(false);
  };

  const handleFileUpload = async (file: File, type: 'id_document' | 'selfie') => {
    if (!profile) return;
    
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.id}/${type}_${Date.now()}.${fileExt}`;

    // For now, just update the profile with placeholder URLs since storage buckets aren't set up yet
    const { error } = await supabase
      .from("profiles")
      .update({
        [type === 'id_document' ? 'id_document_url' : 'selfie_url']: `placeholder_${fileName}`
      })
      .eq("id", profile.id);

    if (error) {
      toast.error(`Failed to upload ${type}`);
      console.error(error);
    } else {
      toast.success(`${type === 'id_document' ? 'ID Document' : 'Selfie'} uploaded successfully`);
      loadProfile();
    }
    setUploading(false);
  };

  const updateKYCInfo = async () => {
    if (!profile) return;
    
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        id_type: idType,
        id_number: idNumber,
      })
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to update KYC information");
      console.error(error);
    } else {
      toast.success("KYC information updated");
      loadProfile();
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/settings')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">KYC Verification</h1>
            <p className="text-sm text-muted-foreground">
              Upload documents to verify your account
              {profile?.verified && <span className="text-success ml-2">✓ Verified</span>}
            </p>
          </div>
        </div>

        <Card className="shadow-lg rounded-3xl">
          <CardHeader>
            <CardTitle>Identity Verification</CardTitle>
            <CardDescription>
              Please provide your identification details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="idType" className="text-base">ID Type</Label>
                <Input
                  id="idType"
                  placeholder="National ID / Passport"
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="mt-2 h-12"
                />
              </div>
              <div>
                <Label htmlFor="idNumber" className="text-base">ID Number</Label>
                <Input
                  id="idNumber"
                  placeholder="Enter ID number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="mt-2 h-12"
                />
              </div>
            </div>

            <Button onClick={updateKYCInfo} disabled={loading} className="w-full h-12 text-base">
              Update KYC Information
            </Button>

            <div className="grid gap-6 mt-8">
              <div>
                <Label className="text-base font-semibold">ID Document</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Upload a clear photo of your government-issued ID
                </p>
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center">
                  {profile?.id_document_url ? (
                    <div>
                      <Check className="h-12 w-12 mx-auto text-success mb-3" />
                      <p className="text-base text-success font-medium">Document uploaded successfully</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-base text-foreground font-medium mb-2">Upload ID document</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Accepted formats: JPG, PNG, PDF (Max 5MB)
                      </p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'id_document');
                    }}
                    disabled={uploading}
                    className="mt-4 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold">Selfie Verification</Label>
                <p className="text-sm text-muted-foreground mt-1 mb-3">
                  Take a clear selfie holding your ID document
                </p>
                <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center">
                  {profile?.selfie_url ? (
                    <div>
                      <Check className="h-12 w-12 mx-auto text-success mb-3" />
                      <p className="text-base text-success font-medium">Selfie uploaded successfully</p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-base text-foreground font-medium mb-2">Upload selfie</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Accepted formats: JPG, PNG (Max 5MB)
                      </p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, 'selfie');
                    }}
                    disabled={uploading}
                    className="mt-4 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Navbar />
    </div>
  );
};

export default Verification;
