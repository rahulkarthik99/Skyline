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
  Plus,
  Code,
  Copy,
  Check,
  ExternalLink,
  Menu,
  X,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Business {
  id: string;
  businessName: string;
  industry: string;
  plan: string;
  apiKey: string;
}

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  source: string;
  status: string;
  createdAt: string;
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLocation("/login");
      return;
    }

    fetchBusinesses();
  }, []);

  useEffect(() => {
    if (currentBusiness) {
      fetchLeads(currentBusiness.id);
    }
  }, [currentBusiness]);

  const fetchBusinesses = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/businesses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        localStorage.removeItem("token");
        setLocation("/login");
        return;
      }
      
      const data = await res.json();

      if (data.businesses?.length > 0) {
        setBusinesses(data.businesses);
        const saved = localStorage.getItem("currentBusiness");
        if (saved) {
          const savedBiz = JSON.parse(saved);
          const found = data.businesses.find((b: Business) => b.id === savedBiz.id);
          setCurrentBusiness(found || data.businesses[0]);
        } else {
          setCurrentBusiness(data.businesses[0]);
        }
      } else {
        setLocation("/onboarding");
      }
    } catch (error) {
      console.error("Failed to fetch businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async (businessId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/leads/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        localStorage.removeItem("token");
        setLocation("/login");
        return;
      }
      
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentBusiness");
    setLocation("/");
  };

  const copyEmbedCode = () => {
    if (!currentBusiness) return;
    const code = `<script src="${window.location.origin}/widget.js" data-api-key="${currentBusiness.apiKey}"></script>`;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied!",
      description: "Embed code copied to clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

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
            <Button variant="ghost" className="w-full justify-start gap-2 bg-slate-900/50">
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
            <Button variant="ghost" className="w-full justify-start gap-2">
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
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold">{currentBusiness?.businessName}</h1>
              <p className="text-sm text-slate-400">
                {currentBusiness?.industry} • {currentBusiness?.plan} plan
              </p>
            </div>
            <Link href="/onboarding">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add business
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-900/70 border-slate-700/50 p-5">
                <p className="text-sm text-slate-400 mb-1">Total Leads</p>
                <p className="text-3xl font-bold text-emerald-400">{leads.length}</p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="bg-slate-900/70 border-slate-700/50 p-5">
                <p className="text-sm text-slate-400 mb-1">New Today</p>
                <p className="text-3xl font-bold text-cyan-400">
                  {leads.filter((l) => {
                    const today = new Date().toDateString();
                    return new Date(l.createdAt).toDateString() === today;
                  }).length}
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900/70 border-slate-700/50 p-5">
                <p className="text-sm text-slate-400 mb-1">Hot Leads</p>
                <p className="text-3xl font-bold text-orange-400">
                  {leads.filter((l) => l.status === "hot").length}
                </p>
              </Card>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="bg-slate-900/70 border-slate-700/50 p-5">
                <p className="text-sm text-slate-400 mb-1">Converted</p>
                <p className="text-3xl font-bold text-indigo-400">
                  {leads.filter((l) => l.status === "converted").length}
                </p>
              </Card>
            </motion.div>
          </div>

          {/* Embed Code Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-slate-900/70 border-slate-700/50 p-5 mb-8">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-semibold">Embed Widget</h3>
                </div>
                <Button variant="outline" size="sm" onClick={copyEmbedCode}>
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied!" : "Copy code"}
                </Button>
              </div>
              <p className="text-sm text-slate-400 mb-3">
                Add this code to your website to display the SkylineKAI chatbot:
              </p>
              <pre className="bg-slate-950 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto">
                {`<script src="${window.location.origin}/widget.js" data-api-key="${currentBusiness?.apiKey || "YOUR_API_KEY"}"></script>`}
              </pre>
            </Card>
          </motion.div>

          {/* Recent Leads */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <Card className="bg-slate-900/70 border-slate-700/50 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Leads</h3>
                <Link href="/dashboard/leads">
                  <Button variant="ghost" size="sm">
                    View all <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>

              {leads.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No leads yet</p>
                  <p className="text-sm">Leads will appear here when visitors interact with your chatbot</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leads.slice(0, 5).map((lead) => (
                    <div
                      key={lead.id}
                      className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-slate-400">{lead.email || lead.phone || "No contact"}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-medium uppercase ${
                            lead.status === "hot"
                              ? "bg-orange-500/20 text-orange-300"
                              : lead.status === "converted"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-slate-700/50 text-slate-300"
                          }`}
                        >
                          {lead.status}
                        </span>
                        <span className="text-xs text-slate-500">{lead.source}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
