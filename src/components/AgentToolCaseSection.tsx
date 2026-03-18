"use client";

import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Bot, Globe, Briefcase, GraduationCap, HeadphonesIcon, Cloud, Bell, Shield, StickyNote } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  description: string;
  status: "UNPUBLISHED" | "PUBLISHED";
  pricing: "FREE" | "PAID";
  iconName?: string;
  coverGradient?: string;
  createdAt: Date;
  interactions?: number;
  category?: string;
}

const agentModels: Agent[] = [
  {
    id: "reminder",
    name: "Reminder Agent",
    description: "Smart reminder assistant to help you manage schedules and important reminders",
    coverGradient: "from-slate-900 via-slate-800 to-slate-900",
    iconName: "Bell",
    status: "PUBLISHED",
    pricing: "FREE",
    createdAt: new Date(),
    interactions: 2500,
    category: "Reminder",
  },
  {
    id: "mom",
    name: "MOM Agent",
    description: "Automatically generates meeting minutes with key decisions and action items",
    coverGradient: "from-slate-900 via-slate-800 to-slate-900",
    iconName: "StickyNote",
    status: "PUBLISHED",
    pricing: "FREE",
    createdAt: new Date(),
    interactions: 1800,
    category: "Meeting",
  },
  {
    id: "support",
    name: "Support Agent",
    description: "24/7 customer support assistant for instant responses and issue resolution",
    coverGradient: "from-slate-900 via-slate-800 to-slate-900",
    iconName: "HeadphonesIcon",
    status: "PUBLISHED",
    pricing: "FREE",
    createdAt: new Date(),
    interactions: 3200,
    category: "Support",
  },
  {
    id: "cnergee",
    name: "Cnergee",
    description: "Integrated network security products—SD-WAN, NGFW, Managed WiFi",
    coverGradient: "from-slate-900 via-slate-800 to-slate-900",
    iconName: "Shield",
    status: "PUBLISHED",
    pricing: "FREE",
    createdAt: new Date(),
    interactions: 1250,
    category: "Business",
  },
  {
    id: "instagram",
    name: "Instagram",
    description: "Social media assistant for Instagram management and engagement",
    coverGradient: "from-slate-900 via-slate-800 to-slate-900",
    iconName: "Globe",
    status: "PUBLISHED",
    pricing: "FREE",
    createdAt: new Date(),
    interactions: 890,
    category: "Social",
  },
  {
    id: "yamaha",
    name: "Yamaha Motor India",
    description: "Motorcycle and scooter information assistant for Yamaha vehicles",
    coverGradient: "from-slate-900 via-slate-800 to-slate-900",
    iconName: "Briefcase",
    status: "PUBLISHED",
    pricing: "FREE",
    createdAt: new Date(),
    interactions: 2100,
    category: "Automotive",
  },
  {
    id: "iitroorkee",
    name: "IIT Roorkee",
    description: "Technical research university information assistant",
    coverGradient: "from-slate-900 via-slate-800 to-slate-900",
    iconName: "GraduationCap",
    status: "PUBLISHED",
    pricing: "FREE",
    createdAt: new Date(),
    interactions: 1560,
    category: "Education",
  },
  {
    id: "cloudsupport",
    name: "Cloud Support",
    description: "Help users raise support requests on Scogo Cloud Platform",
    coverGradient: "from-slate-900 via-slate-800 to-slate-900",
    iconName: "Cloud",
    status: "PUBLISHED",
    pricing: "FREE",
    createdAt: new Date(),
    interactions: 980,
    category: "Support",
  },
  {
    id: "globalnet",
    name: "Globalnet",
    description: "ICT Solutions and infrastructure information",
    coverGradient: "from-slate-900 via-slate-800 to-slate-900",
    iconName: "Bot",
    status: "PUBLISHED",
    pricing: "FREE",
    createdAt: new Date(),
    interactions: 750,
    category: "Technology",
  },
];

const AgentToolCaseSection = () => {
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
              Agent Tool <span className="agent-gradient-text">Showcase</span>
            </h2>
            <p className="mt-1 text-base font-light text-muted-foreground max-w-2xl hidden md:block">
              Explore powerful AI agents designed to automate and enhance your workflows.
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
            {[...agentModels, ...agentModels].map((model, index) => (
              <AgentCardItem key={`${model.id}-${index}`} model={model} />
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .agent-gradient-text {
          background: linear-gradient(to right, #3b82f6, #06b6d4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </section>
  );
};

const AgentCardItem = ({ model }: { model: Agent }) => {
  return (
    <div
      className="group relative flex-shrink-0 w-[280px] md:w-[320px] h-[340px] rounded-[2rem] overflow-hidden bg-card dark:bg-black border border-border/50 dark:border-white/5 transition-all duration-700 hover:border-blue-500/40 hover:-translate-y-2"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${model.coverGradient || "from-slate-900 via-slate-800 to-slate-900"}`} />
      
      <div className="absolute top-8 inset-x-0 flex justify-center">
        <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 group-hover:bg-white/30 transition-all duration-500">
          {model.iconName === "Bell" && <Bell className="w-20 h-20 text-white" />}
          {model.iconName === "StickyNote" && <StickyNote className="w-20 h-20 text-white" />}
          {model.iconName === "HeadphonesIcon" && <HeadphonesIcon className="w-20 h-20 text-white" />}
          {model.iconName === "Shield" && <Shield className="w-20 h-20 text-white" />}
          {model.iconName === "Globe" && <Globe className="w-20 h-20 text-white" />}
          {model.iconName === "Briefcase" && <Briefcase className="w-20 h-20 text-white" />}
          {model.iconName === "GraduationCap" && <GraduationCap className="w-20 h-20 text-white" />}
          {model.iconName === "Cloud" && <Cloud className="w-20 h-20 text-white" />}
          {model.iconName === "Bot" && <Bot className="w-20 h-20 text-white" />}
          {!model.iconName && <Bot className="w-20 h-20 text-white" />}
        </div>
      </div>
      
      <div className="absolute bottom-4 left-4 right-4 z-30">
          <div className="p-4 rounded-2xl bg-white/95 dark:bg-black/90 backdrop-blur-md border border-white/20 dark:border-white/10">
          <h3 className="text-lg font-bold text-foreground dark:text-white mb-1">
            {model.name}
          </h3>
          
          <p className="text-xs text-muted-foreground dark:text-gray-300 leading-snug line-clamp-2">
            {model.description}
          </p>
        </div>
      </div>

      <div className="absolute inset-0 border-[2px] border-transparent group-hover:border-blue-500/20 rounded-[2rem] transition-all duration-700 pointer-events-none" />
    </div>
  );
};

export default AgentToolCaseSection;
