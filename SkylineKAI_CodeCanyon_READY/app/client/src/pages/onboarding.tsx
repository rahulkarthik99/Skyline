import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, Building2, Briefcase, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const industries = [
  { value: "real_estate", label: "Real Estate" },
  { value: "coaching", label: "Coaching / Courses" },
  { value: "healthcare", label: "Healthcare / Clinics" },
  { value: "salon", label: "Salon / Spa" },
  { value: "fitness", label: "Fitness / Gym" },
  { value: "restaurant", label: "Restaurant / Food" },
  { value: "ecommerce", label: "E-commerce" },
  { value: "agency", label: "Marketing Agency" },
  { value: "other", label: "Other" },
];

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLocation("/login");
        return;
      }

      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ businessName, industry }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create business");
      }

      localStorage.setItem("currentBusiness", JSON.stringify(data.business));
      
      toast({
        title: "Business created! 🎉",
        description: "Your AI assistant is ready to go.",
      });
      
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-card/95 backdrop-blur-md border border-slate-700/50 skyline-glow rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl skyline-logo-bg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">SkylineKAI</span>
            </div>
            <h1 className="text-2xl font-bold mb-2">Set up your business</h1>
            <p className="text-sm text-slate-400">Let's create your AI-powered workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="businessName"
                  type="text"
                  placeholder="My Awesome Business"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="pl-10 bg-slate-900/50 border-slate-700"
                  required
                  data-testid="input-business-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select value={industry} onValueChange={setIndustry} required>
                <SelectTrigger className="bg-slate-900/50 border-slate-700" data-testid="select-industry">
                  <Briefcase className="w-4 h-4 text-slate-400 mr-2" />
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind.value} value={ind.value}>
                      {ind.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full user-bubble-gradient text-slate-950 font-semibold h-11"
              disabled={loading || !industry}
              data-testid="button-create-business"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Create business <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            You can add more businesses later from your dashboard
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
