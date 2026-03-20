"use client";

import { motion } from "framer-motion";
import { Terminal, Zap, Server, Code, Key, Book, Shield, Clock, Globe, ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const DevelopersSection = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'image' | 'video' | 'chat'>('image');

  const codeSnippets = {
    image: `const response = await fetch('https://api.aeko.ai/v1/images/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'flux-pro',
    prompt: 'A futuristic city at sunset',
    size: '1024x1024',
    num_images: 1
  })
});

const { image_url } = await response.json();`,
    video: `const response = await fetch('https://api.aeko.ai/v1/videos/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'pollo-2.5',
    prompt: 'A serene landscape with mountains',
    duration: 5,
    fps: 24
  })
});

const { video_url } = await response.json();`,
    chat: `const response = await fetch('https://api.aeko.ai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4-turbo',
    messages: [
      { role: 'user', content: 'Hello, how can you help me?' }
    ],
    temperature: 0.7
  })
});

const { choices } = await response.json();`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const features = [
    {
      icon: Zap,
      title: "Fast Inference",
      description: "Sub-second response times with global CDN",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Server,
      title: "99.9% Uptime",
      description: "Enterprise-grade reliability and SLA",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "End-to-end encryption and data protection",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Clock,
      title: "Real-time",
      description: "WebSocket support for streaming responses",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Global Scale",
      description: "Multi-region deployment for low latency",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Code,
      title: "SDKs Available",
      description: "Python, Node.js, Go, and more",
      color: "from-red-500 to-pink-500",
    },
  ];

  return (
    <section id="developers" className="py-10 lg:py-14 relative overflow-hidden w-full bg-white dark:bg-transparent">
      {/* Grid - Light: dark lines | Dark: white lines */}
      <div className="absolute inset-0 dark:hidden opacity-[0.4]" style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }} />
      <div className="absolute inset-0 hidden dark:block opacity-[0.08]" style={{
        backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
      }} />
      {/* Animated Gradient Orbs - Theme Aware */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 dark:opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -40, 0],
          y: [0, 25, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-10 dark:opacity-15"
        style={{
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, -25, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      
      {/* Subtle Grid Overlay - Theme Aware */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Professional Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-12 lg:mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full backdrop-blur-xl bg-card/60 dark:bg-white/5 border border-border dark:border-white/10 mb-6"
            whileHover={{ scale: 1.03 }}
          >
            <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">For Developers</span>
            <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </motion.div>

          {/* Main Headline */}
          <motion.h2 
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground dark:text-white mb-4 leading-[1.1] tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <span className="block mb-1">Built for Creators.</span>
            <span className="block gradient-text">Loved by Developers.</span>
          </motion.h2>
          
          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-muted-foreground dark:text-white/70 max-w-2xl mx-auto leading-relaxed"
          >
            Integrate AI generation into your applications with our powerful REST API. 
            Fast inference, simple authentication, and scalable infrastructure.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start mb-16">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="space-y-6"
          >
            {/* Feature pills */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: Terminal, text: "REST API", color: "from-blue-500 to-cyan-500" },
                { icon: Zap, text: "Fast Inference", color: "from-yellow-500 to-orange-500" },
                { icon: Server, text: "99.9% Uptime", color: "from-green-500 to-emerald-500" },
              ].map((item) => (
                <motion.div
                  key={item.text}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-xl bg-card dark:bg-white/5 border border-border dark:border-white/10 hover:bg-accent dark:hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.03 }}
                >
                  <div className={`p-1 rounded-md bg-gradient-to-br ${item.color}`}>
                    <item.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-foreground dark:text-white">{item.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Description */}
            <p className="text-base text-muted-foreground dark:text-white/80 leading-relaxed">
              Our API is designed for developers who need reliable, fast, and easy-to-integrate AI capabilities. 
              Whether you're building image generation, video creation, or chat applications, we've got you covered.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="default" size="lg" className="gap-2 px-6 py-5 text-sm font-bold rounded-lg">
                  <Book className="w-4 h-4" />
                  View API Docs
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Button variant="outline" size="lg" className="gap-2 px-6 py-5 text-sm font-bold rounded-lg border-2">
                  <Key className="w-4 h-4" />
                  Get API Key
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Professional Code Block */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            {/* Outer Glow - Theme Aware */}
            <motion.div
              className="absolute -inset-0.5 rounded-2xl blur-xl opacity-30 dark:opacity-50"
              style={{
                background: "radial-gradient(circle, rgba(59, 130, 246, 0.2), rgba(124, 58, 237, 0.15), transparent)",
              }}
              animate={{
                opacity: [0.2, 0.35, 0.2],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            <div className="relative rounded-2xl overflow-hidden backdrop-blur-xl bg-card dark:bg-black/40 border-2 border-border dark:border-white/10 shadow-xl">
              {/* Terminal header */}
              <div className="flex items-center justify-between px-5 py-3 bg-muted/30 dark:bg-white/5 border-b border-border dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs text-muted-foreground dark:text-white/60 font-medium ml-2.5">
                    api-example.js
                  </span>
                </div>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-accent dark:bg-white/5 hover:bg-accent/80 dark:hover:bg-white/10 border border-border dark:border-white/10 text-foreground dark:text-white/80 hover:text-foreground dark:hover:text-white transition-all text-xs font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center gap-2 px-5 py-2.5 bg-muted/20 dark:bg-white/5 border-b border-border dark:border-white/10">
                {(['image', 'video', 'chat'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all capitalize ${
                      activeTab === tab
                        ? 'bg-primary/10 dark:bg-white/10 text-primary dark:text-white border border-primary/20 dark:border-white/20'
                        : 'text-muted-foreground dark:text-white/50 hover:text-foreground dark:hover:text-white/80 hover:bg-accent dark:hover:bg-white/5'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Code content */}
              <div className="p-5 overflow-x-auto bg-muted/10 dark:bg-[#0a0a0f]">
                <pre className="text-xs leading-relaxed font-mono">
                  <code className="text-foreground dark:text-white/90">
                    {codeSnippets[activeTab].split("\n").map((line, i) => (
                      <div key={i} className="flex hover:bg-accent/30 dark:hover:bg-white/5 transition-colors">
                        <span className="select-none text-muted-foreground/50 dark:text-white/30 mr-5 w-7 text-right font-normal">
                          {i + 1}
                        </span>
                        <span
                          className="flex-1"
                          dangerouslySetInnerHTML={{
                            __html: line
                              .replace(
                                /(const|await|fetch|async|function|return)/g,
                                '<span class="text-blue-600 dark:text-blue-400">$1</span>'
                              )
                              .replace(
                                /('.*?')/g,
                                '<span class="text-green-600 dark:text-green-400">$1</span>'
                              )
                              .replace(
                                /(method|headers|body|model|prompt|size|duration|fps|messages|role|content|temperature|num_images)/g,
                                '<span class="text-purple-600 dark:text-purple-400">$1</span>'
                              )
                              .replace(
                                /(POST|GET|PUT|DELETE)/g,
                                '<span class="text-yellow-600 dark:text-yellow-400">$1</span>'
                              )
                              .replace(
                                /(https?:\/\/[^\s']+)/g,
                                '<span class="text-cyan-600 dark:text-cyan-400">$1</span>'
                              ),
                          }}
                        />
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-6xl mx-auto"
        >
          <h3 className="text-2xl md:text-3xl font-extrabold text-foreground dark:text-white text-center mb-8">
            Why Developers Choose AKOBOT.AI
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.08 }}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="relative group"
                >
                  <div className="relative p-5 rounded-xl backdrop-blur-xl bg-card dark:bg-white/5 border border-border dark:border-white/10 hover:bg-accent dark:hover:bg-white/10 hover:border-primary/30 dark:hover:border-white/20 transition-all duration-300">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 shadow-md`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    
                    {/* Content */}
                    <h4 className="text-lg font-bold text-foreground dark:text-white mb-1.5">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground dark:text-white/60 leading-relaxed">{feature.description}</p>
                    
                    {/* Hover Glow */}
                    <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 blur-xl transition-opacity duration-300 -z-10`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DevelopersSection;
