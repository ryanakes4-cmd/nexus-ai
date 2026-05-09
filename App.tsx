/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { 
  Terminal, 
  Cpu, 
  Zap, 
  Layers, 
  Settings, 
  Command,
  ChevronRight,
  Activity,
  Box,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { processCommand } from "./services/aiService";
import ReactMarkdown from "react-markdown";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  role: "user" | "nexus";
  content: string;
  timestamp: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "nexus",
      content: "System Initialized. Nexus AI Command Center online. Neural protocols established. How can I assist your operations today?",
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModule, setActiveModule] = useState("terminal");
  const [aiProvider, setAiProvider] = useState<"gemini" | "minimax">(() => localStorage.getItem("nexus_ai_provider") as any || "gemini");
  const [geminiApiKey, setGeminiApiKey] = useState(() => localStorage.getItem("nexus_gemini_key") || localStorage.getItem("nexus_api_key") || "");
  const [minimaxApiKey, setMinimaxApiKey] = useState(() => localStorage.getItem("nexus_minimax_key") || "");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("nexus_ai_provider", aiProvider);
    localStorage.setItem("nexus_gemini_key", geminiApiKey);
    localStorage.setItem("nexus_minimax_key", minimaxApiKey);
  }, [aiProvider, geminiApiKey, minimaxApiKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);

    try {
      const response = await processCommand(input, {
        provider: aiProvider,
        apiKey: aiProvider === "gemini" ? geminiApiKey : minimaxApiKey,
        model: aiProvider === "minimax" ? "minimax-m2.7" : "gemini-2.0-flash"
      });
      const nexusMessage: Message = {
        role: "nexus",
        content: response,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages(prev => [...prev, nexusMessage]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const modules = [
    { id: "terminal", icon: Terminal, label: "Command Center" },
    { id: "logic", icon: Cpu, label: "Core Logic" },
    { id: "creativity", icon: Sparkles, label: "Creativity Lab" },
    { id: "insights", icon: Layers, label: "Data Insights" },
    { id: "workflows", icon: Box, label: "Automation" },
  ];

  return (
    <div className="flex h-screen bg-nexus-bg text-slate-200 font-sans overflow-hidden flex-col">
      {/* Top Navigation Bar */}
      <nav className="h-16 border-b border-nexus-border bg-nexus-surface/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-nexus-accent flex items-center justify-center shadow-lg shadow-nexus-accent/20">
            <Command className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white uppercase">Nexus<span className="text-nexus-accent">AI</span></span>
          <span className="ml-4 px-2 py-0.5 rounded text-[10px] font-mono bg-nexus-border text-nexus-muted border border-white/5">v4.0.1-STABLE</span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-nexus-success shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
            <span className="text-[10px] font-bold text-nexus-muted tracking-widest">SYSTEM ONLINE</span>
          </div>
          <div className="h-8 w-[1px] bg-nexus-border"></div>
          <div className="text-right leading-none hidden md:block">
            <div className="text-[10px] text-nexus-muted uppercase tracking-widest">Latency</div>
            <div className="text-sm font-mono text-nexus-accent font-bold tracking-tighter">18ms</div>
          </div>
          <button className="px-4 py-2 bg-nexus-accent hover:bg-nexus-accent-hover text-white rounded-md text-xs font-bold shadow-lg shadow-nexus-accent/20 transition-all uppercase tracking-wider">
            NEW DEPLOYMENT
          </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-nexus-border flex flex-col bg-nexus-surface/30 backdrop-blur-md">
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
            <div className="text-[10px] uppercase tracking-widest text-nexus-muted font-bold mb-4 px-3">Main Fleet</div>
            {modules.map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 group",
                  activeModule === m.id 
                    ? "bg-nexus-accent/10 text-white border border-nexus-accent/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" 
                    : "text-nexus-muted hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <m.icon className={cn("w-4 h-4 transition-colors", activeModule === m.id ? "text-nexus-accent" : "text-nexus-muted group-hover:text-white")} />
                <span className="font-semibold text-[13px]">{m.label}</span>
                {activeModule === m.id && (
                  <motion.div layoutId="active-indicator" className="ml-auto w-1 h-1 rounded-full bg-nexus-accent shadow-[0_0_8px_#6366f1]" />
                )}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-nexus-border space-y-4">
            <div className="bg-nexus-bg/50 p-3 rounded-lg border border-nexus-border">
               <div className="text-[10px] text-nexus-muted mb-2 uppercase font-bold tracking-widest">Active Fleet</div>
               <div className="space-y-2">
                 <div className="flex items-center justify-between text-xs">
                    <span className="text-white font-medium">Orion-Alpha</span>
                    <span className="text-[9px] text-nexus-success uppercase font-bold">Running</span>
                 </div>
                 <div className="w-full bg-nexus-border h-1 rounded-full overflow-hidden">
                   <div className="bg-nexus-accent h-full w-2/3"></div>
                 </div>
               </div>
            </div>
            <button 
              onClick={() => setActiveModule("settings")}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors font-medium rounded-lg",
                activeModule === "settings" ? "bg-nexus-accent/10 text-white" : "text-nexus-muted hover:text-white"
              )}
            >
              <Settings className="w-4 h-4" />
              <span>Configuration</span>
            </button>
          </div>
        </aside>

        {/* Console / Workspace Area */}
        <main className="flex-1 relative flex flex-col overflow-hidden p-6 gap-6 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_70%)]">
          {activeModule === "terminal" ? (
            <div className="flex-1 flex flex-col w-full border border-nexus-border bg-slate-950/40 rounded-xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-sm">
              <div className="h-10 border-b border-nexus-border bg-nexus-surface/80 flex items-center px-4 justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-6 h-6 rounded-full bg-nexus-border flex items-center justify-center border border-white/5">
                      <Terminal className="w-3 h-3 text-nexus-accent" />
                   </div>
                   <div className="text-[10px] font-mono text-nexus-muted uppercase tracking-widest">Execution Stream • Phase 02</div>
                </div>
                <div className="flex gap-2">
                  <div className="px-2 py-0.5 rounded bg-nexus-accent/10 border border-nexus-accent/20 text-[9px] text-nexus-accent font-bold">PROD</div>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth"
              >
                <AnimatePresence initial={false}>
                  {messages.map((m, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-4",
                        m.role === "user" ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full shrink-0 flex items-center justify-center border",
                        m.role === "user" 
                          ? "bg-nexus-accent border-nexus-accent shadow-lg shadow-nexus-accent/20" 
                          : "bg-nexus-surface border-nexus-border"
                      )}>
                        {m.role === "user" ? <span className="text-white text-xs font-bold">USER</span> : <Cpu className="w-5 h-5 text-nexus-accent" />}
                      </div>

                      <div className={cn(
                        "flex flex-col gap-1.5 max-w-[70%]",
                        m.role === "user" ? "items-end" : "items-start"
                      )}>
                        <div className="flex items-center gap-3 mb-1">
                           <span className={cn(
                             "text-[10px] font-bold uppercase tracking-widest",
                             m.role === "nexus" ? "text-nexus-accent" : "text-nexus-muted"
                           )}>
                             {m.role === "nexus" ? "REASON:" : "INPUT:"}
                           </span>
                           <span className="text-slate-600 font-mono text-[9px]">{m.timestamp}</span>
                        </div>
                        <div className={cn(
                          "px-5 py-4 rounded-2xl text-sm leading-relaxed",
                          m.role === "user" 
                            ? "bg-nexus-surface border border-nexus-accent/30 text-white shadow-[0_4px_20px_rgba(99,102,241,0.1)]" 
                            : "bg-nexus-surface/50 border border-nexus-border text-slate-300"
                        )}>
                          {m.role === "nexus" ? (
                            <div className="prose prose-invert prose-p:leading-relaxed prose-sm max-w-none">
                              <ReactMarkdown>{m.content}</ReactMarkdown>
                            </div>
                          ) : (
                            m.content
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isProcessing && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-4 items-start"
                    >
                      <div className="w-10 h-10 rounded-full bg-nexus-surface border border-nexus-border flex items-center justify-center animate-pulse">
                         <div className="w-2 h-2 rounded-full bg-nexus-accent" />
                      </div>
                      <div className="mt-3">
                         <span className="text-nexus-accent animate-pulse text-[10px] font-mono tracking-widest">_ PROCESSING BATCH...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-nexus-border bg-nexus-surface/30 px-8">
                <form onSubmit={handleSubmit} className="relative group max-w-3xl mx-auto">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Inject instruction or query agent..."
                    className="w-full bg-slate-950 border border-nexus-border focus:border-nexus-accent focus:ring-4 focus:ring-nexus-accent/5 rounded-xl py-4 px-6 text-sm outline-none transition-all placeholder:text-nexus-muted/50 text-white"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                    <kbd className="px-2 py-1 bg-nexus-border rounded text-[10px] text-nexus-muted font-mono hidden sm:block">CMD + K</kbd>
                    <button 
                      type="submit"
                      disabled={!input.trim() || isProcessing}
                      className="w-10 h-10 rounded-lg bg-nexus-accent hover:bg-nexus-accent-hover flex items-center justify-center text-white transition-all disabled:opacity-50 disabled:grayscale group-hover:scale-105 active:scale-95"
                    >
                      <Zap className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : activeModule === "settings" ? (
            <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full gap-8 animate-in fade-in duration-500 pt-10">
               <div className="space-y-2">
                 <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">System Configuration</h2>
                 <p className="text-nexus-muted text-sm leading-relaxed">
                   Manage your neural link parameters and security credentials for local operations.
                 </p>
               </div>

               <div className="bg-nexus-surface border border-nexus-border rounded-xl p-6 space-y-8 shadow-2xl">
                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-nexus-muted uppercase tracking-widest block">AI Provider</label>
                    <div className="flex gap-2 p-1 bg-slate-950 border border-nexus-border rounded-lg">
                       {(["gemini", "minimax"] as const).map((p) => (
                         <button
                           key={p}
                           onClick={() => setAiProvider(p)}
                           className={cn(
                             "flex-1 py-2 text-[11px] font-bold uppercase tracking-wider rounded transition-all",
                             aiProvider === p ? "bg-nexus-accent text-white shadow-lg shadow-nexus-accent/20" : "text-nexus-muted hover:text-white"
                           )}
                         >
                           {p}
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] font-bold text-nexus-muted uppercase tracking-widest block flex justify-between">
                      <span>{aiProvider === "gemini" ? "Gemini" : "MiniMax"} API Key</span>
                      <a 
                        href={aiProvider === "gemini" ? "https://aistudio.google.com/app/apikey" : "https://platform.minimaxi.com/"} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-nexus-accent hover:underline lowercase bg-nexus-accent/5 px-2 rounded tracking-normal"
                      >
                        {aiProvider === "gemini" ? "Get free key" : "Get MiniMax key"}
                      </a>
                    </label>
                    <div className="relative">
                       <input 
                         type="password"
                         value={aiProvider === "gemini" ? geminiApiKey : minimaxApiKey}
                         onChange={(e) => aiProvider === "gemini" ? setGeminiApiKey(e.target.value) : setMinimaxApiKey(e.target.value)}
                         placeholder={aiProvider === "gemini" && process.env.GEMINI_API_KEY ? "Using Env Key..." : `Enter ${aiProvider} API Key...`}
                         className="w-full bg-slate-950 border border-nexus-border focus:border-nexus-accent rounded-lg py-3 px-4 text-sm text-white placeholder:text-nexus-muted/30 outline-none transition-all"
                       />
                       <Zap className={cn("absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4", 
                         (aiProvider === "gemini" ? geminiApiKey : minimaxApiKey) ? "text-nexus-accent fill-nexus-accent" : "text-nexus-muted")} 
                       />
                    </div>
                    <p className="text-[10px] text-nexus-muted leading-relaxed">
                      This key is stored in your local storage. 
                      {aiProvider === "minimax" ? " MiniMax M2.7 will be used for high-performance reasoning." : " Gemini will provide multi-modal intelligence."}
                    </p>
                 </div>

                 <div className="pt-6 border-t border-nexus-border flex items-center justify-between">
                    <div>
                       <div className="text-xs font-bold text-white mb-1 uppercase tracking-tight">Persist Connections</div>
                       <div className="text-[10px] text-nexus-muted">Maintain active terminal history across sessions.</div>
                    </div>
                    <div className="w-10 h-5 bg-nexus-accent/20 rounded-full relative cursor-pointer border border-nexus-accent/30">
                       <div className="absolute right-1 top-1 w-3 h-3 bg-nexus-accent rounded-full shadow-[0_0_8px_#6366f1]" />
                    </div>
                 </div>

                 <div className="pt-6 border-t border-nexus-border space-y-4">
                    <div className="flex items-center gap-2 text-nexus-success text-[10px] font-bold uppercase tracking-widest">
                       <Zap className="w-3 h-3 fill-current" />
                       Sovereignty Audit
                    </div>
                    <p className="text-[10px] text-nexus-muted leading-relaxed">
                       Nexus operates on a <strong>Direct-to-API</strong> architecture. Keys are stored strictly in client-side <code>localStorage</code>. No telemetry, third-party analytics, or background tracking scripts are active.
                    </p>
                    <button 
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                      <Activity className="w-3 h-3" />
                      Wipe All Local Data
                    </button>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-nexus-surface border border-nexus-border rounded-xl p-5 space-y-2">
                    <p className="text-[10px] font-bold text-nexus-muted uppercase tracking-widest">Environment</p>
                    <p className="text-sm font-mono text-white">{process.env.NODE_ENV === 'production' ? 'PROD:STABLE' : 'DEV:REMOTE'}</p>
                 </div>
                 <div className="bg-nexus-surface border border-nexus-border rounded-xl p-5 space-y-2">
                    <p className="text-[10px] font-bold text-nexus-muted uppercase tracking-widest">Client Storage</p>
                    <p className="text-sm font-mono text-white">42.8 KB</p>
                 </div>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col gap-6 text-center animate-in fade-in zoom-in duration-700">
               <div className="relative">
                  <div className="absolute -inset-4 bg-nexus-accent/10 rounded-full blur-2xl animate-pulse" />
                  <div className="w-20 h-20 rounded-2xl border border-nexus-border flex items-center justify-center bg-nexus-surface shadow-2xl relative rotate-3 hover:rotate-0 transition-transform">
                    <Layers className="w-8 h-8 text-nexus-accent" />
                  </div>
               </div>
               <div className="space-y-2">
                 <h2 className="text-2xl font-bold tracking-tight text-white uppercase italic">Module Pending</h2>
                 <p className="text-nexus-muted text-sm max-w-xs mx-auto leading-relaxed">
                   Syncing with <span className="text-nexus-accent font-mono">{activeModule}</span> telemetry. Awaiting cluster initialization protocol.
                 </p>
               </div>
               <button className="px-8 py-3 bg-nexus-accent/10 hover:bg-nexus-accent/20 border border-nexus-accent/30 rounded-full text-[11px] font-bold text-nexus-accent transition-all uppercase tracking-[0.2em]">
                 Initialize Core
               </button>
            </div>
          )}
        </main>

        {/* Right Sidebar: Metrics */}
        <aside className="w-72 flex flex-col gap-4 p-6 shrink-0 border-l border-nexus-border bg-nexus-surface/30">
          <div className="bg-nexus-surface border border-nexus-border rounded-xl p-5 space-y-6">
            <h3 className="text-[10px] font-bold text-nexus-muted uppercase tracking-widest">Token Telemetry</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold text-white tracking-tighter">1.2M</div>
                  <div className="text-[9px] text-nexus-muted uppercase font-bold tracking-wider">Load Index</div>
                </div>
                <div className="text-right">
                  <div className="text-nexus-success text-sm font-bold">$42.10</div>
                  <div className="text-[9px] text-nexus-muted uppercase font-bold tracking-wider">Daily Cost</div>
                </div>
              </div>
              <div className="h-12 w-full flex items-end gap-1 px-1">
                {[4, 6, 8, 5, 10, 7, 12, 9, 11, 14].map((h, i) => (
                  <motion.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h * 3}px` }}
                    className={cn(
                      "flex-1 rounded-t-sm transition-colors",
                      i === 9 ? "bg-nexus-accent" : "bg-nexus-accent/20"
                    )} 
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="bg-nexus-surface border border-nexus-border rounded-xl p-5 flex-1 flex flex-col">
            <h3 className="text-[10px] font-bold text-nexus-muted uppercase tracking-widest mb-6">System Health</h3>
            <div className="space-y-6">
               {[
                 { label: "Inference Load", val: 68, color: "bg-nexus-accent" },
                 { label: "Memory Bank", val: 34, color: "bg-nexus-success" },
                 { label: "Network I/O", val: 82, color: "bg-sky-500" }
               ].map((stat) => (
                 <div key={stat.label}>
                    <div className="flex justify-between text-[11px] mb-2 font-medium">
                      <span className="text-nexus-muted uppercase tracking-wider">{stat.label}</span>
                      <span className="text-white font-mono">{stat.val}%</span>
                    </div>
                    <div className="w-full bg-nexus-border h-1.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.val}%` }}
                        className={cn("h-full", stat.color)} 
                      />
                    </div>
                 </div>
               ))}
            </div>

            <div className="mt-auto pt-6 border-t border-nexus-border">
              <div className="bg-slate-950 p-4 rounded-xl border border-nexus-border space-y-3">
                 <div className="text-[9px] text-nexus-muted uppercase font-bold tracking-widest">Active Alerts</div>
                 <div className="flex items-start gap-3 text-amber-400 text-[11px] leading-tight">
                   <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                   High consumption: Sentinel Protocol
                 </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 border-t border-nexus-border bg-black/40 px-6 flex items-center justify-between text-[9px] font-mono text-nexus-muted z-50">
        <div className="flex gap-8">
          <span className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-nexus-success" />
            NODE: NEXUS-US-EAST-01
          </span>
          <span className="hidden sm:inline">UPTIME: 142H 11M 02S</span>
        </div>
        <div className="flex gap-6">
          <span className="text-nexus-accent/60">SSL AES-256 ENCRYPTED</span>
          <span className="hidden md:inline">CONNECTED TO OMEGA-CLUSTER</span>
        </div>
      </footer>
    </div>
  );
}

