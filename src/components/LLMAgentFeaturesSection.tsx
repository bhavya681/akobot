"use client";

import { motion } from "framer-motion";
import { MessageSquare, Code, Lightbulb, BookOpen, Zap, Brain, TrendingUp, Sparkles } from "lucide-react";
import { useState } from "react";

const llmFeatures = [
  {
    id: "code-assistant",
    title: "AI Code Assistant",
    icon: Code,
    views: "2.9M",
    hot: true,
    description: "Write, debug, and optimize code in any language",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "creative-writing",
    title: "Creative Writing",
    icon: BookOpen,
    views: "1.5M",
    hot: true,
    description: "Generate stories, poems, and creative content",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "brainstorming",
    title: "AI Brainstorming",
    icon: Lightbulb,
    views: "890K",
    hot: false,
    description: "Generate ideas and solutions for any problem",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: "data-analysis",
    title: "Data Analysis",
    icon: TrendingUp,
    views: "650K",
    hot: false,
    description: "Analyze data and generate insights",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "translation",
    title: "Multi-Language Translation",
    icon: MessageSquare,
    views: "1.2M",
    hot: true,
    description: "Translate between 100+ languages",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    id: "summarization",
    title: "Content Summarization",
    icon: Zap,
    views: "780K",
    hot: false,
    description: "Summarize long documents and articles",
    gradient: "from-red-500 to-pink-500",
  },
  {
    id: "explanation",
    title: "Concept Explanation",
    icon: Brain,
    views: "950K",
    hot: true,
    description: "Explain complex topics in simple terms",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    id: "content-generation",
    title: "Content Generation",
    icon: Sparkles,
    views: "1.8M",
    hot: true,
    description: "Generate articles, blogs, and marketing content",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    id: "qa-system",
    title: "Q&A System",
    icon: MessageSquare,
    views: "1.1M",
    hot: false,
    description: "Answer questions from your knowledge base",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    id: "tutoring",
    title: "AI Tutoring",
    icon: BookOpen,
    views: "720K",
    hot: false,
    description: "Personalized learning and tutoring assistance",
    gradient: "from-amber-500 to-yellow-500",
  },
];

const LLMAgentFeaturesSection = () => {
  const [activeTab, setActiveTab] = useState<"all" | "popular">("all");

  const displayedFeatures = activeTab === "popular" 
    ? llmFeatures.filter(f => f.hot)
    : llmFeatures;

  return (
    <section className="py-12 lg:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4">
            LLM Agent <span className="gradient-text">Features</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore powerful AI capabilities powered by the world's best language models
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <button
            onClick={() => setActiveTab("all")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "all"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
            }`}
          >
            All Features
          </button>
          <button
            onClick={() => setActiveTab("popular")}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === "popular"
                ? "bg-primary text-primary-foreground shadow-lg"
                : "bg-secondary/50 text-muted-foreground hover:text-foreground hover:bg-secondary/70"
            }`}
          >
            Popular
          </button>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {displayedFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-2xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Card Image/Icon Area */}
                <div className={`relative h-48 bg-gradient-to-br ${feature.gradient} flex items-center justify-center`}>
                  <Icon className="w-16 h-16 text-white/90 group-hover:scale-110 transition-transform" />
                  
                  {/* Labels */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {feature.hot && (
                      <span className="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-semibold">
                        Hot
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-medium">
                      {feature.views}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <h3 className="text-base font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {feature.description}
                  </p>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default LLMAgentFeaturesSection;











