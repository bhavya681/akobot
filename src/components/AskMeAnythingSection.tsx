"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, ChevronDown, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

const models = [
  { id: "gpt-4", name: "GPT-4 Turbo", icon: "🧠" },
  { id: "gpt-3.5", name: "GPT-3.5", icon: "⚡" },
  { id: "claude", name: "Claude 3", icon: "🎭" },
  { id: "gemini", name: "Gemini Pro", icon: "💎" },
];

const AskMeAnythingSection = () => {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState(models[0]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <section className="py-12 lg:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />
      
      {/* Glowing orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Bot className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">AI Chat Playground</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Ask Me <span className="gradient-text">Anything</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Instantly chat with the world's most powerful language models
          </p>
        </motion.div>

        {/* Chat Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-3xl mx-auto"
        >
          <div
            className={`glass-card rounded-2xl p-6 transition-all duration-300 ${
              isFocused ? "ring-2 ring-primary/50 border-primary/50" : ""
            }`}
          >
            {/* Model Selector */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative">
                <button
                  onClick={() => setIsModelOpen(!isModelOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <span>{selectedModel.icon}</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedModel.name}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isModelOpen ? 'rotate-180' : ''}`} />
                </button>

                {isModelOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 mt-2 w-48 rounded-lg bg-card border border-border shadow-xl z-20"
                  >
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setIsModelOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-secondary/50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        <span>{model.icon}</span>
                        <span className="text-sm text-foreground">{model.name}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Sparkles className="w-3 h-3" />
                <span>Powered by AEKO</span>
              </div>
            </div>

            {/* Input Area */}
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Ask me anything... Write code, explain concepts, brainstorm ideas..."
                className="w-full h-32 bg-transparent text-foreground placeholder:text-muted-foreground resize-none focus:outline-none text-lg"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground">
                <Paperclip className="w-4 h-4" />
                <span className="text-sm">Attach file</span>
              </button>

              <Button variant="hero" size="lg" className="gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </Button>
            </div>
          </div>

          {/* Sample prompts */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
            {[
              "Explain quantum computing",
              "Write a Python script",
              "Create a marketing plan",
              "Debug my code",
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                className="px-4 py-2 rounded-full bg-secondary/30 hover:bg-secondary/50 border border-border/50 text-sm text-muted-foreground hover:text-foreground transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AskMeAnythingSection;
