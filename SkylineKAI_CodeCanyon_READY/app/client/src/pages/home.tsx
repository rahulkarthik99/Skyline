import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content: "👋 Hello! I'm SkylineKAI, your real estate assistant for Hyderabad. How can I help you today? 🏠\n\n(Try asking for a 3BHK in Gachibowli! 😊)",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Call the real backend API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response from server");
      }

      const data = await response.json();
      const botMsg: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.reply,
      };
      
      setMessages((prev) => [...prev, botMsg]);
    } catch (error: any) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive",
      });
      
      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, I'm having trouble connecting right now. 😅 Please try again in a moment!",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        <Card className="w-full bg-card/95 backdrop-blur-md border border-sky-500/30 skyline-glow rounded-3xl overflow-hidden flex flex-col h-[85vh] max-h-[800px] relative">
          {/* Header */}
          <div className="p-4 border-b border-sky-900/50 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full skyline-logo-bg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-white drop-shadow-md" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2" data-testid="title-skylinekai">
                  SkylineKAI
                </h1>
                <span className="text-xs text-slate-400 font-medium">Real Estate AI • Hyderabad</span>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full border border-sky-500/30 bg-sky-950/30 text-[10px] font-bold uppercase tracking-wider text-sky-300">
              Live AI
            </div>
          </div>

          {/* Chat Area */}
          <ScrollArea className="flex-1 p-4 relative bg-gradient-to-b from-sky-950/10 to-transparent">
            <div className="flex flex-col gap-4 pb-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex w-full ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                    data-testid={`message-${msg.role}-${msg.id}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm md:text-base leading-relaxed shadow-md ${
                        msg.role === "user"
                          ? "user-bubble-gradient text-slate-950 font-medium rounded-br-sm"
                          : "bg-slate-900/90 border border-sky-500/30 text-slate-100 rounded-bl-sm"
                      }`}
                    >
                      {msg.content.split("\n").map((line, i) => (
                         <p key={i} className={`min-h-[1rem] ${line.startsWith("•") || line.startsWith("🏢") ? "pl-2" : ""}`}>
                            {line.split(/(\*\*.*?\*\*)/).map((part, j) => 
                                part.startsWith("**") && part.endsWith("**") 
                                ? <strong key={j} className="text-sky-300 font-bold">{part.slice(2, -2)}</strong> 
                                : part
                            )}
                         </p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isTyping && (
                 <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                    data-testid="typing-indicator"
                  >
                    <div className="bg-slate-900/90 border border-sky-500/30 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center h-10">
                      <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce"></span>
                    </div>
                  </motion.div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 bg-slate-950/80 backdrop-blur-sm border-t border-sky-900/50">
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about 3BHK in Gachibowli..."
                className="bg-slate-900/50 border-slate-700 text-slate-100 placeholder:text-slate-500 focus-visible:ring-sky-500/50 focus-visible:border-sky-500 rounded-full pl-5 h-12 shadow-inner"
                autoComplete="off"
                data-testid="input-message"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isTyping}
                className="rounded-full h-12 w-12 shrink-0 user-bubble-gradient border-none text-slate-950 hover:opacity-90 transition-opacity shadow-lg shadow-sky-500/20"
                data-testid="button-send"
              >
                <Send className="w-5 h-5" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
            <p className="text-center text-[10px] text-slate-600 mt-2.5 font-medium">
              SkylineKAI can make mistakes. Verify real estate details independently.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
