import { motion } from "framer-motion";

interface UserAvatarProps {
  user: { id: string; role?: string; username?: string; email?: string } | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showBorder?: boolean;
}

const UserAvatar = ({ user, size = "md", className = "", showBorder = true }: UserAvatarProps) => {
  const getUserInitial = () => {
    if (!user) return 'U';
    // Priority: username > email > role > id
    return user.username?.[0]?.toUpperCase() || 
           user.email?.[0]?.toUpperCase() || 
           user.role?.[0]?.toUpperCase() || 
           user.id?.[0]?.toUpperCase() || 
           'U';
  };

  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-12 h-12 text-lg",
    xl: "w-20 h-20 sm:w-24 sm:h-24 text-3xl sm:text-4xl",
  };

  const borderRadiusClasses = {
    sm: "rounded-full",
    md: "rounded-full",
    lg: "rounded-xl",
    xl: "rounded-2xl",
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <div className={`${sizeClasses[size]} ${borderRadiusClasses[size]} bg-gradient-to-br from-primary to-accent flex items-center justify-center font-bold text-white shadow-lg ${size === 'xl' ? 'p-0' : ''}`}>
        {getUserInitial()}
      </div>
      {showBorder && (
        <motion.div
          className={`absolute inset-0 ${borderRadiusClasses[size]}`}
          style={{
            padding: size === 'xl' ? '2px' : '1px',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.6), rgba(59, 130, 246, 0.6), rgba(34, 211, 238, 0.6), rgba(236, 72, 153, 0.6))',
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
      )}
    </div>
  );
};

export default UserAvatar;

