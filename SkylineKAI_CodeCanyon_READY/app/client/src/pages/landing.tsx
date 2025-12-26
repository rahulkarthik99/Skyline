import { Link } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, MessageSquare, Users, BarChart3, Zap, Globe, Shield, ChevronRight, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl skyline-logo-bg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <p className="font-semibold text-sm sm:text-base">KarthikAI Automations</p>
              <p className="text-[11px] text-slate-400">SkylineKAI SaaS Platform</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="hover:text-cyan-400 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-cyan-400 transition-colors">Use Cases</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-cyan-400">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="user-bubble-gradient text-slate-950 font-medium">
                Start free demo
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-10 pb-16 sm:pt-16 sm:pb-20">
        <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-5"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Multi-tenant AI SaaS • WhatsApp • Instagram • Web
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight">
              Turn chats into deals with{" "}
              <span className="skyline-gradient-text">SkylineKAI</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl">
              Launch your own AI chatbot & automation platform for real estate and other businesses.
              Handle WhatsApp, Instagram, and website leads – all in one clean dashboard.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/signup">
                <Button className="user-bubble-gradient text-slate-950 font-semibold px-6">
                  View pricing & plans <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <a href="#demo" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-cyan-300 transition-colors">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-600">
                  ▶
                </span>
                Watch demo flow
              </a>
            </div>

            <div className="flex flex-wrap gap-6 pt-3 text-xs text-slate-400">
              <div>
                <p className="text-slate-200 font-semibold text-base">24/7</p>
                <p>AI lead capture & reply</p>
              </div>
              <div>
                <p className="text-slate-200 font-semibold text-base">3+ channels</p>
                <p>Web, WhatsApp, Instagram</p>
              </div>
              <div>
                <p className="text-slate-200 font-semibold text-base">Multi-tenant</p>
                <p>Serve many clients, one app</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full"
          >
            <Card className="bg-slate-900/90 border-slate-700/50 skyline-glow rounded-3xl p-4 sm:p-6 relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Live Demo</p>
                  <p className="text-sm font-semibold">SkylineKAI – Real Estate AI</p>
                </div>
                <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300 border border-slate-700">
                  Hyderabad · Real Estate
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-[11px] mb-4">
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/80 p-3">
                  <p className="text-slate-400 mb-1">Today</p>
                  <p className="text-lg font-semibold text-emerald-300">37</p>
                  <p className="text-slate-400 text-[10px]">New leads</p>
                </div>
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/80 p-3">
                  <p className="text-slate-400 mb-1">Response time</p>
                  <p className="text-lg font-semibold text-cyan-300">1.2s</p>
                  <p className="text-[10px] text-slate-400">Avg across channels</p>
                </div>
                <div className="rounded-xl bg-slate-900/60 border border-slate-700/80 p-3">
                  <p className="text-slate-400 mb-1">Bookings</p>
                  <p className="text-lg font-semibold text-indigo-300">12</p>
                  <p className="text-[10px] text-slate-400">Site visits</p>
                </div>
              </div>
              <div className="rounded-2xl bg-slate-950/80 border border-slate-700/80 p-3 space-y-2">
                <div className="text-[11px] text-slate-400 flex items-center justify-between mb-1">
                  <span>Recent conversations</span>
                  <span className="rounded-full bg-slate-800 px-2 py-0.5">WhatsApp + Web</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center text-[11px]">K</span>
                    <div>
                      <p className="text-slate-300">SkylineKAI · Bot</p>
                      <p className="text-slate-400">
                        I found 3BHK options under 90L in Gachibowli. Want to book a visit for Saturday?
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="text-right">
                      <p className="text-slate-300">User · Buyer</p>
                      <p className="text-slate-400">
                        Yes, 4–6 PM is perfect. Please confirm.
                      </p>
                    </div>
                    <span className="w-6 h-6 rounded-full bg-indigo-500/30 flex items-center justify-center text-[11px]">U</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-14 border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Everything you need to run an AI chatbot SaaS</h2>
              <p className="text-sm text-slate-300 max-w-xl">
                SkylineKAI is built as a multi-tenant platform. One codebase, many paying clients.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <Card className="bg-slate-900/70 border-slate-700/50 rounded-2xl p-5">
              <Users className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="font-semibold mb-2">Multi-tenant workspaces</h3>
              <p className="text-slate-300 mb-3">
                Each client gets their own business space, prompts, theme, and channels.
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Separate bots per business</li>
                <li>• Custom branding & welcome text</li>
                <li>• Industry-specific prompts</li>
              </ul>
            </Card>
            <Card className="bg-slate-900/70 border-slate-700/50 rounded-2xl p-5">
              <BarChart3 className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-semibold mb-2">Built-in CRM & lead pipeline</h3>
              <p className="text-slate-300 mb-3">
                Capture leads from web, WhatsApp, and Instagram chats directly into CRM.
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• Lead table per business</li>
                <li>• Filters for hot / warm / cold</li>
                <li>• Export to CSV or external CRM</li>
              </ul>
            </Card>
            <Card className="bg-slate-900/70 border-slate-700/50 rounded-2xl p-5">
              <Zap className="w-8 h-8 text-indigo-400 mb-3" />
              <h3 className="font-semibold mb-2">Automation-ready AI brain</h3>
              <p className="text-slate-300 mb-3">
                Connect to OpenRouter once, then let each client configure their own flows.
              </p>
              <ul className="text-xs text-slate-400 space-y-1">
                <li>• System prompts per client</li>
                <li>• Conversation memory</li>
                <li>• Reusable components for any niche</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Solutions */}
      <section id="solutions" className="py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Built for real estate. Flexible for any business.</h2>
            <p className="text-sm text-slate-300 max-w-2xl">
              Start with high-ticket real estate agencies. Then clone your setup for gyms, clinics, coaching, salons, and more.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-4 text-xs">
            <Card className="bg-slate-900/70 border-slate-700/50 rounded-2xl p-4">
              <p className="text-[11px] text-cyan-300 mb-1">Real Estate</p>
              <p className="font-semibold mb-1">Property lead assistant</p>
              <p className="text-slate-300">Qualify buyers, show matching listings, and book visits.</p>
            </Card>
            <Card className="bg-slate-900/70 border-slate-700/50 rounded-2xl p-4">
              <p className="text-[11px] text-emerald-300 mb-1">Coaches / Courses</p>
              <p className="font-semibold mb-1">Enrollment bot</p>
              <p className="text-slate-300">Answer FAQs and collect payments or demo calls.</p>
            </Card>
            <Card className="bg-slate-900/70 border-slate-700/50 rounded-2xl p-4">
              <p className="text-[11px] text-indigo-300 mb-1">Local Services</p>
              <p className="font-semibold mb-1">WhatsApp desk</p>
              <p className="text-slate-300">DM automation for salons, clinics, repair shops.</p>
            </Card>
            <Card className="bg-slate-900/70 border-slate-700/50 rounded-2xl p-4">
              <p className="text-[11px] text-orange-300 mb-1">Agencies</p>
              <p className="font-semibold mb-1">White-label SaaS</p>
              <p className="text-slate-300">Sell your own AI platform under their brand.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-14 border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Simple, transparent pricing</h2>
            <p className="text-sm text-slate-300">Start free, upgrade when you grow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="bg-slate-900/70 border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-1">Free</h3>
              <p className="text-3xl font-bold mb-4">₹0<span className="text-sm font-normal text-slate-400">/mo</span></p>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 100 AI messages/month</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 1 business workspace</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Web chat widget</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Basic CRM</li>
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full">Get started</Button>
              </Link>
            </Card>
            <Card className="bg-slate-900/70 border-cyan-500/50 rounded-2xl p-6 relative skyline-glow">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-slate-950 text-xs font-bold rounded-full">
                POPULAR
              </div>
              <h3 className="text-lg font-semibold mb-1">Pro</h3>
              <p className="text-3xl font-bold mb-4">₹2,999<span className="text-sm font-normal text-slate-400">/mo</span></p>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 5,000 AI messages/month</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 5 business workspaces</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> WhatsApp integration</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Advanced CRM + exports</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Custom bot prompts</li>
              </ul>
              <Link href="/signup">
                <Button className="w-full user-bubble-gradient text-slate-950">Upgrade to Pro</Button>
              </Link>
            </Card>
            <Card className="bg-slate-900/70 border-slate-700/50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-1">Enterprise</h3>
              <p className="text-3xl font-bold mb-4">Custom</p>
              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited messages</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Unlimited workspaces</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Instagram + WhatsApp</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> White-label branding</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Priority support</li>
              </ul>
              <Button variant="outline" className="w-full">Contact sales</Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-14">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-2">Frequently Asked Questions</h2>
          </div>
          <Accordion type="single" collapsible className="space-y-3">
            <AccordionItem value="item-1" className="bg-slate-900/70 border-slate-700/50 rounded-xl px-4">
              <AccordionTrigger className="text-left">What is SkylineKAI?</AccordionTrigger>
              <AccordionContent className="text-slate-300">
                SkylineKAI is a multi-tenant AI chatbot SaaS platform. You can onboard multiple businesses, each with their own AI assistant, CRM, and lead management – all from one dashboard.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="bg-slate-900/70 border-slate-700/50 rounded-xl px-4">
              <AccordionTrigger className="text-left">How does WhatsApp integration work?</AccordionTrigger>
              <AccordionContent className="text-slate-300">
                We provide webhook endpoints that work with Twilio or Meta Business API. When someone messages your WhatsApp number, SkylineKAI responds automatically with AI.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="bg-slate-900/70 border-slate-700/50 rounded-xl px-4">
              <AccordionTrigger className="text-left">Can I customize the AI for my industry?</AccordionTrigger>
              <AccordionContent className="text-slate-300">
                Yes! Each business workspace has its own system prompt, welcome message, and theme. You can configure the AI to speak in your brand voice and handle industry-specific queries.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4" className="bg-slate-900/70 border-slate-700/50 rounded-xl px-4">
              <AccordionTrigger className="text-left">How do I embed the chatbot on my website?</AccordionTrigger>
              <AccordionContent className="text-slate-300">
                Simply copy the embed script from your dashboard and paste it into your website's HTML. The chatbot widget will appear automatically.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800/80 bg-slate-950/80">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg skyline-logo-bg flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-slate-400">© 2024 KarthikAI Automations. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <a href="#" className="hover:text-cyan-400">Privacy</a>
            <a href="#" className="hover:text-cyan-400">Terms</a>
            <a href="#" className="hover:text-cyan-400">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
