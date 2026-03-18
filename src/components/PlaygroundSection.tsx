"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wand2, Settings2, Zap, Sparkles, Image, Video, MessageSquare, Code } from "lucide-react";
import { Button } from "@/components/ui/button";

const modelCategories = [
  {
    id: "chat",
    name: "Chat Models",
    icon: MessageSquare,
    models: [
      { name: "GPT-4 Turbo", tag: "Most Capable", speed: "Fast" },
      { name: "GPT-3.5", tag: "Balanced", speed: "Fastest" },
      { name: "Claude 3 Opus", tag: "Creative", speed: "Fast" },
      { name: "Gemini Pro", tag: "Multimodal", speed: "Fast" },
    ],
  },
  {
    id: "image",
    name: "Image Models",
    icon: Image,
    models: [
      { name: "FLUX Pro", tag: "Photorealistic", speed: "Fast" },
      { name: "Stable Diffusion XL", tag: "Versatile", speed: "Fast" },
      { name: "DALL-E 3", tag: "Creative", speed: "Medium" },
      { name: "Midjourney Style", tag: "Artistic", speed: "Fast" },
    ],
  },
  {
    id: "video",
    name: "Video Models",
    icon: Video,
    models: [
      { name: "Runway Gen-3", tag: "Cinematic", speed: "Slow" },
      { name: "Pika Labs", tag: "Motion", speed: "Medium" },
      { name: "Stable Video", tag: "Consistent", speed: "Medium" },
      { name: "AnimateDiff", tag: "Animation", speed: "Fast" },
    ],
  },
];

const PlaygroundSection = () => {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");
  const [activeCategory, setActiveCategory] = useState("image");
  const [prompt, setPrompt] = useState("");
  const [settings, setSettings] = useState({
    steps: 30,
    guidance: 7.5,
    seed: -1,
  });

  return (
    <section className="py-12 lg:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/10 to-background" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            AI <span className="gradient-text">Playground</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            Choose your model, craft your prompt, and create magic
          </p>

          {/* Mode Toggle */}
          <div className="inline-flex items-center p-1 rounded-full bg-secondary/50 border border-border/50">
            <button
              onClick={() => setMode("simple")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "simple"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Simple Mode
            </button>
            <button
              onClick={() => setMode("advanced")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                mode === "advanced"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Advanced Mode
            </button>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {/* LEFT: Playground */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6 border-2 border-border/50"
          >
            <div className="flex items-center gap-2 mb-6">
              <Wand2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Create</h3>
            </div>

            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-sm text-muted-foreground mb-2">
                Your Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic cityscape at sunset, neon lights reflecting on wet streets..."
                className="w-full h-40 px-4 py-3 rounded-xl bg-secondary/40 border-2 border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 resize-none font-medium"
              />
            </div>

            {/* Advanced Settings */}
            {mode === "advanced" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 space-y-4"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Settings2 className="w-4 h-4" />
                  <span>Advanced Parameters</span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Steps
                    </label>
                    <input
                      type="number"
                      value={settings.steps}
                      onChange={(e) =>
                        setSettings({ ...settings, steps: +e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Guidance
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={settings.guidance}
                      onChange={(e) =>
                        setSettings({ ...settings, guidance: +e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">
                      Seed
                    </label>
                    <input
                      type="number"
                      value={settings.seed}
                      onChange={(e) =>
                        setSettings({ ...settings, seed: +e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg bg-secondary/30 border border-border/50 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            <Button variant="hero" size="lg" className="w-full gap-2">
              <Zap className="w-4 h-4" />
              Generate
            </Button>
          </motion.div>

          {/* RIGHT: Models Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-3 glass-card rounded-2xl p-6 border-2 border-border/50"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                Choose Model
              </h3>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {modelCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Models Grid */}
            <div className="grid grid-cols-2 gap-3">
              {modelCategories
                .find((c) => c.id === activeCategory)
                ?.models.map((model, idx) => (
                  <motion.button
                    key={model.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group p-4 rounded-xl bg-secondary/20 border border-border/30 hover:border-primary/50 hover:bg-secondary/40 transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {model.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                        {model.tag}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {model.speed}
                      </span>
                    </div>
                  </motion.button>
                ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PlaygroundSection;
