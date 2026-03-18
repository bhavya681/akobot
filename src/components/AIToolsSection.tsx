"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Video, MessageSquare, Wand2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const aiTools = [
  {
    id: "text2video",
    name: "Text to Video AI",
    icon: Video,
    description: "AEKO AI text to video generator brings your prompts to life with best-in-class visuals and perfectly synchronized audio.",
    placeholder: "On Mars, a spacecraft is taking off",
    gradient: "from-purple-500 via-pink-500 to-orange-500",
    route: "/dashboard/tools/video",
  },
  {
    id: "llm-agent",
    name: "LLM Agent",
    icon: MessageSquare,
    description: "Chat with the world's most powerful language models. Get instant answers, write code, brainstorm ideas, and more.",
    placeholder: "Explain quantum computing in simple terms",
    gradient: "from-green-500 via-emerald-500 to-teal-500",
    route: "/dashboard/tools/agent",
  },
];

const AIToolsSection = () => {
  const [prompts, setPrompts] = useState<Record<string, string>>({});

  const handlePromptChange = (toolId: string, value: string) => {
    setPrompts((prev) => ({ ...prev, [toolId]: value }));
  };

  return (
    <section className="py-12 lg:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {aiTools.map((tool, index) => {
          const isEven = index % 2 === 0;
          const contentOrder = isEven ? "order-1" : "order-2";
          const playgroundOrder = isEven ? "order-2" : "order-1";
          
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="mb-32 last:mb-0"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
                {/* Text Content - Alternating sides */}
                <div className={`space-y-6 ${contentOrder}`}>
                <motion.div
                  initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${tool.gradient} bg-opacity-10`}>
                      <tool.icon className={`w-6 h-6 bg-gradient-to-r ${tool.gradient} bg-clip-text text-transparent`} />
                    </div>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground">
                      {tool.name}
                    </h2>
                  </div>
                  <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    {tool.description}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Link href={tool.route}>
                    <Button
                      variant="hero"
                      size="lg"
                      className="group gap-2 px-8 py-6 text-lg"
                    >
                      Try for Free
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </motion.div>
              </div>

                {/* Visual/Input Area - Alternating sides */}
                <motion.div
                  initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className={`relative ${playgroundOrder}`}
                >
                <div className="relative bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 min-h-[500px] flex flex-col">
                  {/* Preview Area */}
                  <div className="w-full flex-1 rounded-2xl bg-secondary/20 border-2 border-dashed border-border/50 flex items-center justify-center mb-6">
                    {tool.id === "text2video" && (
                      <div className="text-center space-y-4">
                        <Video className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                        <p className="text-muted-foreground/50">Video Preview</p>
                      </div>
                    )}
                    {tool.id === "llm-agent" && (
                      <div className="text-center space-y-4">
                        <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto" />
                        <p className="text-muted-foreground/50">Chat Interface</p>
                      </div>
                    )}
                  </div>

                  {/* Input Field */}
                  <div className="w-full">
                    <div className="relative">
                      <input
                        type="text"
                        value={prompts[tool.id] || ""}
                        onChange={(e) => handlePromptChange(tool.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && prompts[tool.id]?.trim()) {
                            window.location.href = `${tool.route}?q=${encodeURIComponent(prompts[tool.id].trim())}`;
                          }
                        }}
                        placeholder={tool.placeholder}
                        className="w-full px-6 py-4 pr-14 rounded-2xl bg-background/80 backdrop-blur-sm border border-border/50 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                      />
                      <button
                        onClick={() => {
                          if (prompts[tool.id]?.trim()) {
                            window.location.href = `${tool.route}?q=${encodeURIComponent(prompts[tool.id].trim())}`;
                          }
                        }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-gradient-to-r ${tool.gradient} text-white hover:scale-110 transition-transform shadow-lg`}
                      >
                        <Wand2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground/60 mt-3 text-center">
                      Powered by AEKO
                    </p>
                  </div>
                </div>
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default AIToolsSection;
