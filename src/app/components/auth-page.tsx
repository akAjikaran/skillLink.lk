import { useState } from "react";
import { Briefcase, Mail, Lock, User, Loader2, ArrowRight, Phone, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { supabase } from "../lib/supabase";
import { toast } from "sonner";

interface AuthPageProps {
  onNavigate: (page: string) => void;
  initialMode?: "login" | "signup";
}

export function AuthPage({ onNavigate, initialMode = "login" }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"input" | "verify">("input");
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "+94",
    otp: "",
  });

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: { full_name: formData.fullName },
          },
        });
        if (error) throw error;
        toast.success("Account created! You can now sign in.");
        setMode("login");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;
        toast.success("Welcome back!");
        onNavigate("home");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (step === "input") {
        // Step 1: Send OTP
        const { error } = await supabase.auth.signInWithOtp({
          phone: formData.phone,
        });
        if (error) throw error;
        setStep("verify");
        toast.success("Verification code sent to your phone!");
      } else {
        // Step 2: Verify OTP
        const { error } = await supabase.auth.verifyOtp({
          phone: formData.phone,
          token: formData.otp,
          type: 'sms',
        });
        if (error) throw error;
        toast.success("Login successful!");
        onNavigate("home");
      }
    } catch (error: any) {
      toast.error(error.message || "Phone authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-muted/50">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-primary p-3 rounded-2xl text-primary-foreground shadow-lg">
              <Briefcase className="h-8 w-8" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-base">
            Join our marketplace to find or offer services
          </CardDescription>
        </CardHeader>

        <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v as any)} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="phone" className="font-bold">Phone Number</TabsTrigger>
              <TabsTrigger value="email" className="font-bold">Email</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="email">
            <form onSubmit={handleEmailAuth}>
              <CardContent className="space-y-4 pt-2">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Sunil Perera"
                        className="pl-10 h-11"
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        required={mode === "signup"}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10 h-11"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 h-11"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button className="w-full h-11 font-bold text-base" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (mode === "login" ? "Sign In" : "Register")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <div className="text-sm text-center text-muted-foreground">
                  {mode === "login" ? (
                    <p>Don't have an account? <button type="button" onClick={() => setMode("signup")} className="text-primary font-bold">Sign up</button></p>
                  ) : (
                    <p>Already have an account? <button type="button" onClick={() => setMode("login")} className="text-primary font-bold">Login</button></p>
                  )}
                </div>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="phone">
            <form onSubmit={handlePhoneAuth}>
              <CardContent className="space-y-4 pt-2">
                {step === "input" ? (
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+94 77 123 4567"
                        className="pl-10 h-11"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Format: +94XXXXXXXXX</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="otp"
                        type="text"
                        placeholder="Enter 6-digit code"
                        className="pl-10 h-11"
                        value={formData.otp}
                        onChange={(e) => setFormData({...formData, otp: e.target.value})}
                        required
                      />
                    </div>
                    <Button variant="link" onClick={() => setStep("input")} className="p-0 h-auto text-xs font-bold">
                      Change phone number
                    </Button>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button className="w-full h-11 font-bold text-base" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (step === "input" ? "Send Code" : "Verify & Login")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
