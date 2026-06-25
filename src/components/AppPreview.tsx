import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Terminal, 
  Mic, 
  Send, 
  Plus, 
  History, 
  Search, 
  Paperclip,
  Clock,
  PhoneCall,
  User,
  Monitor,
  Smartphone,
  Settings,
  Menu,
  MessageSquare
} from "lucide-react";

interface ChatMessage {
  sender: "user" | "luno";
  text: string;
  code?: string;
  lang?: string;
  audio?: boolean;
}

interface DemoOption {
  modelName: string;
  tagline: string;
  source: string;
  historyTitle: string;
  messages: ChatMessage[];
}

const VioletLunoIcon: React.FC<{ className?: string; size?: number }> = ({ className = "", size = 6 }) => (
  <div 
    className={`rounded-full bg-gradient-to-br from-[#7c3aed] via-[#a78bfa] to-[#c084fc] flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0 ${className}`}
    style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
  >
    <Sparkles className="text-white fill-white" style={{ width: `${size * 2}px`, height: `${size * 2}px` }} />
  </div>
);

export const AppPreview: React.FC = () => {
  const demoConfigs: Record<string, DemoOption> = {
    reasoning: {
      modelName: "Luno Reasoning v2.4",
      tagline: "Logical Multi-path Chain of Thought",
      source: "REASONING_MATH",
      historyTitle: "Quantum superposition",
      messages: [
        {
          sender: "user",
          text: "Can you explain how Quantum Superposition works with a simple, tangible coin analogy?"
        },
        {
          sender: "luno",
          text: "Let's break superposition down using a raw physical coin:\n\n1. **Standard State**: If a coin is resting flat on a table, it is either **Heads** or **Tails** (traditional binary bit: 1 or 0).\n2. **Superposition State**: Now, flick the coin so it spins rapidly on the desk. While it spins, is it Heads or Tails? \n\nIt exists in an active, dynamic mixture of both states simultaneously. It is 50% heads and 50% tails at the exact same moment. This is quantum **superposition**.\n\n3. **Collapse (Measurement)**: Slap your hand down on the spinning coin. You stop the movement. It instantly forces the coin to collapse into a single, concrete outcome: Heads *or* Tails. In quantum physics, looking at or measuring a subatomic particle performs this exact 'collapse'."
        }
      ]
    },
    developer: {
      modelName: "Polyglot AST Coder v2.0",
      tagline: "Highly optimized low-level syntax compiler assistant",
      source: "COMPILER_TS",
      historyTitle: "React local-sync custom hook",
      messages: [
        {
          sender: "user",
          text: "Write a React hook to handle localStorage sync. Keep it simple."
        },
        {
          sender: "luno",
          text: "Here is an optimized custom hook in TypeScript that handles storage sync across browser frames safely:",
          code: `import { useState, useEffect, useCallback } from "react";\n\nexport function useLocalSync<T>(key: string, initialValue: T) {\n  const readValue = useCallback((): T => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (e) {\n      return initialValue;\n    }\n  }, [key, initialValue]);\n\n  const [storedValue, setStoredValue] = useState<T>(readValue);\n\n  useEffect(() => {\n    window.localStorage.setItem(key, JSON.stringify(storedValue));\n  }, [key, storedValue]);\n\n  return [storedValue, setStoredValue] as const;\n}`,
          lang: "typescript"
        }
      ]
    },
    audio: {
      modelName: "Vocal Duplex HD-A1",
      tagline: "Direct audio-to-audio speech compiler model",
      source: "AUDIO_SYNTH",
      historyTitle: "Vocal speed synthesis loop",
      messages: [
        {
          sender: "user",
          text: "Connect to audio synthesizer and modify streaming speech pitch to 1.15x speed."
        },
        {
          sender: "luno",
          text: "[Voice Stream Active // Core Vocal Synthesis channels mapped safely]\n\nI have balanced the direct-duplex voice codec frequencies. Standard streaming voice is now running at 1.15x with pitch compensation enabled. Speak at any time to stream raw audio packets.",
          audio: true
        }
      ]
    }
  };

  const [activeTab, setActiveTab] = useState<string>("home");
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [activeConfig, setActiveConfig] = useState<DemoOption | null>(null);
  
  // Custom chat history list
  const [chatsHistory, setChatsHistory] = useState<Array<{ id: string; title: string }>>([
    { id: "reasoning", title: "Quantum superposition" },
    { id: "developer", title: "React local-sync custom hook" },
    { id: "audio", title: "Vocal speed synthesis loop" }
  ]);

  const suggestionChips = [
    { text: "Write a poem about stars", icon: "✍️" },
    { text: "Tell me a funny joke", icon: "😂" },
    { text: "Help me brainstorm", icon: "💡" },
    { text: "Write a React component", icon: "💻" },
    { text: "Explain how AI works", icon: "🕵️‍♂️" },
    { text: "Tell me something cool", icon: "🌍" },
    { text: "Give me a healthy recipe", icon: "🥗" },
    { text: "Quick home workout", icon: "🏃‍♂️" },
    { text: "Play Chess with me", icon: "♟️" },
    { text: "Open Snake game", icon: "🐍" },
    { text: "Let's play Ludo", icon: "🎲" },
    { text: "Play a car game", icon: "🏎️" }
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === "home") {
      setActiveConfig(null);
    } else {
      setActiveConfig(demoConfigs[tabId]);
    }
  };

  const handleChipClick = (chipText: string) => {
    // Fill input and simulate send
    setTypedMessage(chipText);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const query = typedMessage;
    setTypedMessage("");

    if (activeTab === "home") {
      // Create new transient chat configuration
      setActiveTab("custom");
      setActiveConfig({
        modelName: "Luno Assistant v1.2",
        tagline: "Dynamic Vector Query Pipeline",
        source: "CUSTOM_USER",
        historyTitle: query.length > 20 ? query.substring(0, 20) + "..." : query,
        messages: [
          { sender: "user", text: query },
          { sender: "luno", text: "Connecting to secure local ports... Processing semantic token streams..." }
        ]
      });

      // Append new entry to sidebar history
      setChatsHistory(prev => [
        { id: "custom", title: query.length > 20 ? query.substring(0, 20) + "..." : query },
        ...prev
      ]);

      setTimeout(() => {
        setActiveConfig(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [
              prev.messages[0],
              { sender: "luno", text: `Here is the synthesis response for: "${query}". Memory sync complete. Mapped successfully to local vector databases.` }
            ]
          };
        });
      }, 1000);
    } else if (activeConfig) {
      // Append message to active config
      const updatedMessages: ChatMessage[] = [
        ...activeConfig.messages,
        { sender: "user", text: query }
      ];

      setActiveConfig(prev => {
        if (!prev) return null;
        return { ...prev, messages: updatedMessages };
      });

      setTimeout(() => {
        setActiveConfig(prev => {
          if (!prev) return null;
          return {
            ...prev,
            messages: [
              ...prev.messages,
              { sender: "luno", text: `Acknowledged query: "${query}". Connecting to secure local sandbox ports.` }
            ]
          };
        });
      }, 1000);
    }
  };

  return (
    <section id="preview" className="relative py-24 px-6 sm:px-12 md:px-20 max-w-7xl mx-auto z-25 overflow-hidden">

      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.04) 60%, transparent 100%)' }}></div>

      {/* Header */}
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/25 bg-purple-500/10 text-[11px] font-mono text-purple-300 mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>LIVE DEMO</span>
        </div>
        <span className="text-[10px] font-mono tracking-widest text-purple-400 block mb-3 uppercase">
          INTERFACE PREVIEW
        </span>
        <h2 className="text-3xl sm:text-4xl font-display font-semibold text-white tracking-tight">
          Crafted to be{" "}
          <span className="hero-gradient-text">lived in.</span>
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 mt-4 leading-relaxed">
          Experience the tactile, fluid Luno UI. Toggle tabs below to preview suggestion engines, chat histories, or audio synthesis loops.
        </p>

        {/* Model Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mt-8 p-1.5 rounded-xl bg-black/40 border border-white/6 max-w-2xl mx-auto backdrop-blur-md">
          {[
            { id: "home", icon: <MessageSquare className="w-3.5 h-3.5" />, label: "Luno Home" },
            { id: "reasoning", icon: <Sparkles className="w-3.5 h-3.5" />, label: "Reasoning Engine" },
            { id: "developer", icon: <Terminal className="w-3.5 h-3.5" />, label: "Polyglot Coder" },
            { id: "audio", icon: <Mic className="w-3.5 h-3.5" />, label: "Voice Audio Duplex" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium tracking-tight transition-all duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-lg"
                  : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Application Preview Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* DESKTOP CLIENT PREVIEW FRAME (Takes 8 cols) */}
        <div className="lg:col-span-8 flex flex-col pt-4">
          <div className="w-full text-left font-mono text-[10px] text-zinc-500 mb-2 flex items-center gap-2 pl-3">
            <Monitor className="w-3.5 h-3.5" />
            <span>LUNO_MACOS_CLIENT.APP V1.2.0 stable release</span>
          </div>

          <motion.div
            layout 
            className="w-full aspect-[16/10] rounded-2xl border border-[#00f5c4]/10 bg-[#001410] shadow-2xl overflow-hidden flex text-white font-sans"
          >
            {/* Sidebar View (Desktop only) */}
            <div className="w-[220px] bg-[#011712] border-r border-[#00f5c4]/5 flex flex-col justify-between p-4 hidden md:flex shrink-0">
              <div className="space-y-4">
                {/* Brand Logo and Title */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <VioletLunoIcon size={6.5} />
                    <span className="text-sm font-semibold tracking-tight font-display text-white">Luno</span>
                  </div>
                  <button className="w-6 h-6 rounded-full bg-[#00261f] border border-[#00f5c4]/15 flex items-center justify-center hover:bg-[#003b30] cursor-pointer text-[#00f5c4] transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Search box */}
                <div className="relative flex items-center">
                  <Search className="absolute left-2.5 w-3 h-3 text-[#82a49b]" />
                  <input
                    disabled
                    type="text"
                    placeholder="Search chats..."
                    className="w-full text-[10px] bg-[#00261f]/50 text-white placeholder-[#82a49b]/70 border border-[#003b2f] rounded-lg pl-8 pr-2.5 py-1.5 focus:outline-none"
                  />
                </div>

                {/* Chats / Archived Control */}
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-[#00261f]/50 border border-[#003b2f] rounded-lg">
                  <button className="py-1 text-[9px] font-medium rounded bg-[#0a3a2e] text-[#00f5c4] border border-[#00f5c4]/10 cursor-pointer">
                    Chats
                  </button>
                  <button className="py-1 text-[9px] font-medium rounded text-[#82a49b] hover:text-white cursor-pointer">
                    Archived
                  </button>
                </div>

                {/* Chat History List */}
                <div className="space-y-2 pt-2">
                  <span className="text-[8px] font-mono tracking-widest text-[#82a49b]/70 uppercase block">
                    Recent Chats
                  </span>
                  <div className="space-y-1">
                    {chatsHistory.map((chat) => {
                      const isActive = activeTab === chat.id;
                      return (
                        <div
                          key={chat.id}
                          onClick={() => handleTabChange(chat.id)}
                          className={`p-2 rounded-lg flex items-center gap-2 text-[10px] cursor-pointer transition-all ${
                            isActive
                              ? "bg-[#0a3a2e] text-[#00f5c4] border border-[#00f5c4]/15"
                              : "hover:bg-[#00261f]/40 text-[#82a49b] hover:text-white"
                          }`}
                        >
                          <Clock className="w-3 h-3 shrink-0 opacity-70" />
                          <span className="truncate text-left flex-1">{chat.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Sidebar Profile Info */}
              <div className="pt-3 border-t border-[#003b2f] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <VioletLunoIcon size={5.5} />
                  <div className="text-left leading-none">
                    <span className="text-[10px] font-semibold block text-white">Luno User</span>
                    <span className="text-[8px] text-[#82a49b] font-mono">Settings & Profile</span>
                  </div>
                </div>
                <Settings className="w-3.5 h-3.5 text-[#82a49b] hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col justify-between bg-[#001410]">
              
              {/* Header */}
              <div className="px-5 py-3.5 border-b border-[#00261f] bg-[#001713]/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <button className="md:hidden text-[#82a49b] hover:text-white">
                    <Menu className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white tracking-tight">
                      {activeConfig ? activeConfig.modelName : "Luno"}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f5c4] shadow-[0_0_6px_rgba(0,245,196,0.6)]"></span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#82a49b]">
                  <Search className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                  <Settings className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
                </div>
              </div>

              {/* Chat Content Panel */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[340px]">
                
                {/* 1. WELCOME SCREEN (If no active config/messages) */}
                {!activeConfig ? (
                  <div className="h-full flex flex-col justify-center items-center text-center py-6 space-y-6">
                    <div className="flex flex-col items-center space-y-3">
                      <VioletLunoIcon size={12} />
                      <h3 className="text-xl sm:text-2xl font-semibold text-white font-display">
                        Good night, there
                      </h3>
                      <p className="text-xs text-[#82a49b]">
                        What can I help you with today?
                      </p>
                    </div>

                    {/* 12 Suggestion Chips Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-2xl w-full px-2">
                      {suggestionChips.map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleChipClick(chip.text)}
                          className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#003b2b]/40 bg-[#00261d]/60 hover:bg-[#003a2c]/80 hover:border-[#00f5c4]/20 transition-all text-[10px] text-zinc-200 text-left font-medium hover:scale-[1.02] cursor-pointer group"
                        >
                          <span className="text-sm">{chip.icon}</span>
                          <span className="truncate group-hover:text-white">{chip.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // 2. ACTIVE CHAT LOGS
                  <div className="space-y-4 text-left">
                    {activeConfig.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-start gap-2.5`}
                      >
                        {msg.sender !== "user" && <VioletLunoIcon size={7} />}
                        
                        <div className={`max-w-[85%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-[#0a3a2e] text-white border border-[#00f5c4]/15"
                            : "bg-[#00261f] text-zinc-200 border border-[#003b2b]/30"
                        }`}>
                          <p className="whitespace-pre-line">{msg.text}</p>

                          {msg.code && (
                            <pre className="mt-3.5 p-3.5 rounded-lg bg-[#001410] border border-[#003b2b]/40 font-mono text-[10px] text-[#00f5c4] overflow-x-auto max-w-full leading-relaxed select-all">
                              <code>{msg.code}</code>
                            </pre>
                          )}

                          {msg.audio && (
                            <div className="mt-4 flex items-center gap-3 p-2 bg-[#003b2c] rounded-lg border border-[#00f5c4]/10 max-w-[240px]">
                              <PhoneCall className="w-4 h-4 text-[#00f5c4] animate-pulse shrink-0" />
                              <div className="w-full space-y-1">
                                <span className="text-[10px] font-mono text-[#82a49b] block">Duplex voice stream</span>
                                <div className="h-1 bg-white/10 rounded-full overflow-hidden flex gap-0.5">
                                  <div className="h-full bg-[#00f5c4] rounded-full w-1/4 animate-bounce"></div>
                                  <div className="h-full bg-[#00f5c4] rounded-full w-2/4 animate-bounce shrink-0" style={{ animationDelay: "0.2s" }}></div>
                                  <div className="h-full bg-[#00f5c4] rounded-full w-1/3 animate-bounce shrink-0" style={{ animationDelay: "0.4s" }}></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Chat Input Field */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-[#00261f] bg-[#001713]/40 flex gap-2">
                <div className="flex-1 relative flex items-center">
                  <button type="button" className="absolute left-3 w-7 h-7 rounded-full bg-[#00261f] flex items-center justify-center text-[#82a49b] hover:text-white hover:bg-[#003b2f] transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                  <input
                    type="text"
                    value={typedMessage}
                    onChange={(e) => setTypedMessage(e.target.value)}
                    placeholder="Any Questions...?"
                    className="w-full text-xs text-white bg-[#00261f]/50 hover:bg-[#00261f]/80 focus:bg-[#00261f] border border-[#003b2f] focus:border-[#00f5c4]/45 focus:outline-none rounded-2xl py-3 pl-12 pr-12 transition-all duration-200"
                  />
                  <div className="absolute right-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#82a49b] hover:text-white cursor-pointer transition-colors" />
                  </div>
                </div>
                
                {/* Custom waveform button */}
                <button
                  type="submit"
                  className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#003b2f] via-[#005c48] to-[#00f5c4]/30 hover:to-[#00f5c4]/50 border border-[#00f5c4]/20 flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </form>

            </div>
          </motion.div>
        </div>


        {/* FLOATING MOBILE CLIENT PREVIEW (Takes 4 cols) */}
        <div className="lg:col-span-4 flex flex-col pt-4">
          
          <div className="w-full text-left font-mono text-[10px] text-zinc-500 mb-2 flex items-center gap-2 pl-3">
            <Smartphone className="w-3.5 h-3.5" />
            <span>LUNO_MOBILE.APK V1.2.0 testing</span>
          </div>

          <div className="relative mx-auto w-full max-w-[280px] aspect-[9/18] rounded-[36px] border-[5px] border-zinc-800 bg-[#001410] shadow-2xl overflow-hidden shadow-white/5">
            
            {/* Elegant camera sensor pill top of screen */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-zinc-800 z-50 flex justify-between px-2.5 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500/50"></span>
              <span className="w-1 h-1 rounded-full bg-zinc-950"></span>
            </div>

            {/* Mobile Screen Display Layout */}
            <div className="absolute inset-0 pt-8 pb-3 px-3 flex flex-col justify-between text-left font-sans text-xs">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-[#00261f] pb-2.5 mb-1.5 shrink-0">
                <div className="flex items-center gap-1.5">
                  <VioletLunoIcon size={4.5} />
                  <div>
                    <span className="text-[10px] font-semibold text-white block leading-tight">Luno Mobile</span>
                    <span className="text-[7px] text-[#82a49b] block font-mono leading-none">Vector database synced</span>
                  </div>
                </div>

                <div className="h-1.5 w-1.5 rounded-full bg-[#00f5c4]"></div>
              </div>

              {/* Chat content container inside mobile screen */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 py-1">
                
                {/* If home tab, display mobile welcome screen. Otherwise show the chat. */}
                {!activeConfig ? (
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-4 py-2">
                    <VioletLunoIcon size={8} />
                    <div className="leading-tight">
                      <h4 className="text-sm font-semibold text-white">Good night, there</h4>
                      <p className="text-[9px] text-[#82a49b] mt-1">What can I help you with today?</p>
                    </div>
                    
                    <div className="space-y-1.5 w-full">
                      {suggestionChips.slice(0, 3).map((chip, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleChipClick(chip.text)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#003b2b]/40 bg-[#00261d]/60 text-[8px] text-zinc-300 text-left font-medium hover:text-white cursor-pointer"
                        >
                          <span>{chip.icon}</span>
                          <span className="truncate">{chip.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Active mobile chat messages (clean styling, no liquid glass)
                  <div className="space-y-2 text-left">
                    {activeConfig.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} items-start gap-1.5`}
                      >
                        {msg.sender !== "user" && <VioletLunoIcon size={4.5} />}
                        <div className={`max-w-[88%] rounded-xl px-2.5 py-2 text-[9px] leading-normal ${
                          msg.sender === "user"
                            ? "bg-[#0a3a2e] text-white border border-[#00f5c4]/15"
                            : "bg-[#00261f] text-zinc-200 border border-[#003b2b]/30"
                        }`}>
                          <p className="whitespace-pre-line">{msg.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Bottom input area inside mobile screen */}
              <div className="pt-2 border-t border-[#00261f] shrink-0">
                <div className="flex gap-1.5 items-center w-full p-1 bg-[#00261f]/50 rounded-xl border border-[#003b2f]">
                  <button type="button" className="w-5 h-5 rounded-full bg-[#00261f] flex items-center justify-center text-[#82a49b]">
                    <Plus className="w-3 h-3" />
                  </button>
                  <input
                    disabled
                    type="text"
                    placeholder="Any Questions...?"
                    className="flex-1 bg-transparent border-none text-[9px] text-zinc-300 outline-none"
                  />
                  <div className="w-5 h-5 rounded-full bg-[#003b2f] flex items-center justify-center text-[#00f5c4]">
                    <Send className="w-2.5 h-2.5" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>

    </section>
  );
};
