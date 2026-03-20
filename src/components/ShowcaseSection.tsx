import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Image as ImageIcon, Video, MessageSquare, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const ShowcaseSection = () => {
  const showcaseContent = [
    {
      type: "image",
      url: "/feeds/image1.jpg",
      title: "AI Generated Art",
      icon: ImageIcon,
    },
    {
      type: "video",
      url: "/feeds/video2.mp4", // Ensure this file exists in public/feeds/
      title: "AI Video Creation",
      icon: Video,
    },
    {
      type: "chat",
      url: null,
      title: "AI Chat Assistant",
      icon: MessageSquare,
      messages: [
        { role: "user", text: "Create a logo for my startup" },
        { role: "assistant", text: "I'll generate a modern logo design for you!" },
      ],
    },
    {
      type: "image",
      url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80",
      title: "Creative Designs",
      icon: ImageIcon,
    },
  ];

  const profileImages = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&q=80",
  ];

  return (
    <section className="py-14 lg:py-12 relative overflow-hidden w-full bg-white dark:bg-transparent">
      <div className="absolute inset-0 dark:hidden" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.06) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }} />
      <div className="absolute inset-0 hidden dark:block" style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }} />
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Side - Mixed Content Grid */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {showcaseContent.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <div
                    className="relative overflow-hidden rounded-3xl border-4 border-border dark:border-white bg-white dark:bg-black/80 h-64"
                    style={{
                      boxShadow: "0 0 20px rgba(0, 0, 0, 0.1), 0 0 40px rgba(0, 0, 0, 0.05)",
                    }}
                  >
                    {/* Render Image */}
                    {item.type === "image" && item.url && (
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}

                    {/* Render Video - Autoplay, Loop, Muted */}
                    {item.type === "video" && item.url && (
                      <video
                        src={item.url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    )}

                    {/* Render Chat Interface */}
                    {item.type === "chat" && (
                      <div className="w-full h-full p-4 flex flex-col gap-3 bg-white dark:bg-gradient-to-br dark:from-purple-950/30 dark:to-pink-950/30">
                        <div className="flex items-center gap-2 pb-2 border-b border-border/30 dark:border-white/10">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-foreground dark:text-white">AI Assistant</p>
                            <p className="text-xs text-muted-foreground dark:text-white/60">Online</p>
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                          {item.messages?.map((msg, msgIndex) => (
                            <div
                              key={msgIndex}
                              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              {msg.role === "assistant" && (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                  <Bot className="w-3 h-3 text-white" />
                                </div>
                              )}
                              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-xs ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-white dark:bg-white/10 border border-border dark:border-white/20 text-foreground dark:text-white"}`}>
                                {msg.text}
                              </div>
                              {msg.role === "user" && (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-white dark:bg-black/80 backdrop-blur-sm border border-border dark:border-white/20 flex items-center gap-2 z-10">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground dark:text-white uppercase">
                        {item.type}
                      </span>
                    </div>

                    {/* Hover Overlay Effect for Non-Chat Items */}
                    {item.type !== "chat" && (
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-sm font-semibold text-white">{item.title}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Right Side - Content Text */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white dark:bg-gradient-to-br dark:from-purple-500/20 dark:to-pink-500/20 border-2 border-border dark:border-white/30 mb-4"
            >
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-white" />
            </motion.div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground dark:text-white mb-4 tracking-tight leading-tight">
              <span className="bg-gradient-to-r from-foreground via-purple-600 to-pink-600 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                Showcase Your
              </span>
              <br />
              <span className="text-foreground dark:text-white">Creative Work</span>
            </h2>

            <div className="flex items-center gap-2 mb-4">
              {profileImages.map((profile, index) => (
                <img
                  key={index}
                  src={profile}
                  alt={`Profile ${index + 1}`}
                  className="w-10 h-10 rounded-full border-2 border-border dark:border-white/50 object-cover"
                  style={{ marginLeft: index > 0 ? "-8px" : "0" }}
                />
              ))}
              <span className="text-muted-foreground dark:text-white/80 text-sm ml-2">+2.5K creators</span>
            </div>

            <div className="flex items-center gap-8 mb-6">
              <div><div className="text-3xl font-black text-foreground dark:text-white">10M+</div><div className="text-sm text-muted-foreground dark:text-white/70">Generations</div></div>
              <div><div className="text-3xl font-black text-foreground dark:text-white">50K+</div><div className="text-sm text-muted-foreground dark:text-white/70">Active Users</div></div>
              <div><div className="text-3xl font-black text-foreground dark:text-white">99.9%</div><div className="text-sm text-muted-foreground dark:text-white/70">Uptime</div></div>
            </div>

            <p className="text-lg text-muted-foreground dark:text-white/80 leading-relaxed mb-8">
              Join thousands of creators, designers, and developers who are using AKOBOT.AI to bring their creative visions to life. 
              Generate stunning images, create amazing videos, and build powerful AI agents—all in one platform.
            </p>

            <Button size="lg" className="group gap-2 px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-2 border-border dark:border-white/30">
              Start Creating Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;