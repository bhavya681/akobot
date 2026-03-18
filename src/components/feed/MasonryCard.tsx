"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Play, Download, Copy, Bookmark
} from "lucide-react";
import { toast } from "sonner";
import { FeedItem } from "./FeedCard";

interface MasonryCardProps {
  item: FeedItem;
  onLike: (id: number | string) => void;
  onSave: (id: number | string) => void;
  onShare: (id: number | string) => void;
  onOpenComments: (id: number | string) => void;
  onOpenReels?: (id: number | string) => void;
  onClick: (id: number | string) => void;
}

const MasonryCard = ({ 
  item, 
  onLike, 
  onSave, 
  onShare, 
  onOpenComments,
  onOpenReels,
  onClick
}: MasonryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!item.isLiked) {
      onLike(item.id);
    }
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.prompt);
    toast.success("Prompt copied!");
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast.success("Download started!");
  };

  const handleClick = () => {
    // If it's a video, trigger the Reels viewer
    if (item.type === "video") {
      if (onOpenReels) {
        onOpenReels(item.id);
      } else {
        // Fallback if no specific reels handler
        onClick(item.id);
      }
    } else {
      // If it's an image, trigger the Image Detail Modal
      onClick(item.id);
    }
  };

  // Play/Pause video on hover
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  // Varied aspect ratios for masonry effect - more diverse patterns
  const aspectRatios = [
    'aspect-square', 
    'aspect-[3/4]', 
    'aspect-[4/5]', 
    'aspect-[2/3]',
    'aspect-[5/4]',
    'aspect-[4/3]',
    'aspect-[16/9]',
    'aspect-[9/16]'
  ];
  const idNum = typeof item.id === "number" ? item.id : Math.abs([...String(item.id)].reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0));
  const aspectRatio = aspectRatios[idNum % aspectRatios.length];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-lg overflow-hidden cursor-pointer group transition-all duration-300 bg-background"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      <div className={`relative ${aspectRatio} overflow-hidden bg-secondary/50`}>
        
        {/* --- Video / Image Logic --- */}
        {item.type === "video" ? (
          <video
            ref={videoRef}
            src={item.mediaUrl}
            className="w-full h-full object-cover"
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={item.thumbnailUrl || item.mediaUrl}
            alt={item.prompt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        )}

        {/* Video indicator (Only shows when NOT hovering, so user knows it's playable) */}
        {item.type === "video" && !isHovered && (
          <div className="absolute top-2 right-2 z-10">
            <div className="w-7 h-7 rounded-full bg-background/90 backdrop-blur-md border border-border/50 flex items-center justify-center shadow-lg">
              <Play className="w-3.5 h-3.5 text-foreground ml-0.5" />
            </div>
          </div>
        )}

        {/* Hover overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent backdrop-blur-[2px]"
            >
              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-3">
                {/* Author info */}
                <div className="flex items-center gap-2 mb-2">
                  <img 
                    src={item.author.avatar} 
                    alt={item.author.username}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover ring-2 ring-background/50 border border-border/50"
                  />
                  <span className="text-xs sm:text-sm font-semibold text-foreground truncate drop-shadow-sm">
                    {item.author.username}
                  </span>
                  {item.author.verified && (
                    <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-[8px] text-white">✓</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onLike(item.id); }}
                      className="p-1.5 rounded-lg bg-background/70 hover:bg-background/90 backdrop-blur-sm border border-border/50 transition-all hover:scale-110"
                    >
                      <Heart 
                        className={`w-3.5 h-3.5 ${
                          item.isLiked ? 'text-red-500 fill-red-500' : 'text-foreground'
                        }`} 
                      />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onSave(item.id); }}
                      className="p-1.5 rounded-lg bg-background/70 hover:bg-background/90 backdrop-blur-sm border border-border/50 transition-all hover:scale-110"
                    >
                      <Bookmark 
                        className={`w-3.5 h-3.5 ${
                          item.isSaved ? 'text-foreground fill-foreground' : 'text-foreground'
                        }`} 
                      />
                    </button>
                    <button 
                      onClick={handleCopyPrompt}
                      className="p-1.5 rounded-lg bg-background/70 hover:bg-background/90 backdrop-blur-sm border border-border/50 transition-all hover:scale-110"
                    >
                      <Copy className="w-3.5 h-3.5 text-foreground" />
                    </button>
                    <button 
                      onClick={handleDownload}
                      className="p-1.5 rounded-lg bg-background/70 hover:bg-background/90 backdrop-blur-sm border border-border/50 transition-all hover:scale-110"
                    >
                      <Download className="w-3.5 h-3.5 text-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Double tap heart animation */}
        <AnimatePresence>
          {showLikeAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-16 h-16 sm:w-20 sm:h-20 text-red-500 fill-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};


export default MasonryCard;