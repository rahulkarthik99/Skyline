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
  Search,
  Filter,
  Download,
  Mail,
  Phone,
  Calendar,
  Menu,
  X,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

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

export default function Leads() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
      fetchLeads(biz.id);
    }
  }, []);

  useEffect(() => {
    let result = leads;

    if (search) {
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(search.toLowerCase()) ||
          l.email?.toLowerCase().includes(search.toLowerCase()) ||
          l.phone?.includes(search)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((l) => l.status === statusFilter);
    }

    setFilteredLeads(result);
  }, [leads, search, statusFilter]);

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
      setFilteredLeads(data.leads || []);
    } catch (error) {
      console.error("Failed to fetch leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status } : l))
        );
        toast({
          title: "Status updated",
          description: `Lead marked as ${status}`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentBusiness");
    setLocation("/");
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "Source", "Status", "Message", "Date"];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.email || "",
      l.phone || "",
      l.source,
      l.status,
      l.message || "",
      new Date(l.createdAt).toLocaleDateString(),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();

    toast({
      title: "Export complete",
      description: `${filteredLeads.length} leads exported to CSV`,
    });
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
            <Button variant="ghost" className="w-full justify-start gap-2 bg-slate-900/50">
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Leads & CRM</h1>
              <p className="text-sm text-slate-400">
                {filteredLeads.length} leads total
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900/50 border-slate-700"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-slate-900/50 border-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="warm">Warm</SelectItem>
                <SelectItem value="cold">Cold</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Leads table */}
          <Card className="bg-slate-900/70 border-slate-700/50 overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No leads found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-950/50 border-b border-slate-800">
                    <tr className="text-left text-xs text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Name</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Source</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Date</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {filteredLeads.map((lead) => (
                      <motion.tr
                        key={lead.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            {lead.message && (
                              <p className="text-xs text-slate-400 truncate max-w-xs">{lead.message}</p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-1">
                            {lead.email && (
                              <div className="flex items-center gap-1 text-sm text-slate-300">
                                <Mail className="w-3 h-3" /> {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="flex items-center gap-1 text-sm text-slate-300">
                                <Phone className="w-3 h-3" /> {lead.phone}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 rounded bg-slate-800 text-xs">{lead.source}</span>
                        </td>
                        <td className="p-4">
                          <Select
                            value={lead.status}
                            onValueChange={(val) => updateLeadStatus(lead.id, val)}
                          >
                            <SelectTrigger className="w-28 h-8 text-xs bg-transparent border-slate-700">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="hot">Hot</SelectItem>
                              <SelectItem value="warm">Warm</SelectItem>
                              <SelectItem value="cold">Cold</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(lead.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4">
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
