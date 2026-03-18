"use client";

import { motion } from "framer-motion";
import Link from "next/link"; 

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  href?: string;
}

const Logo = ({ size = "md", showText = false, className = "", href = "/" }: LogoProps) => {
  // Significantly increased width and height values
  const sizeClasses = {
    sm: "w-8 h-8 md:w-8 md:h-8",
    md: "w-10 h-10 md:w-10 md:h-10", // Medium is now much larger
    lg: "w-12 h-12 md:w-12 md:h-12", // Large is now a hero size
  };

  return (
    <motion.div
      className={`flex items-center gap-3 flex-shrink-0 ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link href={href} className="flex items-center gap-3">
        <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
          

          {/* Logo Container - Purely transparent */}
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src="/logo.png"
              alt="AEKO"
              // scale-150 makes the logo much bigger relative to the border
              className="w-full h-full object-contain scale-150 drop-shadow-xl"
            />
          </div>
        </div>

        {showText && (
          <div className="flex flex-col leading-tight">
            <span className="text-xl md:text-2xl font-black tracking-tighter text-foreground">
              AEKO.
              <motion.span
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #3B82F6, #22D3EE, #EC4899)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
                animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              >
                AI
              </motion.span>
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

export default Logo;