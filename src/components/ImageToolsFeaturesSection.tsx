"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

const imageModels = [
  { id: 1, title: "Text2Image", description: "Generate stunning images from text prompts using advanced AI models.", image: "/feeds/image1.jpg" },
  { id: 2, title: "Image2Image", description: "Transform and modify existing images with AI-powered conversion.", image: "/feeds/image2.jpg" },
  { id: 3, title: "Background Removal", description: "Instantly remove backgrounds from images with precision and accuracy.", image: "/feeds/image3.png" },
  { id: 4, title: "Avatar Generation", description: "Create unique AI-generated avatars and profile pictures in various styles.", image: "/feeds/image4.jpg" },
  { id: 5, title: "Upscale", description: "Enhance image resolution and quality with AI-powered upscaling.", image: "/feeds/image5.jpg" },
  { id: 6, title: "Object Removal", description: "Remove unwanted elements from images seamlessly with AI filling.", image: "/feeds/image6.jpg" },
  { id: 7, title: "Content Creation", description: "Create engaging visual content for social media and marketing.", image: "/feeds/image7.jpg" },
];

const ImageToolsFeaturesSection = () => {
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
            <h2 className="text-[2.5rem] md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight text-foreground mb-2">
              Image Tool <span className="purple-gradient-text">Showcase</span>
            </h2>
            <p className="mt-1 text-base font-light text-muted-foreground max-w-2xl hidden md:block">
              Discover how cutting-edge AI transforms your creative workflow.
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
            {[...imageModels, ...imageModels].map((model, index) => (
              <ImageCardItem key={`${model.id}-${index}`} model={model} />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .purple-gradient-text {
          background: linear-gradient(to right, #a855f7, #7c3aed);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </section>
  );
};

const ImageCardItem = ({ model }: { model: any }) => {
  return (
    <div
      className="group relative flex-shrink-0 w-[280px] md:w-[340px] h-[400px] rounded-[2rem] overflow-hidden bg-card dark:bg-black border border-border/50 dark:border-white/5 transition-all duration-700 hover:border-purple-500/40 hover:-translate-y-2"
    >
      <img
        src={model.image}
        alt={model.title}
        className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000 ease-out"
        draggable={false}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-90" />
      
      <div className="absolute inset-x-0 bottom-0 p-5 z-30">
          <div className="relative p-5 rounded-[1.5rem] bg-white/80 dark:bg-white/5 backdrop-blur-md border border-border/50 dark:border-white/10 overflow-hidden transition-all duration-500 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20 group-hover:border-purple-500/30">
          
          {/* Purple Glow Dot */}
          <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-purple-500 opacity-50 group-hover:animate-ping" />

          <h3 className="text-xl font-bold text-foreground dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
            {model.title}
          </h3>
          
          <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400 leading-snug line-clamp-2 group-hover:text-foreground/80 dark:group-hover:text-gray-200 transition-colors">
            {model.description}
          </p>
        </div>
      </div>

      {/* Purple Edge Glow on hover */}
      <div className="absolute inset-0 border-[2px] border-transparent group-hover:border-purple-500/20 rounded-[2rem] transition-all duration-700 pointer-events-none" />
      
      {/* Radial Purple Flare */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.15),transparent_70%)]" />
    </div>
  );
};

export default ImageToolsFeaturesSection;