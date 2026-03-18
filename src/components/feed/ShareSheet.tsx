import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, MessageCircle, Mail, Twitter, Facebook, Instagram, Copy, QrCode } from "lucide-react";
import { toast } from "sonner";

interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number | string;
}

const shareOptions = [
  { id: "copy", label: "Copy Link", icon: Link2, color: "bg-secondary" },
  { id: "qr", label: "QR Code", icon: QrCode, color: "bg-secondary" },
  { id: "message", label: "Message", icon: MessageCircle, color: "bg-green-500" },
  { id: "email", label: "Email", icon: Mail, color: "bg-blue-500" },
  { id: "twitter", label: "Twitter", icon: Twitter, color: "bg-sky-500" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "bg-blue-600" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500" },
];

const quickShareUsers = [
  { id: 1, username: "alex_design", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" },
  { id: 2, username: "maya_creates", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
  { id: 3, username: "john_ai", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100" },
  { id: 4, username: "sarah_art", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
  { id: 5, username: "dev_mike", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
];

const ShareSheet = ({ isOpen, onClose, itemId }: ShareSheetProps) => {
  const handleShare = (optionId: string) => {
    if (optionId === "copy") {
      navigator.clipboard.writeText(`https://aeko.ai/creation/${itemId}`);
      toast.success("Link copied to clipboard!");
    } else if (optionId === "qr") {
      toast.success("QR Code generated!");
    } else {
      toast.success(`Opening ${optionId}...`);
    }
    onClose();
  };

  const handleQuickShare = (username: string) => {
    toast.success(`Shared with @${username}!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-50"
          />
          
          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 glass-card rounded-t-3xl z-50"
          >
            {/* Handle */}
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-4">
              <span className="font-semibold text-lg text-foreground">Share</span>
              <button onClick={onClose} className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Quick Share */}
            <div className="px-4 pb-4">
              <p className="text-sm text-muted-foreground mb-3">Quick share</p>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {quickShareUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleQuickShare(user.username)}
                    className="flex flex-col items-center gap-2 flex-shrink-0"
                  >
                    <div className="relative">
                      <img 
                        src={user.avatar} 
                        alt={user.username}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground truncate w-16 text-center">
                      {user.username}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Share Options */}
            <div className="px-4 pb-6">
              <p className="text-sm text-muted-foreground mb-3">Share to</p>
              <div className="grid grid-cols-4 gap-4">
                {shareOptions.map(option => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleShare(option.id)}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className={`w-14 h-14 rounded-full ${option.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Copy Link Button */}
            <div className="px-4 pb-6">
              <button
                onClick={() => handleShare("copy")}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <Copy className="w-5 h-5 text-foreground" />
                <span className="font-medium text-foreground">Copy Link</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ShareSheet;
