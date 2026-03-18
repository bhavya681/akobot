"use client";
import { motion } from "framer-motion";
import { MessageSquare, Image, Video, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const HeroSection = () => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSubmit = () => {
    if (input.trim()) {
      // Navigate to agent page with the query
      router.push(`/dashboard/tools/agent?q=${encodeURIComponent(input.trim())}`);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 md:pt-40 z-20 w-full bg-background">
      {/* Professional Background with Mesh Gradient */}
      <div className="absolute inset-0 z-0 w-full">
        {/* Base gradient - Theme Aware */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-black dark:via-black dark:to-black" />
        
        {/* Animated mesh gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(at 20% 30%, rgba(124, 58, 237, 0.15) 0px, transparent 50%),
              radial-gradient(at 80% 70%, rgba(59, 130, 246, 0.15) 0px, transparent 50%),
              radial-gradient(at 50% 50%, rgba(236, 72, 153, 0.1) 0px, transparent 50%),
              radial-gradient(at 0% 100%, rgba(34, 211, 238, 0.1) 0px, transparent 50%)
            `,
          }}
          animate={{
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Overlay for depth - Theme Aware */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/50 dark:from-black/60 dark:via-black/40 dark:to-black/70" />
        
        {/* Professional animated gradient orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{
            background: "radial-gradient(circle, rgba(124, 58, 237, 0.25) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, 80, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{
            background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)",
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5,
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{
            background: "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)",
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        
        {/* Subtle flowing light beams */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: "linear-gradient(45deg, transparent 40%, rgba(124, 58, 237, 0.15) 50%, transparent 60%)",
            backgroundSize: "300% 300%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Refined star field - subtle and professional */}
        <div className="absolute inset-0">
          {Array.from({ length: 60 }).map((_, i) => {
            const size = Math.random() * 1.5 + 0.5;
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            const duration = Math.random() * 5 + 3;
            const delay = Math.random() * 4;
            const colors = [
              "rgba(255, 255, 255, 0.6)",
              "rgba(124, 58, 237, 0.5)",
              "rgba(59, 130, 246, 0.5)",
            ];
            const color = colors[Math.floor(Math.random() * colors.length)];
            return (
              <motion.div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${startX}%`,
                  top: `${startY}%`,
                  background: color,
                  boxShadow: `0 0 ${size * 3}px ${color}`,
                }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: duration,
                  repeat: Infinity,
                  delay: delay,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Professional grid overlay - subtle and crisp */}
      <div className="absolute inset-0 z-[1] opacity-[0.05]">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
          animate={{
            backgroundPosition: ["0 0", "80px 80px"],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
      
      {/* Subtle floating particles - minimal and elegant */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => {
          const startX = Math.random() * 100;
          const startY = Math.random() * 100;
          const duration = Math.random() * 15 + 12;
          const delay = Math.random() * 8;
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-0.5 h-0.5 rounded-full bg-white/30"
              style={{
                left: `${startX}%`,
                top: `${startY}%`,
              }}
              animate={{
                y: [0, -150, 0],
                x: [0, Math.random() * 40 - 20, 0],
                opacity: [0, 0.6, 0],
              }}
              transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>
      
      {/* Neon accent lines - innovative touch */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Professional Badge - crisp and modern */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-2xl bg-card/60 dark:bg-white/5 border border-border dark:border-white/10 mb-12 shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            whileHover={{ 
              scale: 1.03, 
              borderColor: "rgba(124, 58, 237, 0.4)",
              boxShadow: "0 12px 40px rgba(124, 58, 237, 0.2)",
            }}
          >
            <span className="relative flex h-3 w-3">
              <motion.span
                className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-80"
                animate={{
                  scale: [1, 1.6, 1],
                  opacity: [0.8, 0, 0.8],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                }}
              />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]"></span>
            </span>
            <span className="text-sm font-semibold text-foreground dark:text-white/95 tracking-wide">
              Powered by GPT-4, FLUX & Stable Diffusion
            </span>
          </motion.div>

          {/* Professional Headline - crisp typography */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="text-6xl md:text-7xl lg:text-9xl font-extrabold text-foreground dark:text-white mb-10 leading-[1.1] tracking-[-0.02em]"
          >
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="block mb-2"
            >
              Chat Smarter.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="block mb-2"
            >
              Create Faster.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.6, type: "spring", stiffness: 200 }}
              className="block gradient-text mt-3"
            >
              Powered by AI.
            </motion.span>
          </motion.h1>

          {/* Professional Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="text-xl md:text-2xl lg:text-3xl text-muted-foreground dark:text-white/70 mb-14 max-w-4xl mx-auto leading-relaxed font-light"
          >
            All-in-one AI platform for chat, images, and videos — powered by the
            world's best models.
          </motion.p>

          {/* Professional Input - crisp and modern */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="mb-14 max-w-4xl mx-auto"
          >
            <div className="relative group">
              {/* Animated glow effect */}
              <motion.div
                className="absolute -inset-1 rounded-full opacity-0 group-focus-within:opacity-100 blur-2xl transition-opacity duration-500"
                style={{
                  background: "linear-gradient(135deg, rgba(124, 58, 237, 0.4), rgba(59, 130, 246, 0.4), rgba(236, 72, 153, 0.4))",
                }}
                animate={{
                  opacity: [0, 0.6, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              
              {/* Input container - professional glass morphism */}
              <motion.div
                className="relative flex items-center gap-4 backdrop-blur-2xl bg-card dark:bg-white/5 border border-border dark:border-white/10 text-foreground dark:text-white px-8 py-6 rounded-2xl shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300"
                whileHover={{ 
                  borderColor: "rgba(124, 58, 237, 0.3)",
                  boxShadow: "0 12px 40px rgba(124, 58, 237, 0.15)",
                  scale: 1.01,
                }}
                whileFocus={{ 
                  borderColor: "rgba(124, 58, 237, 0.5)",
                  boxShadow: "0 12px 40px rgba(124, 58, 237, 0.25)",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSubmit();
                    }
                  }}
                  placeholder="Ask Me Anything..."
                  className="flex-1 bg-transparent text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-white/40 focus:outline-none text-lg md:text-xl font-medium"
                />
                <motion.button
                  onClick={handleSubmit}
                  disabled={!input.trim()}
                  className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                  title="Submit"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowRight className="w-6 h-6 text-foreground dark:text-white" />
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* 3 CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Chat Agent Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, #A855F7, #3B82F6, #22D3EE, #34D399, #FACC15, #FB7185)",
                }}
              />
              <div
                className="rounded-xl p-[2px]"
                style={{
                  background: "linear-gradient(135deg, #A855F7, #3B82F6, #22D3EE, #34D399, #FACC15, #FB7185)",
                  backgroundSize: "200% 200%",
                }}
              >
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="h-full w-full"
                >
                  <motion.div
                    className="relative flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #6366F1, #3B82F6, #06B6D4, #10B981, #84CC16, #F59E0B, #EF4444)",
                      backgroundSize: "200% 200%",
                      color: "#E5E7EB",
                    }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <Link
                      href="/auth/sign-in"
                      className="relative flex items-center gap-2 w-full h-full"
                    >
                      <MessageSquare className="w-5 h-5 relative z-10" style={{ color: "#E5E7EB" }} />
                      <span className="relative z-10">Chat Agent</span>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Image Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, #A855F7, #3B82F6, #22D3EE, #34D399, #FACC15, #FB7185)",
                }}
              />
              <div
                className="rounded-xl p-[2px]"
                style={{
                  background: "linear-gradient(135deg, #A855F7, #3B82F6, #22D3EE, #34D399, #FACC15, #FB7185)",
                  backgroundSize: "200% 200%",
                }}
              >
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                  }}
                  className="h-full w-full"
                >
                  <motion.div
                    className="relative flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #6366F1, #3B82F6, #06B6D4, #10B981, #84CC16, #F59E0B, #EF4444)",
                      backgroundSize: "200% 200%",
                      color: "#E5E7EB",
                    }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    }}
                  >
                    <Link
                      href="/auth/sign-in"
                      className="relative flex items-center gap-2 w-full h-full"
                    >
                      <Image className="w-5 h-5 relative z-10" style={{ color: "#E5E7EB" }} />
                      <span className="relative z-10">Image</span>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>

            {/* Video Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="relative group"
            >
              <motion.div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, #A855F7, #3B82F6, #22D3EE, #34D399, #FACC15, #FB7185)",
                }}
              />
              <div
                className="rounded-xl p-[2px]"
                style={{
                  background: "linear-gradient(135deg, #A855F7, #3B82F6, #22D3EE, #34D399, #FACC15, #FB7185)",
                  backgroundSize: "200% 200%",
                }}
              >
                <motion.div
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4,
                  }}
                  className="h-full w-full"
                >
                  <motion.div
                    className="relative flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #6366F1, #3B82F6, #06B6D4, #10B981, #84CC16, #F59E0B, #EF4444)",
                      backgroundSize: "200% 200%",
                      color: "#E5E7EB",
                    }}
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4,
                    }}
                  >
                    <Link
                      href="/auth/sign-in"
                      className="relative flex items-center gap-2 w-full h-full"
                    >
                      <Video className="w-5 h-5 relative z-10" style={{ color: "#E5E7EB" }} />
                      <span className="relative z-10">Video</span>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* Professional Stats - crisp cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
            className="flex items-center justify-center gap-8 md:gap-16 mt-24 pt-16 border-t border-white/10"
          >
            {[
              { value: "5M+", label: "Generations" },
              { value: "50+", label: "AI Models" },
              { value: "200K+", label: "Creators" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center px-8 py-6 rounded-2xl backdrop-blur-2xl bg-card dark:bg-white/5 border border-border dark:border-white/10 hover:bg-accent dark:hover:bg-white/10 transition-all duration-300 min-w-[140px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.8 + index * 0.15 }}
                whileHover={{ 
                  scale: 1.05, 
                  borderColor: "rgba(124, 58, 237, 0.3)",
                  boxShadow: "0 8px 32px rgba(124, 58, 237, 0.2)",
                }}
              >
                <motion.div
                  className="text-4xl md:text-5xl font-extrabold text-foreground dark:text-white mb-2 bg-gradient-to-r from-foreground to-foreground/80 dark:from-white dark:to-white/80 bg-clip-text text-transparent"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 + index * 0.15, type: "spring", stiffness: 200 }}
                >
                  {stat.value}
                </motion.div>
                <div className="text-sm md:text-base text-muted-foreground dark:text-white/60 font-semibold uppercase tracking-wider">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;

