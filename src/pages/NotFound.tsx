"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-blue-50/30 to-purple-50/50 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-indigo-900/20 pointer-events-none" />
      
      {/* Floating gradient orbs */}
      <motion.div
        className="absolute top-20 left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Logo */}
          <motion.div
            className="flex justify-center mb-8"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Animated Border */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  padding: '3px',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.8), rgba(14, 165, 233, 0.8), rgba(34, 197, 94, 0.8), rgba(250, 204, 21, 0.8), rgba(251, 146, 60, 0.8), rgba(236, 72, 153, 0.8))',
                  backgroundSize: '200% 200%',
                  WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              <div className="absolute inset-[3px] rounded-full overflow-hidden bg-white dark:bg-slate-900 shadow-xl ring-2 ring-black/10 dark:ring-white/20 flex items-center justify-center p-1.5">
                <img 
                  src="/logo.png" 
                  alt="AEKO" 
                  className="w-full h-full object-contain object-center" 
                />
              </div>
            </div>
          </motion.div>

          {/* 404 Text with Gradient */}
          <motion.h1
            className="text-9xl md:text-[12rem] font-bold mb-4 gradient-text"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            404
          </motion.h1>

          {/* Error Message */}
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-foreground mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Page Not Found
          </motion.h2>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Oops! The page you're looking for seems to have wandered off into the digital void. 
            Let's get you back on track.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Button
              onClick={() => router.push("/")}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg px-8"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="border-border hover:bg-accent/50 px-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound;
