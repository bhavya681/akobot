"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Bot, ArrowLeft, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { authAPI } from "@/lib/api";
import Logo from "@/components/Logo";

const AuthSignIn = () => {
  const router = useRouter();
  const { login, register, refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const showcaseImages = [
    "/feeds/image1.jpg",
    "/feeds/image3.png",
    "/feeds/image8.jpg",
    "/feeds/image14.jpg",
    "/feeds/image15.jpg",
    "/feeds/image16.jpg",
    "/feeds/image17.jpg",
    "/feeds/image18.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % showcaseImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [showcaseImages.length]);
  
  // Sequential message animation state for 6 agents grid
  const [visibleMessages, setVisibleMessages] = useState<Record<string, number>>({});
  
  // AI Agents Data
  const aiAgents = [
    {
      id: "support",
      name: "AKOBOT AI Support",
      initial: "S",
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/20",
      borderColor: "border-pink-500/30",
      messages: [
        { role: "assistant", content: "Hello, how can I assist you?", time: "06:18 PM" },
        { role: "user", content: "Can you raise a ticket for me?", time: "06:18 PM" },
      ],
    },
    {
      id: "sales",
      name: "Sales Agent",
      initial: "A",
      color: "from-purple-400 to-purple-600",
      bgColor: "bg-purple-500/20",
      borderColor: "border-purple-500/30",
      messages: [
        { role: "assistant", content: "Hello, how's your day?", time: "06:18 PM" },
        { role: "user", content: "Great!", time: "06:18 PM" },
      ],
    },
    {
      id: "lead",
      name: "Lead Agent",
      initial: "L",
      color: "from-purple-600 to-purple-800",
      bgColor: "bg-purple-700/20",
      borderColor: "border-purple-700/30",
      messages: [
        { role: "assistant", content: "How's your day?", time: "06:18 PM" },
        { role: "user", content: "Great! Can you give me today's leads you fetched?", time: "06:18 PM" },
        { role: "assistant", content: "Here's the list of 10 websites related to our product use case.", time: "06:18 PM" },
      ],
    },
    {
      id: "image",
      name: "Image Creation Agent",
      initial: "I",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/20",
      borderColor: "border-green-500/30",
      messages: [
        { role: "assistant", content: "How's your day?", time: "06:18 PM" },
        { role: "user", content: "Good! Can you generate 50 images for me related to 3D comic Marvel characters and post them to my mail?", time: "06:18 PM" },
        { role: "assistant", content: "Done, I'll do it.", time: "06:18 PM" },
      ],
    },
    {
      id: "content",
      name: "Content Creation Agent",
      initial: "C",
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-500/20",
      borderColor: "border-orange-500/30",
      messages: [
        { role: "assistant", content: "How's your day?", time: "06:18 PM" },
        { role: "user", content: "Hi, I'm good. Can you give me today's report?", time: "06:18 PM" },
        { role: "assistant", content: "Sure, and I'll give you a PDF of the report. Can you share the mail to the following 30 members?", time: "06:18 PM" },
        { role: "user", content: "Share.", time: "06:18 PM" },
      ],
    },
    {
      id: "analytics",
      name: "Data Analytics Agent",
      initial: "D",
      color: "from-purple-700 to-indigo-800",
      bgColor: "bg-purple-800/20",
      borderColor: "border-purple-800/30",
      messages: [
        { role: "assistant", content: "How's it going?", time: "06:18 PM" },
        { role: "user", content: "Good! Can you pull yesterday's metrics?", time: "06:18 PM" },
        { role: "assistant", content: "Here are your key metrics and the summary dashboard.", time: "06:18 PM" },
      ],
    },
  ];

  // Initialize sequential message animations - First agent completes, then next starts
  useEffect(() => {
    const baseDelay = 1000; // Initial delay before first message
    const messageInterval = 800; // Time between messages in same agent
    const agentInterval = 400; // Small gap between agents
    
    let totalDelay = baseDelay;
    
    aiAgents.forEach((agent, agentIndex) => {
      // Each agent's messages appear sequentially
      agent.messages.forEach((_, messageIndex) => {
        const messageDelay = totalDelay + (messageIndex * messageInterval);
        
        setTimeout(() => {
          setVisibleMessages((prev) => ({
            ...prev,
            [`${agent.id}-${messageIndex}`]: messageIndex + 1,
          }));
        }, messageDelay);
      });
      
      // Update total delay for next agent (after all messages of current agent)
      totalDelay += (agent.messages.length * messageInterval) + agentInterval;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (isSignUp) {
      if (!username) {
        toast.error("Please enter a username");
        return;
      }
      if (username.length < 3) {
        toast.error("Username must be at least 3 characters");
        return;
      }
      if (password.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        // Register - backend expects: { username, email, password }
        await register(email, username, password);
        refreshUser(); // Ensure auth state syncs before redirect
        toast.success("Account created successfully!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 150);
      } else {
        // Login - backend expects: { identifier, password }
        await login(email, password);
        refreshUser(); // Ensure auth state syncs before redirect
        toast.success("Logged in successfully!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 150);
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      // Handle validation errors array
      if (error?.message && Array.isArray(error.message)) {
        const errorMessages = error.message.join(", ");
        toast.error(errorMessages);
      } else {
        const errorMessage = error?.message || error?.error || "Authentication failed. Please try again.";
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = forgotEmail.trim();
    if (!emailToUse) {
      toast.error("Please enter your email address");
      return;
    }
    setIsLoading(true);
    try {
      const result = await authAPI.forgotPassword(emailToUse);
      setForgotSuccess(true);
      toast.success(result.message || "If your email is registered, you will receive a password reset link shortly.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setForgotSuccess(false);
        setForgotEmail("");
      }, 4000);
    } catch (error: any) {
      toast.error(error?.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="min-h-screen flex bg-background">
    {/* Left Panel - Login/Signup UI */}
    <div className="w-full lg:w-[480px] bg-background/80 backdrop-blur-xl flex flex-col p-8 lg:p-12 relative z-10 overflow-hidden border-r border-white/5">
      
      {/* Animated Background Glow Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[100px]"
          animate={{ x: [0, 30, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-16"
        >
          <Logo size="lg" showText={true} href="/" />
        </motion.div>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-10"
        >
          <h2 className="text-foreground text-4xl font-bold tracking-tight mb-3">
            {showForgotPassword ? "Reset Password" : isSignUp ? "Get Started" : "Welcome Back"}
          </h2>
          <p className="text-muted-foreground text-base font-medium">
            {showForgotPassword 
              ? "We'll send a link to your email." 
              : isSignUp 
                ? "Join AEKO Creative Suite today" 
                : "Sign in to continue to your dashboard"}
          </p>
        </motion.div>

        <div className="flex-1">
  <AnimatePresence mode="wait">
  {isSuccess ? (
    <motion.div
      key="success-overlay"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-12 space-y-6 text-center"
    >
      <div className="relative">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-primary/30 blur-3xl rounded-full" 
        />
        <div className="relative z-10 w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.5)]">
          <Bot className="w-12 h-12 text-primary" />
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tighter text-white">ACCESS GRANTED</h2>
        <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">Initializing Dashboard...</p>
      </div>
      {/* Progress Bar */}
      <div className="w-full max-w-[200px] h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/10">
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "0%" }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="h-full bg-primary shadow-[0_0_10px_rgba(139,92,246,1)]"
        />
      </div>
    </motion.div>
  ) : (
    <motion.div
      key="auth-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {showForgotPassword ? (
          <motion.div
            key="forgot"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            {forgotSuccess ? (
              <div className="py-8 text-center bg-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 blur-xl pointer-events-none" />
                <Mail className="w-12 h-12 text-primary mx-auto mb-4 animate-bounce relative z-10" />
                <p className="text-foreground font-medium px-4 relative z-10">Check your inbox for the reset link!</p>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                     className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading} 
                  className="w-full h-12 bg-primary font-bold rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ['-150%', '150%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  />
                  <span className="relative z-10">{isLoading ? "Sending..." : "Send Reset Link"}</span>
                </Button>
                <button 
                  type="button" 
                  onClick={() => setShowForgotPassword(false)} 
                  className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </button>
              </form>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="auth"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="space-y-6"
          >
            {/* Toggle */}
            <div className="flex p-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 mb-8">
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${!isSignUp ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${isSignUp ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                     className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
                  {isSignUp ? "Email" : "Email or Username"}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={isSignUp ? "Enter email" : "Enter email or username"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                  {!isSignUp && (
                    <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all relative overflow-hidden group shadow-sm"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                    animate={{ x: ['-150%', '150%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                          transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }}
                        >
                          <Bot className="w-5 h-5 text-primary-foreground" />
                        </motion.div>
                        <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                          Analyzing...
                        </motion.span>
                      </>
                    ) : (
                      isSignUp ? "Create Account" : "Sign In"
                    )}
                  </span>
                </Button>
              </motion.div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )}
</AnimatePresence>
</div>

        {/* Footer App Links */}
        <div className="mt-auto pt-6">
          <p className="text-foreground text-[11px] font-bold uppercase tracking-widest mb-4 text-center opacity-60">Mobile App Coming Soon</p>
          <div className="flex gap-3">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full h-12 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 flex items-center justify-center"
              >       
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm">Google</span>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
              <Button 
                variant="outline" 
                className="w-full h-12 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-gray-800 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="text-sm">Apple</span>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
{/* Right Panel - Full Screen Image Loop */}
<div className="hidden lg:flex flex-1 relative overflow-hidden bg-black">
  
  {/* Full Screen Background Image with Professional Ken Burns Effect */}
  <div className="absolute inset-0">
    <AnimatePresence mode="wait">
      <motion.div
        key={currentImageIndex}
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
        className="absolute inset-0"
      >
        <motion.img 
          src={showcaseImages[currentImageIndex]} 
          alt="AEKO Showcase"
          className="w-full h-full object-cover object-center"
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/feeds/image1.jpg";
          }}
        />
      </motion.div>
    </AnimatePresence>
  </div>

  {/* Gradient Overlays - Multiple layers for depth */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10" />
  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20 z-10" />

  {/* Animated Grain Texture Overlay */}
  <div className="absolute inset-0 z-15 opacity-[0.03] pointer-events-none">
    <div className="absolute inset-0 animate-pulse" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    }} />
  </div>

  {/* Floating Particles Effect */}
  <div className="absolute inset-0 z-15 pointer-events-none overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-white/30 rounded-full"
        initial={{ 
          x: Math.random() * 100 + "%", 
          y: Math.random() * 100 + "%",
          opacity: 0 
        }}
        animate={{ 
          y: [null, "-100%"],
          opacity: [0, 0.6, 0]
        }}
        transition={{ 
          duration: 8 + Math.random() * 4, 
          repeat: Infinity, 
          delay: Math.random() * 5,
          ease: "linear"
        }}
      />
    ))}
  </div>

  {/* Content Section */}
  <div className="absolute bottom-0 left-0 right-0 z-30 p-10 lg:p-14">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="max-w-xl"
    >
      {/* Animated Badge */}
      <motion.div 
        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <motion.div 
          className="w-2 h-2 rounded-full bg-green-400"
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <span className="text-white/90 text-sm font-medium tracking-wide">AI-Powered Platform</span>
      </motion.div>

      <motion.h3 
        className="text-white text-3xl lg:text-4xl font-bold mb-3 leading-tight"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        Create Amazing Content
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
          With Intelligent AI Agents
        </span>
      </motion.h3>

      <motion.p 
        className="text-white/70 text-base lg:text-lg leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        Transform your creative workflow with cutting-edge AI that generates stunning images, videos, and more.
      </motion.p>

      {/* Feature Pills */}
      <motion.div 
        className="flex flex-wrap gap-3 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        {['Images', 'Videos', 'Agents', 'Automation'].map((feature) => (
          <span 
            key={feature}
            className="px-3 py-1.5 bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-white/80 text-xs font-medium"
          >
            {feature}
          </span>
        ))}
      </motion.div>
    </motion.div>
  </div>

  {/* Navigation Dots - Styled */}
  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 p-3 bg-black/20 backdrop-blur-md rounded-full z-40">
    {showcaseImages.map((_, idx) => (
      <motion.button
        key={idx}
        onClick={() => setCurrentImageIndex(idx)}
        className="relative"
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className={`h-2 rounded-full transition-all duration-500 ${
          idx === currentImageIndex 
            ? "w-8 bg-white" 
            : "w-2 bg-white/30 hover:bg-white/50"
        }`}
        />
      </motion.button>
    ))}
  </div>

  {/* Side Progress Bar */}
  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-40">
    {showcaseImages.map((_, idx) => (
      <motion.div
        key={idx}
        className="w-1 rounded-full bg-white/20 overflow-hidden"
        initial={{ height: 8 }}
        animate={{ 
          height: idx === currentImageIndex ? 24 : 8,
          backgroundColor: idx === currentImageIndex ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)"
        }}
        transition={{ duration: 0.3 }}
      >
        {idx === currentImageIndex && (
          <motion.div 
            className="w-full h-full bg-white rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
      </motion.div>
    ))}
  </div>
</div>
  </div>
);
};

export default AuthSignIn;



// import { useState, useRef } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import { Mail, Apple, Chrome } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import { useAuth } from "@/hooks/use-auth";
// import Logo from "@/components/Logo";

// // Video Configuration
// const VIDEO_PLAYLIST = [
//   {
//     src: "/feeds/video19.mp4",
//     title: "AI-Powered Intelligence",
//     description: "Experience the next generation of neural processing. Our agents analyze data in real-time."
//   },
//   {
//     src: "/feeds/video20.mp4",
//     title: "Seamless Integration",
//     description: "Connect your entire workflow with a single click. Automate complex tasks with precision."
//   }
// ];

// const AuthSignIn = () => {
//   const navigate = useNavigate();
//   const { login, register, refreshUser } = useAuth();
//   const [email, setEmail] = useState("");
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [showEmailForm, setShowEmailForm] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
  
//   // Video State Management
//   const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
//   const videoRef = useRef<HTMLVideoElement>(null);

//   const handleVideoEnd = () => {
//     setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEO_PLAYLIST.length);
//   };

//   // Function to slow down video
//   const setSlowMotion = (e: React.SyntheticEvent<HTMLVideoElement>) => {
//     e.currentTarget.playbackRate = 0.5; // 50% speed
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!email || !password) {
//       toast.error("Please fill in all required fields");
//       return;
//     }

//     if (isSignUp && !username) {
//       toast.error("Please enter a username");
//       return;
//     }

//     setIsLoading(true);
//     try {
//       if (isSignUp) {
//         // Register
//         await register(email, username, password);
//         toast.success("Account created successfully!");
//         router.push("/dashboard");
//       } else {
//         // Login
//         await login(email, password);
//         toast.success("Logged in successfully!");
//         router.push("/dashboard");
//       }
//     } catch (error: any) {
//       toast.error(error.message || "Authentication failed. Please try again.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleGoogleSignIn = async () => {
//     try {
//       setIsLoading(true);
//       // Import authAPI for Google login since it's a special case
//       const { authAPI } = await import("@/lib/api");
//       const result = await authAPI.googleLogin();
//       // If redirectUrl is provided, the API will redirect automatically
//       // Otherwise, check if we got tokens directly
//       if (result.accessToken) {
//         // Refresh user from context
//         refreshUser();
//         // Dispatch event to update UI
//         window.dispatchEvent(new Event('auth-storage-change'));
//         toast.success("Logged in with Google!");
//         router.push("/dashboard");
//       }
//     } catch (error: any) {
//       toast.error(error.message || "Google sign-in failed. Please try again.");
//       setIsLoading(false);
//     }
//   };

//   const currentVideo = VIDEO_PLAYLIST[currentVideoIndex];

//   return (
//     <div className="min-h-screen flex bg-background">
//       {/* Left Panel - Login/Signup UI */}
//       <div className="w-full lg:w-[480px] bg-card flex flex-col p-8 lg:p-8 relative z-10 overflow-hidden border-r border-border">
//         {/* Animated Background Glow Effects */}
//         <div className="absolute inset-0 pointer-events-none overflow-hidden">
//           <motion.div
//             className="absolute -top-20 -left-20 w-96 h-96 bg-primary/10 dark:bg-primary/10 rounded-full blur-3xl"
//             animate={{
//               x: [0, 50, 0],
//               y: [0, 30, 0],
//               scale: [1, 1.2, 1],
//             }}
//             transition={{
//               duration: 8,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           />
//           <motion.div
//             className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/10 dark:bg-primary/10 rounded-full blur-3xl"
//             animate={{
//               x: [0, -50, 0],
//               y: [0, -30, 0],
//               scale: [1, 1.2, 1],
//             }}
//             transition={{
//               duration: 10,
//               repeat: Infinity,
//               ease: "easeInOut",
//             }}
//           />
//         </div>
//         <div className="relative z-10 flex flex-col h-full">
//         {/* Logo */}
//         <motion.div
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//           className="mb-12 relative z-10"
//         >
//           <Logo size="lg" showText={true} href="/" />
//         </motion.div>

//         {/* Sign up or Login with */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//           className="mb-8"
//         >
//           <h2 className="text-foreground text-2xl font-semibold mb-1">
//             {isSignUp ? "Create your account" : "Sign up or Login with"}
//           </h2>
//           <p className="text-muted-foreground text-sm">
//             {isSignUp ? "Join AEKO Creative Suite today" : "Get started with AI-powered creativity"}
//           </p>
//         </motion.div>

//         {/* Login Options */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.2 }}
//           className="space-y-3 flex-1"
//         >
//           {/* Google */}
//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Button
//               type="button"
//               variant="outline"
//               disabled={isLoading}
//               className="w-full h-14 bg-secondary hover:bg-secondary/80 dark:bg-[#1F2937] dark:hover:bg-[#374151] border border-border text-foreground justify-start gap-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
//               onClick={handleGoogleSignIn}
//             >
//               <div className="relative z-10 w-7 h-7 rounded-full bg-white dark:bg-white flex items-center justify-center">
//                 <svg className="w-5 h-5" viewBox="0 0 24 24">
//                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
//                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
//                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
//                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
//                 </svg>
//               </div>
//               <span className="font-semibold text-base relative z-10">Google</span>
//             </Button>
//           </motion.div>

//           {/* GitHub */}
//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full h-14 bg-secondary hover:bg-secondary/80 dark:bg-[#0D1117] dark:hover:bg-[#161B22] border border-border text-foreground justify-start gap-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
//               onClick={() => navigate("/dashboard/tools/agent")}
//             >
//               <div className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center">
//                 <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 24 24">
//                   <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/>
//                 </svg>
//               </div>
//               <span className="font-semibold text-base relative z-10">GitHub</span>
//             </Button>
//           </motion.div>

//           {/* Apple */}
//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full h-14 bg-foreground hover:bg-foreground/90 dark:bg-[#000000] dark:hover:bg-[#1C1C1C] text-background dark:text-white justify-start gap-3 rounded-xl transition-all duration-300 border-0 shadow-sm hover:shadow-md"
//               onClick={() => navigate("/dashboard/tools/agent")}
//             >
//               <div className="relative z-10 w-7 h-7 rounded-full bg-background/20 dark:bg-white/10 flex items-center justify-center">
//                 <Apple className="w-5 h-5 text-background dark:text-white" />
//               </div>
//               <span className="font-semibold text-base relative z-10">Apple</span>
//             </Button>
//           </motion.div>

//           {/* Microsoft */}
//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full h-14 bg-secondary hover:bg-secondary/80 dark:bg-[#2F2F2F] dark:hover:bg-[#3A3A3A] border border-border text-foreground justify-start gap-3 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
//               onClick={() => navigate("/dashboard/tools/agent")}
//             >
//               <div className="relative z-10 w-7 h-7 rounded-lg bg-white dark:bg-white flex items-center justify-center">
//                 <div className="w-4 h-4 bg-secondary dark:bg-[#2F2F2F] rounded-sm grid grid-cols-2 gap-0.5">
//                   <div className="bg-[#F25022]"></div>
//                   <div className="bg-[#7FBA00]"></div>
//                   <div className="bg-[#00A4EF]"></div>
//                   <div className="bg-[#FFB900]"></div>
//                 </div>
//               </div>
//               <span className="font-semibold text-base relative z-10">Microsoft</span>
//             </Button>
//           </motion.div>

//           {/* Continue with Email - Main CTA */}
//           <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full h-14 bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] text-white justify-start gap-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 border-0"
//               onClick={() => setShowEmailForm(!showEmailForm)}
//             >
//               <div className="relative z-10 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
//                 <Mail className="w-4 h-4 text-white" />
//               </div>
//               <span className="font-semibold text-base relative z-10">Continue with Email</span>
//             </Button>
//           </motion.div>

//           {/* Email/Password Form - Show when Continue with Email is clicked */}
//           {showEmailForm && (
//             <motion.form
//               initial={{ opacity: 0, height: 0 }}
//               animate={{ opacity: 1, height: "auto" }}
//               exit={{ opacity: 0, height: 0 }}
//               onSubmit={handleSubmit}
//               className="mt-4 space-y-4 p-6 bg-card/90 dark:bg-card/90 rounded-xl border-2 border-border shadow-xl backdrop-blur-sm"
//             >
//               {isSignUp && (
//                 <div>
//                   <Input
//                     type="text"
//                     placeholder="Username"
//                     value={username}
//                     onChange={(e) => setUsername(e.target.value)}
//                     className="h-12 bg-background dark:bg-card/80 border-2 border-border focus:border-primary text-foreground placeholder:text-muted-foreground rounded-lg transition-all duration-300 focus:ring-2 focus:ring-primary/20"
//                   />
//                 </div>
//               )}
//               <div>
//                 <Input
//                   type="email"
//                   placeholder="Email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="h-12 bg-background dark:bg-card/80 border-2 border-border focus:border-primary text-foreground placeholder:text-muted-foreground rounded-lg transition-all duration-300 focus:ring-2 focus:ring-primary/20"
//                 />
//               </div>
//               <div>
//                 <Input
//                   type="password"
//                   placeholder="Password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="h-12 bg-background dark:bg-card/80 border-2 border-border focus:border-primary text-foreground placeholder:text-muted-foreground rounded-lg transition-all duration-300 focus:ring-2 focus:ring-primary/20"
//                 />
//               </div>
//               <div className="flex gap-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setIsSignUp(false)}
//                   className={`flex-1 h-11 border-2 text-foreground font-semibold rounded-lg transition-all duration-300 ${
//                     !isSignUp 
//                       ? "bg-primary/20 dark:bg-primary/30 border-primary shadow-lg shadow-primary/20" 
//                       : "bg-secondary/50 dark:bg-card/60 border-border hover:border-primary/40"
//                   }`}
//                 >
//                   Sign In
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => setIsSignUp(true)}
//                   className={`flex-1 h-11 border-2 text-foreground font-semibold rounded-lg transition-all duration-300 ${
//                     isSignUp 
//                       ? "bg-primary/20 dark:bg-primary/30 border-primary shadow-lg shadow-primary/20" 
//                       : "bg-secondary/50 dark:bg-card/60 border-border hover:border-primary/40"
//                   }`}
//                 >
//                   Sign Up
//                 </Button>
//               </div>
//               <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
//                 <Button
//                   type="submit"
//                   disabled={isLoading}
//                   className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-lg shadow-lg shadow-primary/40 hover:shadow-primary/60 transition-all duration-300 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <motion.div
//                     className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
//                     animate={{
//                       x: ['-100%', '100%'],
//                     }}
//                     transition={{
//                       duration: 2,
//                       repeat: Infinity,
//                       repeatDelay: 1,
//                       ease: "linear",
//                     }}
//                   />
//                   <span className="relative z-10">
//                     {isLoading ? (isSignUp ? "Creating Account..." : "Signing In...") : (isSignUp ? "Create Account" : "Sign In")}
//                   </span>
//                 </Button>
//               </motion.div>
//             </motion.form>
//           )}

//           {/* Need help link */}
//           <div className="pt-4">
//             <Link href="#" className="text-sm font-medium text-primary hover:text-primary/80 transition-all duration-300 inline-flex items-center gap-1 group">
//               Need help?
//               <motion.span
//                 animate={{ x: [0, 4, 0] }}
//                 transition={{ duration: 1.5, repeat: Infinity }}
//                 className="text-primary"
//               >
//                 →
//               </motion.span>
//             </Link>
//           </div>
//         </motion.div>

//         {/* Mobile App Section */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.4 }}
//           className="mt-auto pt-8"
//         >
//           <p className="text-foreground text-sm mb-4 font-medium">Available now on iOS and Android</p>
//           <div className="flex gap-3">
//             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
//               <Button
//                 variant="outline"
//                 className="w-full h-12 bg-primary/20 dark:bg-primary/30 border-2 border-primary/60 hover:border-primary hover:bg-primary/30 dark:hover:bg-primary/40 text-primary-foreground rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
//                 onClick={() => toast.info("App Store link coming soon")}
//               >
//                 <Apple className="w-5 h-5 mr-2" />
//                 <span className="text-xs font-semibold">App Store</span>
//               </Button>
//             </motion.div>
//             <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
//               <Button
//                 variant="outline"
//                 className="w-full h-12 bg-primary/20 dark:bg-primary/30 border-2 border-primary/60 hover:border-primary hover:bg-primary/30 dark:hover:bg-primary/40 text-primary-foreground rounded-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300"
//                 onClick={() => toast.info("Google Play link coming soon")}
//               >
//                 <Chrome className="w-5 h-5 mr-2" />
//                 <span className="text-xs font-semibold">Google Play</span>
//               </Button>
//             </motion.div>
//           </div>
//         </motion.div>
//         </div>
//       </div>

//       {/* Right Panel - Full Screen Video Background with Bottom-Only Shadow */}
//       <div className="hidden lg:block flex-1 relative overflow-hidden bg-black">
//         {/* Cinematic Video Player */}
//         <AnimatePresence mode="popLayout">
//           <motion.div 
//             key={currentVideoIndex}
//             className="absolute inset-0 w-full h-full"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 1.2, ease: "easeInOut" }}
//           >
//             <video
//               ref={videoRef}
//               src={currentVideo.src}
//               className="absolute inset-0 w-full h-full object-cover"
//               autoPlay
//               muted
//               loop={false}
//               playsInline
//               onEnded={handleVideoEnd}
//               onLoadedMetadata={setSlowMotion}
//             />
//           </motion.div>
//         </AnimatePresence>

//         {/* The "Black Shadow" Overlay - RESTRICTED TO BOTTOM 50% */}
//         <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-black via-black/70 to-transparent z-10 pointer-events-none" />
        
//         {/* Content Description Area */}
//         <div className="absolute bottom-0 left-0 right-0 p-12 z-20">
//           <AnimatePresence mode="wait">
//             <motion.div
//               key={currentVideoIndex}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -20 }}
//               transition={{ duration: 0.5, delay: 0.2 }}
//               className="max-w-2xl"
//             >
//               {/* Badge/Tag */}
//               <motion.div 
//                 className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4"
//                 initial={{ width: 0, opacity: 0 }}
//                 animate={{ width: "auto", opacity: 1 }}
//                 transition={{ duration: 0.5 }}
//               >
//                 <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse" />
//                 <span className="text-xs font-medium text-white tracking-wide uppercase">Now Showing</span>
//               </motion.div>

//               {/* Title */}
//               <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
//                 {currentVideo.title}
//               </h1>

//               {/* Description */}
//               <p className="text-lg text-gray-300 leading-relaxed font-light">
//                 {currentVideo.description}
//               </p>
//             </motion.div>
//           </AnimatePresence>

//           {/* Progress Indicators */}
//           <div className="flex gap-2 mt-8">
//             {VIDEO_PLAYLIST.map((_, idx) => (
//               <motion.div
//                 key={idx}
//                 className={`h-1 rounded-full overflow-hidden ${
//                   idx === currentVideoIndex ? "w-16 bg-white" : "w-4 bg-white/20"
//                 }`}
//                 layout
//                 transition={{ duration: 0.3 }}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AuthSignIn;