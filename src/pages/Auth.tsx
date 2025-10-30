import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeftRight } from "lucide-react";
import { Link } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !phoneNumber || !country) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    // Set account type based on country
    const accountType = country === "Zimbabwe" ? "sender" : country === "Zambia" ? "receiver" : "both";

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone_number: phoneNumber,
          country: country,
          account_type: accountType,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Please check your email to verify.");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth`,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent! Check your email.");
      setShowForgotPassword(false);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <Link to="/" className="flex items-center gap-2 justify-center group">
            <div className="bg-primary p-2 rounded-lg group-hover:bg-accent transition-colors">
              <ArrowLeftRight className="h-5 w-5 text-primary-foreground group-hover:text-accent-foreground" />
            </div>
            <span className="text-2xl font-bold text-primary">TuraPay</span>
          </Link>
          <CardTitle className="text-2xl text-center">
            {showForgotPassword ? "Reset Password" : isLogin ? "Welcome back" : "Create account"}
          </CardTitle>
          <CardDescription className="text-center">
            {showForgotPassword
              ? "Enter your email to receive a password reset link"
              : isLogin
              ? "Sign in to your account to continue"
              : "Sign up to start sending money across borders"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowForgotPassword(false);
                  setEmail("");
                }}
              >
                Back to Sign In
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                {!isLogin && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="+263..."
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Select value={country} onValueChange={setCountry} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your country" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Zimbabwe">Zimbabwe</SelectItem>
                          <SelectItem value="Zambia">Zambia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {isLogin && (
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : isLogin ? "Sign In" : "Sign Up"}
                </Button>
              </form>

              <div className="mt-4 text-center text-sm">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:underline"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
