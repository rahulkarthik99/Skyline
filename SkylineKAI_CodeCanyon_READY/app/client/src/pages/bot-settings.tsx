import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  Save,
  Loader2,
  Menu,
  X,
  Wand2,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface BotSettings {
  systemPrompt: string;
  theme: string;
  welcomeMessage: string;
  modelName: string;
}

const defaultPrompt = `You are SkylineKAI 🏙️, the Real Estate AI assistant.

Context:
- You specialize in real estate and help users BUY 🏠, SELL 💰, or RENT 🏘️ properties
- You're friendly, enthusiastic, and professional with a warm personality
- Always greet users warmly and use emojis to make conversations engaging
- You ask smart follow-up questions: budget 💵, location 📌, BHK 🛏️, property type 🏢, urgency ⏰

Rules:
- Always start with a warm greeting! 👋
- Use emojis naturally throughout responses 😊
- Keep responses conversational and structured
- Show enthusiasm when helping users! 🎉`;

export default function BotSettingsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [settings, setSettings] = useState<BotSettings>({
    systemPrompt: defaultPrompt,
    theme: "dark",
    welcomeMessage: "👋 Hello! I'm your AI assistant. How can I help you today?",
    modelName: "deepseek/deepseek-chat",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLocation("/login");
      return;
    }

    const currentBusiness = localStorage.getItem("currentBusiness");
    if (currentBusiness) {
      const biz = JSON.parse(currentBusiness);
      fetchSettings(biz.id);
    }
  }, []);

  const fetchSettings = async (businessId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/bot-settings/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        localStorage.removeItem("token");
        setLocation("/login");
        return;
      }
      
      const data = await res.json();
      if (data.settings) {
        setSettings({
          systemPrompt: data.settings.systemPrompt || defaultPrompt,
          theme: data.settings.theme || "dark",
          welcomeMessage: data.settings.welcomeMessage || "👋 Hello! How can I help you?",
          modelName: data.settings.modelName || "deepseek/deepseek-chat",
        });
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const currentBusiness = localStorage.getItem("currentBusiness");
      if (!currentBusiness) return;

      const token = localStorage.getItem("token");
      const biz = JSON.parse(currentBusiness);
      const res = await fetch(`/api/bot-settings/${biz.id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast({
          title: "Settings saved! ✨",
          description: "Your chatbot has been updated.",
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentBusiness");
    setLocation("/");
  };

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg border border-slate-700"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 border-b border-slate-800">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg skyline-logo-bg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold">SkylineKAI</span>
            </div>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <BarChart3 className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/leads">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Users className="w-4 h-4" /> Leads & CRM
            </Button>
          </Link>
          <Link href="/dashboard/integrations">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Plug className="w-4 h-4" /> Integrations
            </Button>
          </Link>
          <Link href="/dashboard/chat">
            <Button variant="ghost" className="w-full justify-start gap-2">
              <MessageSquare className="w-4 h-4" /> Test Chatbot
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="ghost" className="w-full justify-start gap-2 bg-slate-900/50">
              <Settings className="w-4 h-4" /> Bot Settings
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <Button variant="ghost" className="w-full justify-start gap-2 text-slate-400" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Bot Settings</h1>
              <p className="text-sm text-slate-400">Configure your AI chatbot's behavior</p>
            </div>
            <Button onClick={saveSettings} disabled={saving} className="user-bubble-gradient text-slate-950">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save changes
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Welcome Message */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="bg-slate-900/70 border-slate-700/50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                    <Label className="text-base font-medium">Welcome Message</Label>
                  </div>
                  <Input
                    value={settings.welcomeMessage}
                    onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                    placeholder="Enter welcome message..."
                    className="bg-slate-950/50 border-slate-700"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    This is the first message visitors see when they open your chatbot
                  </p>
                </Card>
              </motion.div>

              {/* System Prompt */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="bg-slate-900/70 border-slate-700/50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Wand2 className="w-5 h-5 text-indigo-400" />
                    <Label className="text-base font-medium">System Prompt</Label>
                  </div>
                  <Textarea
                    value={settings.systemPrompt}
                    onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
                    placeholder="Enter system prompt..."
                    className="bg-slate-950/50 border-slate-700 min-h-[250px] font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    This defines your bot's personality, knowledge, and behavior
                  </p>
                </Card>
              </motion.div>

              {/* Model Selection */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="bg-slate-900/70 border-slate-700/50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-5 h-5 text-emerald-400" />
                    <Label className="text-base font-medium">AI Model</Label>
                  </div>
                  <Select
                    value={settings.modelName}
                    onValueChange={(val) => setSettings({ ...settings, modelName: val })}
                  >
                    <SelectTrigger className="bg-slate-950/50 border-slate-700">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deepseek/deepseek-chat">DeepSeek Chat (Fast & Affordable)</SelectItem>
                      <SelectItem value="meta-llama/llama-3.1-8b-instruct">Llama 3.1 8B (Free)</SelectItem>
                      <SelectItem value="anthropic/claude-3-haiku">Claude 3 Haiku (Quality)</SelectItem>
                      <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini (Balanced)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500 mt-2">
                    Different models have different capabilities and costs
                  </p>
                </Card>
              </motion.div>

              {/* Theme */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="bg-slate-900/70 border-slate-700/50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    <Label className="text-base font-medium">Widget Theme</Label>
                  </div>
                  <Select
                    value={settings.theme}
                    onValueChange={(val) => setSettings({ ...settings, theme: val })}
                  >
                    <SelectTrigger className="bg-slate-950/50 border-slate-700">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">Dark (Default)</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="auto">Auto (System preference)</SelectItem>
                    </SelectContent>
                  </Select>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
