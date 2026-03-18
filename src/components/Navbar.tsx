"use client";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, MessageSquare, Image, Video, Sparkles, Bot, Plug, Film, Mic, Zap, ChevronDown, User, LogOut, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import UserAvatar from "@/components/UserAvatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { scrollY } = useScroll();
  const { user, isAuthenticated, logout } = useAuth();

  // Track scroll position for Dynamic Island morphing
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const modelsMenuItems = [
    { 
      name: "LLM Agent", 
      icon: MessageSquare, 
      path: "/dashboard/tools-old/agent",
      description: "Chat with AI agents"
    },
    { 
      name: "Image Generation", 
      icon: Image, 
      path: "/dashboard/tools-old/image",
      description: "Create stunning images"
    },
    // { 
    //   name: "Video Generation", 
    //   icon: Video, 
    //   path: "/dashboard/tools-old/video",
    //   description: "Generate videos with AI"
    // },
    { 
      name: "Custom Agent", 
      icon: Sparkles, 
      path: "/dashboard/agent-store",
      description: "Build your own agent"
    },
  ];

  const featuresMenuItems = [
    {
      name: "Custom AI Agent",
      icon: Bot,
      path: "/dashboard/agent-store",
      description: "Build and customize AI agents",
    },
    {
      name: "ToolCase",
      icon: Plug,
      path: "/dashboard/tools",
      description: "Integrate with your favorite tools",
    },
    {
      name: "Image Generation",
      icon: Film,
      path: "/dashboard/tools-old/image",
      description: "Create images with AI",
    },
    // {
    //   name: "Video Generation",
    //   icon: Video,
    //   path: "/dashboard/tools-old/video",
    //   description: "Generate videos with AI",
    // },
    {
      name: "LLM Agent",
      icon: Mic,
      path: "/dashboard/tools-old/agent",
      description: "Interact with voice-enabled AI",
    },
    {
      name: "Multi AI Tool",
      icon: Zap,  
      path: "/dashboard/tools-old/multi-ai",
      description: "Combine multiple models in one tool",
    },
  ];

  const navLinks = [
    { name: "About us", path: "/about" },
    { name: "Pricing", path: "/pricing" },
    { name: "API", href: "/#developers" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-2 md:pt-3"
    >
      {/* Dynamic Island Container */}
      <motion.div
        className="relative"
        animate={{
          width: isExpanded || isOpen ? "100%" : "auto",
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        }}
        style={{
          maxWidth: isExpanded || isOpen ? "100%" : "fit-content",
        }}
      >
        {/* Dynamic Island Capsule */}
        <motion.div
          className="relative mx-auto"
          animate={{
            borderRadius: isScrolled || isOpen ? "20px" : "9999px",
            padding: isScrolled || isOpen ? "0px" : "0px",
            width: isExpanded || isOpen ? "100%" : "auto",
          }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {/* Glass Background with Blur - theme-aware gradient */}
          <motion.div
            className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-700 to-purple-900 dark:from-purple-700 dark:via-purple-800 dark:to-purple-950 backdrop-blur-xl border border-purple-400/50 dark:border-purple-500/40"
            animate={{
              backdropFilter: "blur(20px) saturate(180%)",
              borderRadius: isScrolled || isOpen ? "20px" : "9999px",
              boxShadow: isScrolled || isOpen
                ? "0 8px 32px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)"
                : "0 4px 20px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)",
            }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1],
            }}
          >
            {/* Subtle Gradient Overlay - Theme Aware */}
            <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-primary/5 dark:via-transparent dark:to-transparent bg-gradient-to-br from-indigo-50/30 via-blue-50/20 to-purple-50/30 pointer-events-none" 
              style={{ borderRadius: isScrolled || isOpen ? "20px" : "9999px" }}
            />
            {/* Subtle Animated Gradient Border - Only visible on hover/focus */}
            <motion.div
              className="absolute inset-0 rounded-full opacity-0 dark:opacity-30"
              style={{
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(14, 165, 233, 0.3), rgba(34, 197, 94, 0.3), rgba(236, 72, 153, 0.3))",
                backgroundSize: "200% 200%",
                borderRadius: "inherit",
                padding: "1px",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "xor",
                maskComposite: "exclude",
              }}
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                borderRadius: isScrolled || isOpen ? "20px" : "9999px",
              }}
              transition={{
                backgroundPosition: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                },
                borderRadius: {
                  duration: 0.4,
                  ease: [0.4, 0, 0.2, 1],
                },
              }}
            />

            {/* Content Container */}
            <div className="relative px-3 sm:px-4 md:px-6 py-1.5 md:py-2 z-10">
              <div className="flex items-center justify-between gap-2 sm:gap-4 md:gap-6 lg:gap-8">
                {/* Left Side - Logo */}
                <motion.div 
                  className="flex items-center cursor-pointer relative z-20"
                  onClick={() => router.push("/")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="relative w-24 md:w-28 h-10 flex items-center overflow-visible">
                    <AnimatePresence mode="wait">
                      <motion.img 
                        key={theme}
                        src="/ako_dark.png"
                        alt="AKO.ai Logo" 
                        animate={{
                          opacity: 1,
                          scale: (isExpanded || isOpen) ? 1.5 : 1.3, 
                          x: (isExpanded || isOpen) ? 1 : 0,
                        }}
                        className="absolute left-0 h-auto w-full max-w-[130px] origin-left object-contain" 
                      />
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Right Side - All Nav Links + CTA */}
                <div className="hidden sm:flex items-center gap-2 md:gap-4 lg:gap-6">
                  {/* Models Dropdown */}
                  <DropdownMenu 
                  // onOpenChange={(open) => setIsExpanded(open)}
                    >
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        className="text-xs md:text-sm cursor-pointer text-white hover:text-white/90 transition-colors duration-200 flex items-center gap-1.5 px-2 md:px-3 py-1.5 rounded-lg hover:bg-white/10"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Models
                        <ChevronDown className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 md:w-64 backdrop-blur-xl bg-card dark:bg-card border border-border shadow-xl">
                      {modelsMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className="cursor-pointer hover:bg-accent/50 dark:hover:bg-accent/50 transition-colors"
                          >
                            <Icon className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{item.name}</span>
                              <span className="text-xs text-muted-foreground">{item.description}</span>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Features Dropdown */}
                  <DropdownMenu 
                  // onOpenChange={(open) => setIsExpanded(open)}
                  >
                    <DropdownMenuTrigger asChild>
                      <motion.button
                        className="text-xs cursor-pointer sm:text-sm text-white hover:text-white/90 transition-colors duration-200 flex items-center gap-1.5 px-2 sm:px-3 py-1 rounded-lg hover:bg-white/10"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Features
                        <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                      </motion.button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 md:w-64 backdrop-blur-xl bg-card dark:bg-card border border-border shadow-xl">
                      {featuresMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem
                            key={item.path}
                            onClick={() => router.push(item.path)}
                            className="cursor-pointer hover:bg-accent/50 dark:hover:bg-accent/50 transition-colors"
                          >
                            <Icon className="w-4 h-4 mr-2 text-primary" aria-hidden="true" />
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{item.name}</span>
                              <span className="text-xs text-muted-foreground">{item.description}</span>
                            </div>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {navLinks.map((link) =>
                    link.path ? (
                      <motion.button
                        key={link.name}
                        onClick={() => router.push(link.path!)}
                        className="text-xs cursor-pointer md:text-sm text-white hover:text-white/90 transition-colors duration-200 px-2 md:px-3 py-1.5 rounded-lg hover:bg-white/10"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {link.name}
                      </motion.button>
                    ) : (
                      <motion.a
                        key={link.name}
                        href={link.href}
                        className="text-xs md:text-sm cursor-pointer text-white hover:text-white/90 transition-colors duration-200 px-2 md:px-3 py-1.5 rounded-lg hover:bg-white/10"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {link.name}
                      </motion.a>
                    )
                  )}
                  
                  {/* Theme Toggle - Desktop */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={toggleTheme}
                          whileHover={{ scale: 1.15, rotate: 5 }}
                          whileTap={{ scale: 0.85, rotate: -5 }}
                          className="relative flex cursor-pointer items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full text-white hover:text-white/90 hover:bg-white/10 transition-all"
                          title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                        >
                          {theme === "dark" ? (
                            <Sun className="w-4 h-4 sm:w-5 sm:h-5 stroke-2 text-white" />
                          ) : (
                            <Moon className="w-4 h-4 sm:w-5 sm:h-5 stroke-2 text-white" />
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
                      <TooltipContent side="bottom">
                        <p>{theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  {isAuthenticated ? (
                    <>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push("/dashboard")}
                          className="text-white cursor-pointer hover:text-white/90 hover:bg-white/10 text-xs md:text-sm px-2 md:px-4"
                        >
                          Dashboard
                        </Button>
                      </motion.div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <motion.button
                            className="flex cursor-pointer items-center gap-2 px-2 md:px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <UserAvatar user={user} size="md" />
                            <span className="text-xs md:text-sm text-white hidden md:inline">
                              {user?.username || user?.email?.split('@')[0] || user?.role || 'User'}
                            </span>
                            <ChevronDown className="w-3 h-3 hidden md:block text-white" />
                          </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="cursor-pointer w-56 backdrop-blur-xl bg-card dark:bg-card border border-border shadow-xl">
                          <div className="px-2 py-1.5">
                            <p className="text-sm font-medium text-foreground">{user?.username || user?.email || user?.role || 'User'}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email || `ID: ${user?.id?.slice(0, 8) || 'N/A'}...`}</p>
                          </div>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => router.push("/dashboard/account")}
                            className="cursor-pointer cursor-pointer hover:bg-accent/50 dark:hover:bg-accent/50"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Account Settings
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => router.push("/dashboard")}
                            className="cursor-pointer hover:bg-accent/50 dark:hover:bg-accent/50"
                          >
                            <Zap className="w-4 h-4 mr-2" />
                            Dashboard
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={async () => {
                              try {
                                await logout();
                                toast.success("Logged out successfully");
                              } catch (error: any) {
                                toast.error(error.message || "Error logging out");
                              }
                            }}
                            className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  ) : (
                    <>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/auth/sign-in")}
                      className="text-white hover:text-white/90 hover:bg-white/10 text-xs md:text-sm px-2 md:px-4"
                    >
                      Sign In
                    </Button>
                  </motion.div>
                  
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => router.push("/auth/sign-in")}
                      className="bg-white text-purple-900 hover:bg-white/90 font-semibold shadow-lg text-xs md:text-sm px-2 md:px-4"
                    >
                      Start Creating
                    </Button>
                  </motion.div>
                    </>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <motion.button
                  onClick={() => setIsOpen(!isOpen)}
                  className="sm:hidden p-2 text-white rounded-lg hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Mobile Menu - Expanded from Dynamic Island */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-16 sm:top-20 left-2 right-2 sm:left-4 sm:right-4 sm:hidden z-40"
          >
            <motion.div
              className="backdrop-blur-2xl bg-card/95 dark:bg-card/95 border border-border rounded-2xl shadow-2xl overflow-hidden relative"
              initial={{ borderRadius: "9999px" }}
              animate={{ borderRadius: "20px" }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Subtle Gradient Overlay - Theme Aware */}
              <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-primary/5 dark:via-transparent dark:to-transparent bg-gradient-to-br from-indigo-50/30 via-blue-50/20 to-purple-50/30 rounded-2xl pointer-events-none" />
              <div className="relative z-10 px-4 sm:px-6 py-4 sm:py-6 space-y-3 sm:space-y-4 max-h-[85vh] overflow-y-auto">
                {/* Mobile Models Menu */}
                <div>
                  <div className="text-sm font-semibold text-foreground dark:text-white mb-3 px-2">Models</div>
                  <div className="space-y-1">
                    {modelsMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <motion.a
                          key={item.path}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsOpen(false);
                            router.push(item.path);
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground dark:text-white hover:text-foreground dark:hover:text-white/90 hover:bg-accent/50 dark:hover:bg-white/10 transition-colors"
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className="w-4 h-4 text-primary dark:text-white" />
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground dark:text-white">{item.name}</span>
                            <span className="text-xs text-muted-foreground dark:text-white/70">{item.description}</span>
                          </div>
                        </motion.a>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Features Menu */}
                <div>
                  <div className="text-sm font-semibold text-foreground dark:text-white mb-3 px-2">Features</div>
                  <div className="space-y-1">
                    {featuresMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <motion.a
                          key={item.path}
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsOpen(false);
                            router.push(item.path);
                          }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-foreground dark:text-white hover:text-foreground dark:hover:text-white/90 hover:bg-accent/50 dark:hover:bg-white/10 transition-colors"
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Icon className="w-4 h-4 text-primary dark:text-white" />
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground dark:text-white">{item.name}</span>
                            <span className="text-xs text-muted-foreground dark:text-white/70">{item.description}</span>
                          </div>
                        </motion.a>
                      );
                    })}
                  </div>
                </div>

                {navLinks.map((link) =>
                  link.path ? (
                    <motion.button
                      key={link.name}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(link.path!);
                      }}
                      className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-foreground dark:text-white hover:text-foreground dark:hover:text-white/90 hover:bg-accent/50 dark:hover:bg-white/10 transition-colors"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.name}
                    </motion.button>
                  ) : (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="block px-3 py-2.5 rounded-lg text-sm text-foreground dark:text-white hover:text-foreground dark:hover:text-white/90 hover:bg-accent/50 dark:hover:bg-white/10 transition-colors"
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {link.name}
                    </motion.a>
                  )
                )}
                
                {/* Mobile Theme Toggle */}
                <div className="pt-4 border-t border-border dark:border-white/20">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          onClick={toggleTheme}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="relative flex items-center justify-center w-full py-3 rounded-lg text-foreground dark:text-white hover:text-foreground dark:hover:text-white/90 hover:bg-accent/50 dark:hover:bg-white/10 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            {theme === "dark" ? (
                              <Sun className="w-5 h-5 stroke-2 text-foreground dark:text-white" />
                            ) : (
                              <Moon className="w-5 h-5 stroke-2 text-foreground dark:text-white" />
                            )}
                            <span className="font-medium">
                              {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            </span>
                          </div>
                          {/* Bright Click Animation Effect */}
                          <motion.div
                            className="absolute inset-0 rounded-lg bg-white blur-xl"
                            initial={{ scale: 0, opacity: 0 }}
                            whileTap={{ 
                              scale: [0, 2, 2.5, 0],
                              opacity: [0, 1, 0.8, 0]
                            }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                          />
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{theme === "dark" ? "Light Mode" : "Dark Mode"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="pt-4 border-t border-border dark:border-white/20 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <div className="px-3 py-2 mb-2">
                        <p className="text-sm font-medium text-foreground dark:text-white">{user?.username || user?.email || user?.role || 'User'}</p>
                        <p className="text-xs text-muted-foreground dark:text-white/70 truncate">{user?.email || `ID: ${user?.id?.slice(0, 8) || 'N/A'}...`}</p>
                      </div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="ghost"
                          className="w-full justify-center text-foreground dark:text-white hover:text-foreground dark:hover:text-white/90 hover:bg-accent/50 dark:hover:bg-white/10"
                          onClick={() => {
                            setIsOpen(false);
                            router.push("/dashboard");
                          }}
                        >
                          Dashboard
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="ghost"
                          className="w-full justify-center text-foreground dark:text-white hover:text-foreground dark:hover:text-white/90 hover:bg-accent/50 dark:hover:bg-white/10"
                          onClick={() => {
                            setIsOpen(false);
                            router.push("/dashboard/account");
                          }}
                        >
                          Account Settings
                        </Button>
                      </motion.div>
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          className="w-full justify-center text-foreground dark:text-white hover:bg-accent/50 dark:hover:bg-white/10 hover:text-foreground dark:hover:text-white border-border dark:border-white/20"
                          onClick={async () => {
                            setIsOpen(false);
                            try {
                              await logout();
                              toast.success("Logged out successfully");
                            } catch (error: any) {
                              toast.error(error.message || "Error logging out");
                            }
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-2 text-foreground dark:text-white" />
                          Logout
                        </Button>
                      </motion.div>
                    </>
                  ) : (
                    <>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-foreground dark:text-white hover:text-foreground dark:hover:text-white/90 hover:bg-accent/50 dark:hover:bg-white/10"
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/auth/sign-in");
                      }}
                    >
                      Sign In
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="default"
                      className="w-full bg-white text-purple-900 hover:bg-white/90 font-semibold"
                      onClick={() => {
                        setIsOpen(false);
                        router.push("/auth/sign-in");
                      }}
                    >
                      Start Creating
                    </Button>
                  </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
