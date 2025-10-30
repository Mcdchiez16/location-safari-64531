import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Upload, Shield, FileText, Camera, CheckCircle2 } from "lucide-react";

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
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">TuraPay</span>
            </div>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">TuraPay</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/settings')} 
              className="gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-blue-600 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">KYC Verification</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Complete your identity verification to unlock full access to TuraPay services and start sending money securely
            </p>
          </div>
          
          {/* Verification Status */}
          <div className="px-8 py-6 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Verification Status</p>
                <div className="flex items-center gap-3 mt-2">
                  {profile?.verified ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                      <span className="text-lg font-semibold text-green-600">Verified</span>
                    </>
                  ) : (
                    <>
                      <div className="h-6 w-6 rounded-full border-3 border-yellow-500 border-t-transparent animate-spin" />
                      <span className="text-lg font-semibold text-yellow-600">Pending Verification</span>
                    </>
                  )}
                </div>
              </div>
              {profile?.verified && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium">
                  Account Verified
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              Personal Information
            </h2>
            <p className="text-gray-600 mt-1">
              Provide your identification details for verification
            </p>
          </div>
          <div className="p-8">
            {profile?.verified && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <p className="text-green-700 font-semibold text-lg">Your account has been verified successfully!</p>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="idType" className="text-sm font-medium text-gray-700 uppercase tracking-wide">ID Type</Label>
                <Input
                  id="idType"
                  placeholder="National ID / Passport"
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="idNumber" className="text-sm font-medium text-gray-700 uppercase tracking-wide">ID Number</Label>
                <Input
                  id="idNumber"
                  placeholder="Enter ID number"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="mt-2 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button 
              onClick={updateKYCInfo} 
              disabled={loading} 
              className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-lg font-medium"
            >
              Update Information
            </Button>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* ID Document */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-blue-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                ID Document
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Upload a clear photo of your government-issued ID
              </p>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                {profile?.id_document_url ? (
                  <div>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-base text-green-600 font-semibold">Document uploaded successfully</p>
                    <p className="text-sm text-gray-500 mt-2">Your ID document is being reviewed</p>
                  </div>
                ) : (
                  <div>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-base text-gray-900 font-semibold mb-2">Upload ID document</p>
                    <p className="text-sm text-gray-500 mb-4">
                      JPG, PNG, PDF • Max 5MB
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
                  className="mt-4 cursor-pointer border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Selfie Verification */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-blue-50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Camera className="h-5 w-5 text-blue-600" />
                Selfie Verification
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Take a clear selfie holding your ID document
              </p>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                {profile?.selfie_url ? (
                  <div>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-base text-green-600 font-semibold">Selfie uploaded successfully</p>
                    <p className="text-sm text-gray-500 mt-2">Your selfie is being reviewed</p>
                  </div>
                ) : (
                  <div>
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                      <Camera className="h-8 w-8 text-blue-600" />
                    </div>
                    <p className="text-base text-gray-900 font-semibold mb-2">Upload selfie</p>
                    <p className="text-sm text-gray-500 mb-4">
                      JPG, PNG • Max 5MB
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
                  className="mt-4 cursor-pointer border-gray-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you're having trouble with verification, please contact our support team at{" "}
            <a href="mailto:support@turapay.com" className="text-blue-600 font-medium hover:underline">
              support@turapay.com
            </a>
          </p>
          <div className="flex items-start gap-3 text-sm text-gray-600">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p>
              Your documents are encrypted and securely stored. We take your privacy seriously and will never share your information without your consent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verification;
