"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const videoModels = [
  { id: 1, title: "T2Video", description: "Generate stunning cinematic videos from simple text prompts.", video: "/feeds/video1.mp4" },
  { id: 2, title: "AI Editing", description: "Transform and modify existing video clips with AI precision.", video: "/feeds/video2.mp4" },
  { id: 3, title: "Video Upscale", description: "Enhance video resolution and clarity up to 4K quality.", video: "/feeds/video11.mp4" },
  { id: 4, title: "Motion Synthesis", description: "Add realistic motion and fluid animations to static scenes.", video: "/feeds/video4.mp4" },
  { id: 5, title: "Style Transfer", description: "Apply artistic styles and cinematic filters to your footage.", video: "/feeds/video5.mp4" },
  { id: 6, title: "Frame Interpolation", description: "Create buttery smooth slow-motion by generating extra frames.", video: "/feeds/video6.mp4" },
  { id: 7, title: "Video2Video", description: "Transform one video into another with AI-powered conversion.", video: "/feeds/video7.mp4" },
  { id: 8, title: "Video2Image", description: "Convert video clips into stunning high-res images.", video: "/feeds/video8.mp4" },
  { id: 9, title: "Image2Video", description: "Bring your images to life by transforming them into dynamic videos.", video: "/feeds/video9.mp4" },
];

const VideoToolsFeaturesSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const autoScrollRef = useRef<number | null>(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const autoScroll = () => {
      if (!scrollElement || isPaused) return;
      const { scrollLeft, scrollWidth } = scrollElement;
      const halfWidth = scrollWidth / 2;

      if (scrollLeft >= halfWidth) {
        scrollElement.scrollLeft = 0;
      } else {
        // Reduced from 1.5 to 0.8 for a much smoother, slower "luxury" scroll
        scrollElement.scrollLeft += 0.8; 
      }
    };

    autoScrollRef.current = window.setInterval(autoScroll, 16);
    return () => { if (autoScrollRef.current) clearInterval(autoScrollRef.current); };
  }, [isPaused]);

  return (
    <section className="relative py-12 w-full overflow-x-clip bg-white dark:bg-transparent">
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
      <div className="container mx-auto relative z-10 px-4">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap items-center gap-5 mb-2">
              <h2 className="text-[2.5rem] md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-foreground">
                Video Tool <span className="gradient-text">Showcase</span>
              </h2>
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white text-base font-bold shadow-lg shadow-purple-500/25">
                Coming Soon
              </span>
            </div>
            <p className="mt-1 text-base font-light text-muted-foreground max-w-2xl hidden md:block">
              Slow-scrolling cinematic previews of our core AI video capabilities.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="flex gap-4 overflow-x-auto scrollbar-hide py-8 px-4"
          >
            {[...videoModels, ...videoModels].map((model, index) => (
              <VideoCardItem key={`${model.id}-${index}`} model={model} />
            ))}
          </div>
        </div>
      </div>
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </section>
  );
};

const VideoCardItem = ({ model }: { model: any }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => videoRef.current?.play().catch(() => {});
  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group relative flex-shrink-0 w-[280px] md:w-[340px] h-[400px] rounded-[2rem] overflow-hidden bg-card dark:bg-black border border-border/50 dark:border-white/5 transition-all duration-700 hover:border-primary/40 hover:-translate-y-2"
    >
      {/* Video Content - Slightly zoomed for "fill" effect */}
      <video
        ref={videoRef}
        src={model.video}
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
      />
      
      {/* Sophisticated Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
      
      {/* Card Content */}
      <div className="absolute inset-x-0 bottom-0 p-5 z-30">
        <div className="relative p-5 rounded-[1.5rem] bg-white/80 dark:bg-white/5 backdrop-blur-md border border-border/50 dark:border-white/10 overflow-hidden transition-all duration-500 group-hover:bg-white/90 dark:group-hover:bg-white/10 group-hover:border-primary/30">
          
          {/* Animated Glow Dot */}
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-primary opacity-50 group-hover:animate-ping" />

          <h3 className="text-xl font-bold text-foreground dark:text-white mb-1 group-hover:text-primary transition-colors duration-300">
            {model.title}
          </h3>
          
          <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400 leading-snug line-clamp-2 group-hover:text-foreground/80 dark:group-hover:text-gray-200 transition-colors">
            {model.description}
          </p>

        </div>
      </div>

      {/* Edge Glow effect on hover */}
      <div className="absolute inset-0 border-[2px] border-primary/0 group-hover:border-primary/20 rounded-[2rem] transition-all duration-700 pointer-events-none" />
    </div>
  );
};

export default VideoToolsFeaturesSection;