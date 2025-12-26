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
  Menu,
  X,
  Plug,
  MessageCircle,
  Instagram,
  Twitter,
  ShoppingBag,
  Globe,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Integration {
  id: string;
  businessId: string;
  channel: string;
  status: string;
  webhookUrl: string | null;
  lastSyncedAt: string | null;
}

interface ChannelConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  fields: { key: string; label: string; placeholder: string; type?: string }[];
  docsUrl: string;
}

const CHANNELS: ChannelConfig[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Connect via Twilio to receive and respond to WhatsApp messages",
    icon: <MessageCircle className="w-6 h-6" />,
    color: "bg-green-500",
    fields: [
      { key: "accountSid", label: "Account SID", placeholder: "ACxxxxxxxxxxxxxxxxx" },
      { key: "authToken", label: "Auth Token", placeholder: "Your Twilio Auth Token", type: "password" },
      { key: "phoneNumber", label: "WhatsApp Number", placeholder: "+1234567890" },
    ],
    docsUrl: "https://www.twilio.com/docs/whatsapp",
  },
  {
    id: "instagram",
    name: "Instagram DM",
    description: "Respond to Instagram Direct Messages automatically",
    icon: <Instagram className="w-6 h-6" />,
    color: "bg-gradient-to-br from-purple-500 to-pink-500",
    fields: [
      { key: "accessToken", label: "Page Access Token", placeholder: "EAAxxxxxxx", type: "password" },
      { key: "pageId", label: "Instagram Page ID", placeholder: "123456789" },
      { key: "verifyToken", label: "Verify Token", placeholder: "Your custom verify token" },
    ],
    docsUrl: "https://developers.facebook.com/docs/instagram-api",
  },
  {
    id: "messenger",
    name: "Facebook Messenger",
    description: "Connect to Facebook Messenger for automated responses",
    icon: <MessageSquare className="w-6 h-6" />,
    color: "bg-blue-500",
    fields: [
      { key: "accessToken", label: "Page Access Token", placeholder: "EAAxxxxxxx", type: "password" },
      { key: "pageId", label: "Facebook Page ID", placeholder: "123456789" },
      { key: "verifyToken", label: "Verify Token", placeholder: "Your custom verify token" },
    ],
    docsUrl: "https://developers.facebook.com/docs/messenger-platform",
  },
  {
    id: "twitter",
    name: "Twitter / X DM",
    description: "Respond to Twitter Direct Messages with AI",
    icon: <Twitter className="w-6 h-6" />,
    color: "bg-slate-800",
    fields: [
      { key: "apiKey", label: "API Key", placeholder: "Your Twitter API Key" },
      { key: "apiSecret", label: "API Secret", placeholder: "Your API Secret", type: "password" },
      { key: "accessToken", label: "Access Token", placeholder: "Your Access Token" },
      { key: "accessSecret", label: "Access Secret", placeholder: "Your Access Secret", type: "password" },
    ],
    docsUrl: "https://developer.twitter.com/en/docs/twitter-api",
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Capture leads from Shopify orders and customer events",
    icon: <ShoppingBag className="w-6 h-6" />,
    color: "bg-green-600",
    fields: [
      { key: "shopDomain", label: "Shop Domain", placeholder: "your-store.myshopify.com" },
      { key: "accessToken", label: "Admin API Access Token", placeholder: "shpat_xxxxx", type: "password" },
    ],
    docsUrl: "https://shopify.dev/docs/apps/webhooks",
  },
  {
    id: "web_widget",
    name: "Website Widget",
    description: "Embed a chat widget on your website using your API key",
    icon: <Globe className="w-6 h-6" />,
    color: "bg-cyan-500",
    fields: [],
    docsUrl: "",
  },
];

export default function Integrations() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChannelConfig | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [currentBusiness, setCurrentBusiness] = useState<any>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLocation("/login");
      return;
    }

    const biz = localStorage.getItem("currentBusiness");
    if (biz) {
      const parsed = JSON.parse(biz);
      setCurrentBusiness(parsed);
      fetchIntegrations(parsed.id);
    } else {
      setLocation("/dashboard");
    }
  }, []);

  const fetchIntegrations = async (businessId: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/integrations/${businessId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.status === 401) {
        localStorage.removeItem("token");
        setLocation("/login");
        return;
      }
      
      const data = await res.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (channel: ChannelConfig) => {
    if (!currentBusiness) return;
    
    setSaving(channel.id);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/integrations/${currentBusiness.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel: channel.id,
          credentials,
          webhookSecret: credentials.verifyToken || credentials.accessSecret || null,
        }),
      });

      if (res.ok) {
        toast({
          title: "Connected! ✨",
          description: `${channel.name} has been connected successfully.`,
        });
        fetchIntegrations(currentBusiness.id);
        setSelectedChannel(null);
        setCredentials({});
      } else {
        const data = await res.json();
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const handleDisconnect = async (channel: string) => {
    if (!currentBusiness) return;
    
    setSaving(channel);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/integrations/${currentBusiness.id}/${channel}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast({
          title: "Disconnected",
          description: "Integration has been removed.",
        });
        fetchIntegrations(currentBusiness.id);
      }
    } catch (error: any) {
      toast({
        title: "Failed to disconnect",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(null);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const getIntegrationStatus = (channelId: string) => {
    return integrations.find((i) => i.channel === channelId);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("currentBusiness");
    setLocation("/");
  };

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen flex">
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg border border-slate-700"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        data-testid="button-toggle-sidebar"
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
            <Button variant="ghost" className="w-full justify-start gap-2" data-testid="link-dashboard">
              <BarChart3 className="w-4 h-4" /> Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/leads">
            <Button variant="ghost" className="w-full justify-start gap-2" data-testid="link-leads">
              <Users className="w-4 h-4" /> Leads & CRM
            </Button>
          </Link>
          <Link href="/dashboard/integrations">
            <Button variant="ghost" className="w-full justify-start gap-2 bg-slate-900/50" data-testid="link-integrations">
              <Plug className="w-4 h-4" /> Integrations
            </Button>
          </Link>
          <Link href="/dashboard/chat">
            <Button variant="ghost" className="w-full justify-start gap-2" data-testid="link-chat">
              <MessageSquare className="w-4 h-4" /> Test Chatbot
            </Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="ghost" className="w-full justify-start gap-2" data-testid="link-settings">
              <Settings className="w-4 h-4" /> Bot Settings
            </Button>
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-slate-400"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-8 ml-0 md:ml-0">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 ml-12 md:ml-0">
            <h1 className="text-2xl font-bold mb-2">Integrations</h1>
            <p className="text-slate-400">
              Connect your messaging platforms to respond automatically with AI
            </p>
          </div>

          {/* API Key Card */}
          {currentBusiness && (
            <Card className="mb-8 bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-cyan-400" />
                  Your API Credentials
                </CardTitle>
                <CardDescription>
                  Use these credentials to integrate with any platform or build custom solutions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-slate-400">Business ID</Label>
                    <div className="flex mt-1">
                      <Input
                        readOnly
                        value={currentBusiness.id}
                        className="bg-slate-800 border-slate-700 font-mono text-sm"
                        data-testid="input-business-id"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={() => copyToClipboard(currentBusiness.id, "Business ID")}
                        data-testid="button-copy-business-id"
                      >
                        {copied === "Business ID" ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-400">API Key</Label>
                    <div className="flex mt-1">
                      <Input
                        readOnly
                        value={currentBusiness.apiKey}
                        className="bg-slate-800 border-slate-700 font-mono text-sm"
                        data-testid="input-api-key"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={() => copyToClipboard(currentBusiness.apiKey, "API Key")}
                        data-testid="button-copy-api-key"
                      >
                        {copied === "API Key" ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-slate-400">Widget Chat Endpoint</Label>
                  <div className="flex mt-1">
                    <Input
                      readOnly
                      value={`${baseUrl}/api/widget/chat`}
                      className="bg-slate-800 border-slate-700 font-mono text-sm"
                      data-testid="input-widget-endpoint"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="ml-2"
                      onClick={() => copyToClipboard(`${baseUrl}/api/widget/chat`, "Endpoint")}
                      data-testid="button-copy-endpoint"
                    >
                      {copied === "Endpoint" ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Channels Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {CHANNELS.map((channel) => {
                const integration = getIntegrationStatus(channel.id);
                const isConnected = integration?.status === "connected";

                return (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className={`w-12 h-12 rounded-xl ${channel.color} flex items-center justify-center text-white`}>
                            {channel.icon}
                          </div>
                          {isConnected ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              Connected
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-400">
                              Not Connected
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg mt-4">{channel.name}</CardTitle>
                        <CardDescription>{channel.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {isConnected && integration.webhookUrl && (
                          <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                            <Label className="text-xs text-slate-400">Webhook URL</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="text-xs text-cyan-400 truncate flex-1">
                                {integration.webhookUrl}
                              </code>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(integration.webhookUrl!, "Webhook URL")}
                                data-testid={`button-copy-webhook-${channel.id}`}
                              >
                                {copied === "Webhook URL" ? (
                                  <Check className="w-3 h-3 text-green-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2">
                          {channel.id === "web_widget" ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button className="flex-1" data-testid={`button-view-widget-${channel.id}`}>
                                  View Widget Code
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Embed Widget on Your Website</DialogTitle>
                                  <DialogDescription>
                                    Copy this code and paste it before the closing &lt;/body&gt; tag
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
                                  <pre className="text-sm text-cyan-400 whitespace-pre-wrap">
{`<!-- SkylineKAI Chat Widget -->
<script>
  (function(w, d, s, o, f, js, fjs) {
    w['SkylineKAI'] = o;
    w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = 'skylinekai-widget';
    js.src = '${baseUrl}/widget.js';
    js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'skylinekai'));
  skylinekai({
    apiKey: '${currentBusiness?.apiKey || "YOUR_API_KEY"}',
    serverUrl: '${baseUrl}',
    theme: 'dark',
    position: 'bottom-right'
  });
</script>`}
                                  </pre>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={() => {
                                      const code = `<!-- SkylineKAI Chat Widget -->
<script>
  (function(w, d, s, o, f, js, fjs) {
    w['SkylineKAI'] = o;
    w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments) };
    js = d.createElement(s), fjs = d.getElementsByTagName(s)[0];
    js.id = 'skylinekai-widget';
    js.src = '${baseUrl}/widget.js';
    js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'skylinekai'));
  skylinekai({
    apiKey: '${currentBusiness?.apiKey || "YOUR_API_KEY"}',
    serverUrl: '${baseUrl}',
    theme: 'dark',
    position: 'bottom-right'
  });
</script>`;
                                      copyToClipboard(code, "Widget Code");
                                    }}
                                    data-testid="button-copy-widget-code"
                                  >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Code
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          ) : isConnected ? (
                            <Button
                              variant="outline"
                              className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                              onClick={() => handleDisconnect(channel.id)}
                              disabled={saving === channel.id}
                              data-testid={`button-disconnect-${channel.id}`}
                            >
                              {saving === channel.id ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : null}
                              Disconnect
                            </Button>
                          ) : (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  className="flex-1"
                                  onClick={() => {
                                    setSelectedChannel(channel);
                                    setCredentials({});
                                  }}
                                  data-testid={`button-connect-${channel.id}`}
                                >
                                  Connect
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg ${channel.color} flex items-center justify-center text-white`}>
                                      {channel.icon}
                                    </div>
                                    Connect {channel.name}
                                  </DialogTitle>
                                  <DialogDescription>
                                    Enter your credentials to connect this integration
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  {channel.fields.map((field) => (
                                    <div key={field.key}>
                                      <Label>{field.label}</Label>
                                      <Input
                                        type={field.type || "text"}
                                        placeholder={field.placeholder}
                                        value={credentials[field.key] || ""}
                                        onChange={(e) =>
                                          setCredentials((prev) => ({
                                            ...prev,
                                            [field.key]: e.target.value,
                                          }))
                                        }
                                        className="mt-1 bg-slate-800 border-slate-700"
                                        data-testid={`input-${field.key}`}
                                      />
                                    </div>
                                  ))}
                                  
                                  <div className="p-3 bg-slate-800/50 rounded-lg">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="w-4 h-4 text-cyan-400 mt-0.5" />
                                      <div className="text-sm text-slate-400">
                                        <p className="font-medium text-slate-300">Webhook URL</p>
                                        <p className="mt-1">
                                          After connecting, use this URL in your {channel.name} settings:
                                        </p>
                                        <code className="text-xs text-cyan-400 block mt-2 break-all">
                                          {baseUrl}/api/webhooks/{channel.id}/{currentBusiness?.id}
                                        </code>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  {channel.docsUrl && (
                                    <Button variant="outline" asChild>
                                      <a href={channel.docsUrl} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="w-4 h-4 mr-2" />
                                        View Docs
                                      </a>
                                    </Button>
                                  )}
                                  <Button
                                    onClick={() => handleConnect(channel)}
                                    disabled={saving === channel.id}
                                    data-testid={`button-save-${channel.id}`}
                                  >
                                    {saving === channel.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    Connect
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
