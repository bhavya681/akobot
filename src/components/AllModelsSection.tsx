"use client";
import { motion } from "framer-motion";
import { Video, Image as ImageIcon, ArrowRight, Sparkles, Zap, Bot, Bell, HeadphonesIcon, StickyNote } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useEffect } from "react";

const AllModelsSection = () => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Professional smooth infinite scroll functionality
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollPosition = 0;
    const scrollSpeed = 1.5; 
    let animationFrameId: number;
    let isPaused = false;
    let lastTime = performance.now();

    const autoScroll = (currentTime: number) => {
      if (!scrollContainer || isPaused) {
        animationFrameId = requestAnimationFrame(autoScroll);
        return;
      }

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      const scrollDelta = (scrollSpeed * deltaTime) / 16; 
      
      const singleSetWidth = scrollContainer.scrollWidth / 3;
      const maxScroll = singleSetWidth;
      
      if (scrollPosition < maxScroll) {
        scrollPosition += scrollDelta;
        scrollContainer.scrollLeft = scrollPosition;
      } else {
        scrollPosition = 0;
        scrollContainer.scrollLeft = 0;
      }
      
      animationFrameId = requestAnimationFrame(autoScroll);
    };
    
    const handleMouseEnter = () => { isPaused = true; };
    const handleMouseLeave = () => { isPaused = false; lastTime = performance.now(); };
    
    scrollContainer.addEventListener('mouseenter', handleMouseEnter);
    scrollContainer.addEventListener('mouseleave', handleMouseLeave);
    
    animationFrameId = requestAnimationFrame(autoScroll);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (scrollContainer) {
        scrollContainer.removeEventListener('mouseenter', handleMouseEnter);
        scrollContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const galleryContent = [
    { id: 1, url: "/feeds/image1.jpg", title: "Cosmic Astronaut", type: "image" },
    { id: 2, url: "/feeds/image2.jpg", title: "Galactic Mystic", type: "image" },
    { id: 3, url: "/feeds/image3.png", title: "Fantasy Character", type: "image" },
    { id: 30, url: "", title: "Reminder Agent", type: "agent", iconName: "Bell", coverGradient: "from-slate-900 via-slate-800 to-slate-900" },
    { id: 4, url: "/feeds/image4.jpg", title: "Epic Hero", type: "image" },
    { id: 5, url: "/feeds/image5.jpg", title: "Neon Dreams", type: "image" },
    { id: 6, url: "/feeds/image6.jpg", title: "Cosmic Scene", type: "image" },
    { id: 31, url: "", title: "MOM Agent", type: "agent", iconName: "StickyNote", coverGradient: "from-slate-900 via-slate-800 to-slate-900" },
    { id: 7, url: "/feeds/image7.jpg", title: "Fantasy World", type: "image" },
    { id: 8, url: "/feeds/image8.jpg", title: "Anime Style", type: "image" },
    { id: 9, url: "/feeds/image9.jpg", title: "Cyberpunk City", type: "image" },
    { id: 10, url: "/feeds/video1.mp4", title: "Video Content", type: "video" },
    { id: 32, url: "", title: "Support Agent", type: "agent", iconName: "HeadphonesIcon", coverGradient: "from-slate-900 via-slate-800 to-slate-900" },
    { id: 11, url: "/feeds/image10.jpg", title: "Portrait Art", type: "image" },
    { id: 12, url: "/feeds/image11.jpg", title: "Modern Design", type: "image" },
    { id: 13, url: "/feeds/image12.png", title: "Creative Art", type: "image" },
    { id: 14, url: "/feeds/image13.jpg", title: "Futuristic Design", type: "image" },
    { id: 15, url: "/feeds/video3.mp4", title: "Mahadev", type: "video" },
  ];

  const duplicatedContent = [...galleryContent, ...galleryContent, ...galleryContent];

  return (
    
    <section className="relative overflow-hidden w-full py-8 lg:py-12 bg-background">
      <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }} >
        <motion.div
          className="absolute inset-0 opacity-10 dark:opacity-20"
          style={{
            background: "radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.2) 0%, transparent 50%)",
          }}
          animate={{ opacity: [0.08, 0.15, 0.08], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-card/60 dark:bg-white/5 backdrop-blur-xl border border-border/50 dark:border-white/10 mb-6"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Premium Models</span>
            <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-foreground dark:text-white mb-4 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-foreground via-purple-600 to-pink-600 dark:from-white dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
              ALL the Great AI Video & Image Models
            </span>
            <br />
            <span className="text-foreground dark:text-white">in ONE Place!</span>
          </h2>
          <motion.div
            className="flex items-center justify-center gap-2 mt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-muted-foreground text-lg">Powered by cutting-edge AI technology</span>
            <Zap className="w-5 h-5 text-yellow-400" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5 text-purple-400" />
              </motion.div>
              <h3 className="text-2xl md:text-3xl font-black text-foreground dark:text-white">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Community Feeds
                </span>
              </h3>
            </div>
            <Link
              href="/dashboard/feed"
              className="hidden md:flex items-center gap-2 text-muted-foreground dark:text-white/80 hover:text-foreground dark:hover:text-white transition-colors group text-sm font-semibold"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="relative overflow-hidden rounded-3xl bg-card/30 dark:bg-black/20 backdrop-blur-sm border border-border/30 dark:border-white/10 p-4">
            <div className="absolute left-0 top-0 bottom-0 w-32 md:w-40 bg-gradient-to-r from-background via-background/90 to-transparent dark:from-[#0a0a0f] dark:via-[#0a0a0f]/90 z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-32 md:w-40 bg-gradient-to-l from-background via-background/90 to-transparent dark:from-[#0a0a0f] dark:via-[#0a0a0f]/90 z-10 pointer-events-none" />
            
            <div
              ref={scrollRef}
              className="flex overflow-x-hidden scrollbar-hide pb-4 gap-5 md:gap-6"
              style={{
                scrollBehavior: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                willChange: 'scroll-position',
              }}
            >
              {duplicatedContent.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  className="relative group cursor-pointer flex-shrink-0"
                  onClick={() => router.push("/dashboard/feed")}
                  whileHover={{ scale: 1.03, y: -8 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ willChange: 'transform' }}
                >
                  <div className="relative w-72 h-80 md:w-96 md:h-[500px] overflow-hidden rounded-2xl border-2 border-border/40 dark:border-white/20 bg-card dark:bg-gradient-to-br dark:from-[#0a0a0a]/95 dark:to-[#1a1a1a]/95 backdrop-blur-xl shadow-lg dark:shadow-2xl transition-all duration-300 group-hover:border-primary/60 dark:group-hover:border-white/40">
                    <div className="relative w-full h-full overflow-hidden">
                      {item.type === "agent" ? (
                        <>
                          <div className={`absolute inset-0 bg-gradient-to-br ${item.coverGradient || "from-slate-900 via-slate-800 to-slate-900"}`} />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-28 h-28 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                              {item.iconName === "Bell" && <Bell className="w-16 h-16 text-white" />}
                              {item.iconName === "StickyNote" && <StickyNote className="w-16 h-16 text-white" />}
                              {item.iconName === "HeadphonesIcon" && <HeadphonesIcon className="w-16 h-16 text-white" />}
                              {!item.iconName && <Bot className="w-16 h-16 text-white" />}
                            </div>
                          </div>
                        </>
                      ) : item.type === "image" ? (
                        <motion.img
                          src={item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          whileHover={{ scale: 1.08 }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          loading="lazy"
                        />
                      ) : (
                        <video
                          src={item.url}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {item.type === "image" && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent dark:from-black/80 dark:via-black/20 opacity-80 dark:opacity-60 group-hover:opacity-60 dark:group-hover:opacity-40 transition-opacity duration-300" />
                      )}
                      
                      {item.type === "video" && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent dark:from-black/80 dark:via-black/20 opacity-80 dark:opacity-60 group-hover:opacity-60 dark:group-hover:opacity-40 transition-opacity duration-300" />
                      )}
                      
                      {item.type === "agent" && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent dark:from-black/60 dark:via-black/10 opacity-60" />
                      )}
                      
                      {item.type === "image" && (
                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-gradient-to-t from-black/98 via-black/85 to-transparent dark:from-black/95 dark:via-black/80">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-500/20 dark:bg-blue-500/30">
                            <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                          </div>
                          <p className="text-white font-bold text-sm md:text-base truncate leading-tight drop-shadow-lg">{item.title}</p>
                        </div>
                      </div>
                      )}

                      {item.type === "video" && (
                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-gradient-to-t from-black/98 via-black/85 to-transparent dark:from-black/95 dark:via-black/80">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-red-500/20 dark:bg-red-500/30">
                            <Video className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />
                          </div>
                          <p className="text-white font-bold text-sm md:text-base truncate leading-tight drop-shadow-lg">{item.title}</p>
                        </div>
                      </div>
                      )}

                      {item.type === "agent" && (
                      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 bg-gradient-to-t from-black/98 via-black/85 to-transparent dark:from-black/95 dark:via-black/80">
                        <div className="flex items-center gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-500/20 dark:bg-blue-500/30">
                            {item.iconName === "Bell" && <Bell className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />}
                            {item.iconName === "StickyNote" && <StickyNote className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />}
                            {item.iconName === "HeadphonesIcon" && <HeadphonesIcon className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />}
                            {!item.iconName && <Bot className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0" />}
                          </div>
                          <p className="text-white font-bold text-lg md:text-xl truncate leading-tight drop-shadow-lg">{item.title}</p>
                        </div>
                      </div>
                      )}
                    </div>
                    
                    {item.type === "image" && (
                    <motion.div 
                      className="absolute top-4 left-4 px-3.5 py-2 bg-background/95 dark:bg-black/80 backdrop-blur-xl text-foreground dark:text-white text-xs font-extrabold border-2 border-border/60 dark:border-white/30 rounded-xl z-10 shadow-xl uppercase tracking-wider"
                      whileHover={{ scale: 1.08 }}
                    >
                      <span className="flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" />Image</span>
                    </motion.div>
                    )}

                    {item.type === "video" && (
                    <motion.div 
                      className="absolute top-4 left-4 px-3.5 py-2 bg-background/95 dark:bg-black/80 backdrop-blur-xl text-foreground dark:text-white text-xs font-extrabold border-2 border-border/60 dark:border-white/30 rounded-xl z-10 shadow-xl uppercase tracking-wider"
                      whileHover={{ scale: 1.08 }}
                    >
                      <span className="flex items-center gap-1.5"><Video className="w-3.5 h-3.5" />Video</span>
                    </motion.div>
                    )}

                    {item.type === "agent" && (
                    <motion.div 
                      className="absolute top-4 left-4 px-3.5 py-2 bg-background/95 dark:bg-black/80 backdrop-blur-xl text-foreground dark:text-white text-xs font-extrabold border-2 border-border/60 dark:border-white/30 rounded-xl z-10 shadow-xl uppercase tracking-wider"
                      whileHover={{ scale: 1.08 }}
                    >
                      <span className="flex items-center gap-1.5"><Bot className="w-3.5 h-3.5" />Agent</span>
                    </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AllModelsSection;