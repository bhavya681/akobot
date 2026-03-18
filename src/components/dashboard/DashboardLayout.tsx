"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Compass,
  User,
  HelpCircle,
  Menu,
  X,
  LogOut,
  CreditCard,
  ChevronDown,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Sun,
  Moon,
  Store,
  Briefcase,
  BarChart3,
  Puzzle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import UserAvatar from "@/components/UserAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";

const navItems = [
  { path: "/dashboard", icon: Home, label: "Home" },
  { path: "/dashboard/feed", icon: Compass, label: "Feed" },
  { path: "/dashboard/support", icon: HelpCircle, label: "Support" },
];

const toolsSubItems = [
  { path: "/dashboard/tools-old/image", icon: ImageIcon, label: "Image" },
  { path: "/dashboard/tools-old/video", icon: Video, label: "Video" },
];

// Shared classes for sidebar nav icons
const navIconBase =
  "flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full border bg-gradient-to-br from-purple-900/40 via-purple-950/40 to-background/10 shadow-sm transition-all duration-200";
const navIconActive =
  "gradient-active-nav text-foreground border-primary/70 shadow-[0_0_0_1px_rgba(129,140,248,0.8)]";
const navIconInactive =
  "text-muted-foreground border-purple-500/40 hover:text-foreground hover:border-primary/60 hover:bg-accent/40 dark:hover:bg-accent/40";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("You have been logged out");
    } catch (error: any) {
      toast.error(error.message || "Error during logout");
    }
  };

  return (
    <div className="min-h-screen bg-background flex w-full overflow-x-hidden mx-[1px]">
      {/* Sidebar - Icon Only with Tooltips */}
      <TooltipProvider>
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-14 sm:w-16 transform transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Subtle Animated Border - Purple accent */}
          <motion.div
            className="absolute inset-0 rounded-r-2xl pointer-events-none opacity-60"
            style={{
              padding: '1px',
              background: 'linear-gradient(135deg, rgba(126, 34, 206, 0.5), rgba(139, 92, 246, 0.5), rgba(168, 85, 247, 0.4))',
              backgroundSize: '200% 200%',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
          
          <div className="flex flex-col h-full rounded-r-2xl relative z-10 overflow-hidden sidebar-header-match border-r border-purple-600/40 dark:border-purple-500/30 bg-gradient-to-b from-purple-700 via-purple-800 to-purple-950 dark:from-purple-800 dark:via-purple-900 dark:to-purple-950 backdrop-blur-xl shadow-[4px_0_24px_-4px_rgba(126,34,206,0.25)]">
            {/* Subtle purple gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-violet-950/20 pointer-events-none rounded-r-2xl" />
            <div className="relative z-10 flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center justify-center py-3 sm:py-4 md:py-5 border-b border-purple-500/30 dark:border-purple-400/20 relative">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Logo size="md" href="/" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>AEKO.AI</p>
                </TooltipContent>
              </Tooltip>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Navigation - Icon Only with Tooltips */}
            <nav className="flex-1 px-1.5 sm:px-2 py-4 sm:py-6 space-y-1 overflow-y-auto">
              {/* 1. Home */}
              {navItems.filter(item => item.path === "/dashboard").map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`${navIconBase} ${isActive ? navIconActive : navIconInactive}`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.85, rotate: -5 }}
                          className="relative"
                          animate={isActive ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0],
                          } : {}}
                          transition={{
                            duration: 0.3,
                            ease: 'easeInOut',
                          }}
                        >
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 stroke-2 transition-all ${isActive ? 'text-primary dark:text-primary font-semibold' : 'text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground'}`} />
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-md"
                              animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                          )}
                          {/* Click Animation Effect - Theme Aware */}
                          <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-xl"
                            initial={{ scale: 0, opacity: 0 }}
                            whileTap={{ 
                              scale: [0, 2, 2.5, 0],
                              opacity: [0, 1, 0.8, 0]
                            }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                          {/* Secondary Ring on Click */}
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-primary/50"
                            initial={{ scale: 1, opacity: 0 }}
                            whileTap={{ 
                              scale: [1, 2, 2.5],
                              opacity: [0, 0.9, 0]
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </motion.div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* 2. ToolCase (moved up, after Home) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.85, rotate: -5 }}
                    className="relative"
                  >
                    <Link
                      href="/dashboard/tools"
                      onClick={() => setSidebarOpen(false)}
                      className={`${navIconBase} ${
                        pathname === "/dashboard/tools" ? navIconActive : navIconInactive
                      }`}
                    >
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 stroke-2 text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground" />
                      {pathname === "/dashboard/tools" && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-md"
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      {/* Click Animation Effect - Theme Aware */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-xl"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ 
                          scale: [0, 2, 2.5, 0],
                          opacity: [0, 1, 0.8, 0]
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      {/* Secondary Ring on Click */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/50"
                        initial={{ scale: 1, opacity: 0 }}
                        whileTap={{ 
                          scale: [1, 2, 2.5],
                          opacity: [0, 0.9, 0]
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </Link>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>ToolCase</p>
                </TooltipContent>
              </Tooltip>

              {/* 3. Feed */}
              {navItems.filter(item => item.path === "/dashboard/feed").map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`${navIconBase} ${isActive ? navIconActive : navIconInactive}`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.85, rotate: -5 }}
                          className="relative"
                          animate={isActive ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0],
                          } : {}}
                          transition={{
                            duration: 0.3,
                            ease: 'easeInOut',
                          }}
                        >
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 stroke-2 transition-all ${isActive ? 'text-primary dark:text-primary font-semibold' : 'text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground'}`} />
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-md"
                              animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                          )}
                          {/* Click Animation Effect - Theme Aware */}
                          <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-xl"
                            initial={{ scale: 0, opacity: 0 }}
                            whileTap={{ 
                              scale: [0, 2, 2.5, 0],
                              opacity: [0, 1, 0.8, 0]
                            }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                          {/* Secondary Ring on Click */}
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-primary/50"
                            initial={{ scale: 1, opacity: 0 }}
                            whileTap={{ 
                              scale: [1, 2, 2.5],
                              opacity: [0, 0.9, 0]
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </motion.div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}

              {/* 4. Agent LLM (Chat) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/tools-old/agent"
                    onClick={() => setSidebarOpen(false)}
                    className={`${navIconBase} ${
                      pathname === "/dashboard/tools-old/agent" ? navIconActive : navIconInactive
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.85, rotate: -5 }}
                      className="relative"
                      animate={pathname === "/dashboard/tools-old/agent" ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0],
                      } : {}}
                      transition={{
                        duration: 0.3,
                        ease: 'easeInOut',
                      }}
                    >
                      <MessageSquare className={`w-4 h-4 sm:w-5 sm:h-5 stroke-2 transition-all ${pathname === "/dashboard/tools-old/agent" ? 'text-primary dark:text-primary font-semibold' : 'text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground'}`} />
                      {pathname === "/dashboard/tools-old/agent" && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-md"
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-xl"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ 
                          scale: [0, 2, 2.5, 0],
                          opacity: [0, 1, 0.8, 0]
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/50"
                        initial={{ scale: 1, opacity: 0 }}
                        whileTap={{ 
                          scale: [1, 2, 2.5],
                          opacity: [0, 0.9, 0]
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </motion.div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Agent LLM</p>
                </TooltipContent>
              </Tooltip>

              {/* 5. Agent Store */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.85, rotate: -5 }}
                    className="relative"
                  >
                    <Link
                      href="/dashboard/agent-store"
                      onClick={() => setSidebarOpen(false)}
                      className={`${navIconBase} ${
                        pathname === "/dashboard/agent-store" ? navIconActive : navIconInactive
                      }`}
                    >
                      <Store className="w-4 h-4 sm:w-5 sm:h-5 stroke-2 text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground" />
                      {/* Click Animation Effect - Theme Aware */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-xl"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ 
                          scale: [0, 2, 2.5, 0],
                          opacity: [0, 1, 0.8, 0]
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      {/* Secondary Ring on Click */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/50"
                        initial={{ scale: 1, opacity: 0 }}
                        whileTap={{ 
                          scale: [1, 2, 2.5],
                          opacity: [0, 0.9, 0]
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </Link>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Agent Store</p>
                </TooltipContent>
              </Tooltip>

              {/* 6. Integrations (Tool Use Case) */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.85, rotate: -5 }}
                    className="relative"
                  >
                    <Link
                      href="/dashboard/tool-usecase"
                      onClick={() => setSidebarOpen(false)}
                      className={`${navIconBase} ${
                        pathname === "/dashboard/tool-usecase" ? navIconActive : navIconInactive
                      }`}
                    >
                      <Puzzle className="w-4 h-4 sm:w-5 sm:h-5 stroke-2 text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground" />
                      {pathname === "/dashboard/tool-usecase" && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-md"
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-xl"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ 
                          scale: [0, 2, 2.5, 0],
                          opacity: [0, 1, 0.8, 0]
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/50"
                        initial={{ scale: 1, opacity: 0 }}
                        whileTap={{ 
                          scale: [1, 2, 2.5],
                          opacity: [0, 0.9, 0]
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </Link>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Tool Use Case</p>
                </TooltipContent>
              </Tooltip>

              {/* 7. Image Tools */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/tools-old/image"
                    onClick={() => setSidebarOpen(false)}
                    className={`${navIconBase} ${
                      pathname === "/dashboard/tools-old/image" ? navIconActive : navIconInactive
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.85, rotate: -5 }}
                      className="relative"
                      animate={pathname === "/dashboard/tools-old/image" ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0],
                      } : {}}
                      transition={{
                        duration: 0.3,
                        ease: 'easeInOut',
                      }}
                    >
                      <ImageIcon className={`w-4 h-4 sm:w-5 sm:h-5 stroke-2 transition-all ${pathname === "/dashboard/tools-old/image" ? 'text-primary dark:text-primary font-semibold' : 'text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground'}`} />
                      {pathname === "/dashboard/tools-old/image" && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-md"
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-xl"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ 
                          scale: [0, 2, 2.5, 0],
                          opacity: [0, 1, 0.8, 0]
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/50"
                        initial={{ scale: 1, opacity: 0 }}
                        whileTap={{ 
                          scale: [1, 2, 2.5],
                          opacity: [0, 0.9, 0]
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </motion.div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Image Tools</p>
                </TooltipContent>
              </Tooltip>

              {/* 8. Video Tools */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/dashboard/tools-old/video"
                    onClick={() => setSidebarOpen(false)}
                    className={`${navIconBase} ${
                      pathname === "/dashboard/tools-old/video" ? navIconActive : navIconInactive
                    }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15, rotate: 5 }}
                      whileTap={{ scale: 0.85, rotate: -5 }}
                      className="relative"
                      animate={pathname === "/dashboard/tools-old/video" ? {
                        scale: [1, 1.2, 1],
                        rotate: [0, 5, -5, 0],
                      } : {}}
                      transition={{
                        duration: 0.3,
                        ease: 'easeInOut',
                      }}
                    >
                      <Video className={`w-4 h-4 sm:w-5 sm:h-5 stroke-2 transition-all ${pathname === "/dashboard/tools-old/video" ? 'text-primary dark:text-primary font-semibold' : 'text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground'}`} />
                      {pathname === "/dashboard/tools-old/video" && (
                        <motion.div
                          className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-md"
                          animate={{
                            opacity: [0.3, 0.6, 0.3],
                            scale: [1, 1.2, 1],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        />
                      )}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-xl"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ 
                          scale: [0, 2, 2.5, 0],
                          opacity: [0, 1, 0.8, 0]
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/50"
                        initial={{ scale: 1, opacity: 0 }}
                        whileTap={{ 
                          scale: [1, 2, 2.5],
                          opacity: [0, 0.9, 0]
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </motion.div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Video Tools</p>
                </TooltipContent>
              </Tooltip>

              {/* 9. Support */}
              {navItems.filter(item => item.path === "/dashboard/support").map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`${navIconBase} ${isActive ? navIconActive : navIconInactive}`}
                      >
                        <motion.div
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.85, rotate: -5 }}
                          className="relative"
                          animate={isActive ? {
                            scale: [1, 1.2, 1],
                            rotate: [0, 5, -5, 0],
                          } : {}}
                          transition={{
                            duration: 0.3,
                            ease: 'easeInOut',
                          }}
                        >
                          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 stroke-2 transition-all ${isActive ? 'text-primary dark:text-primary font-semibold' : 'text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground'}`} />
                          {isActive && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-md"
                              animate={{
                                opacity: [0.3, 0.6, 0.3],
                                scale: [1, 1.2, 1],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              }}
                            />
                          )}
                          {/* Click Animation Effect - Theme Aware */}
                          <motion.div
                            className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-xl"
                            initial={{ scale: 0, opacity: 0 }}
                            whileTap={{ 
                              scale: [0, 2, 2.5, 0],
                              opacity: [0, 1, 0.8, 0]
                            }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                          {/* Secondary Ring on Click */}
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-primary/50"
                            initial={{ scale: 1, opacity: 0 }}
                            whileTap={{ 
                              scale: [1, 2, 2.5],
                              opacity: [0, 0.9, 0]
                            }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                          />
                        </motion.div>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="px-1.5 sm:px-2 pb-2 sm:pb-3 space-y-1 border-t border-purple-500/30 dark:border-purple-400/20 pt-2 sm:pt-3 mt-auto">
              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    onClick={toggleTheme}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.85, rotate: -5 }}
                    className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 dark:hover:bg-accent/50 transition-all"
                    title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  >
                    {theme === "dark" ? (
                      <Sun className="w-4 h-4 sm:w-5 sm:h-5 stroke-2 text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground" />
                    ) : (
                      <Moon className="w-4 h-4 sm:w-5 sm:h-5 stroke-2 text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground" />
                    )}
                    {/* Bright Click Animation Effect */}
                    <motion.div
                      className="absolute inset-0 rounded-full bg-white blur-xl"
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ 
                        scale: [0, 2, 2.5, 0],
                        opacity: [0, 1, 0.8, 0]
                      }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                    {/* Secondary Bright Ring on Click */}
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-white"
                      initial={{ scale: 1, opacity: 0 }}
                      whileTap={{ 
                        scale: [1, 2, 2.5],
                        opacity: [0, 0.9, 0]
                      }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
                </TooltipContent>
              </Tooltip>

            

              {/* Account Icon */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.85, rotate: -5 }}
                    className="relative"
                  >
                    <Link
                      href="/dashboard/account"
                      className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 dark:hover:bg-accent/50 transition-all"
                    >
                      <UserAvatar user={user} size="md" />
                      {/* Click Animation Effect - Theme Aware */}
                      <motion.div
                        className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30 blur-xl"
                        initial={{ scale: 0, opacity: 0 }}
                        whileTap={{ 
                          scale: [0, 2, 2.5, 0],
                          opacity: [0, 1, 0.8, 0]
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                      {/* Secondary Ring on Click */}
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary/50"
                        initial={{ scale: 1, opacity: 0 }}
                        whileTap={{ 
                          scale: [1, 2, 2.5],
                          opacity: [0, 0.9, 0]
                        }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </Link>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Account</p>
                </TooltipContent>
              </Tooltip>

              {/* Logout */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    type="button"
                    onClick={handleLogout}
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    whileTap={{ scale: 0.85, rotate: -5 }}
                    className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 dark:hover:bg-accent/50 transition-all"
                  >
                    <LogOut className="w-4 h-4 sm:w-5 sm:h-5 stroke-2 text-foreground/70 dark:text-foreground/70 font-medium hover:text-foreground dark:hover:text-foreground" />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-primary/20 dark:bg-primary/30"
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 1.5, opacity: [0.5, 0] }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </div>
            </div>
          </div>
        </aside>
      </TooltipProvider>

      {/* Main Content */}
      <div className="flex-1 lg:ml-14 xl:ml-16 overflow-x-hidden">
        {/* Mobile Menu Button - Floating */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-3 left-3 sm:top-4 sm:left-4 z-50 p-2.5 sm:p-3 rounded-xl bg-card border border-border shadow-lg text-foreground hover:bg-accent/50 dark:hover:bg-accent/50 transition-colors"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Page Content */}
        <main className="p-1 lg:p-2">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
