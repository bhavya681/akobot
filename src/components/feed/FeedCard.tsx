"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, Download, Bookmark, 
  MoreHorizontal, Copy, Flag, UserPlus, Play, Pause,
  Volume2, VolumeX, Send, Lock, Globe, Loader2
} from "lucide-react";
import { toast } from "sonner";

export interface FeedItem {
  id: number | string;
  type: "image" | "video" | "audio";
  mediaUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  author: {
    username: string;
    avatar: string;
    verified: boolean;
  };
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  model: string;
  createdAt: string;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
  /** Gallery item ID for API updates */
  galleryId?: string;
  /** Whether item is private (only visible to owner) */
  isPrivate?: boolean;
}

interface FeedCardProps {
  item: FeedItem;
  onLike: (id: number | string) => void;
  onSave: (id: number | string) => void;
  onShare: (id: number | string) => void;
  onFollow: (id: number | string) => void;
  onOpenComments: (id: number | string) => void;
  onOpenReels?: (id: number | string) => void;
  onToggleVisibility?: (item: FeedItem) => void;
  togglingId?: string | null;
}

const FeedCard = ({ 
  item, 
  onLike, 
  onSave, 
  onShare, 
  onFollow,
  onOpenComments,
  onOpenReels,
  onToggleVisibility,
  togglingId
}: FeedCardProps) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const handleDoubleClick = () => {
    if (!item.isLiked) {
      onLike(item.id);
    }
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.prompt);
    toast.success("Prompt copied to clipboard!");
    setShowMenu(false);
  };

  const handleDownload = () => {
    toast.success("Download started!");
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
    if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
    if (seconds < 604800) return Math.floor(seconds / 86400) + 'd';
    return Math.floor(seconds / 604800) + 'w';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={item.author.avatar} 
              alt={item.author.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/50"
            />
            {item.author.verified && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <span className="text-[8px] text-primary-foreground">✓</span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                @{item.author.username}
              </span>
              <span className="text-xs text-muted-foreground">
                • {timeAgo(item.createdAt)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{item.model}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!item.isFollowing && (
            <button
              onClick={() => onFollow(item.id)}
              className="px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Follow
            </button>
          )}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-secondary/50 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-full mt-1 w-48 glass-card rounded-xl overflow-hidden z-50"
                >
                  {onToggleVisibility && item.galleryId && (
                    <button
                      onClick={() => {
                        onToggleVisibility(item);
                        setShowMenu(false);
                      }}
                      disabled={togglingId === item.galleryId}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      {togglingId === item.galleryId ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Toggling...</>
                      ) : item.isPrivate ? (
                        <><Globe className="w-4 h-4" /> Make Public</>
                      ) : (
                        <><Lock className="w-4 h-4" /> Make Private</>
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleCopyPrompt}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <Copy className="w-4 h-4" /> Copy Prompt
                  </button>
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" /> Follow @{item.author.username}
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-secondary/50 transition-colors"
                  >
                    <Flag className="w-4 h-4" /> Report
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Media */}
      <div 
        className="relative aspect-square overflow-hidden cursor-pointer"
        onDoubleClick={handleDoubleClick}
        onClick={() => item.type === "video" && onOpenReels?.(item.id)}
      >
        {item.type === "video" ? (
          <>
            <img
              src={item.thumbnailUrl || item.mediaUrl}
              alt={item.prompt}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-background/20">
              <div className="w-16 h-16 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-8 h-8 text-foreground ml-1" />
              </div>
            </div>
            <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-background/80 backdrop-blur-sm text-xs font-medium">
              REEL
            </div>
          </>
        ) : (
          <img
            src={item.mediaUrl}
            alt={item.prompt}
            className="w-full h-full object-cover"
          />
        )}

        {/* Double tap heart animation */}
        <AnimatePresence>
          {showLikeAnimation && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-24 h-24 text-red-500 fill-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onLike(item.id)}
              className="flex items-center gap-1 group"
            >
              <Heart 
                className={`w-6 h-6 transition-all group-hover:scale-110 ${
                  item.isLiked ? 'text-red-500 fill-red-500' : 'text-foreground'
                }`} 
              />
            </button>
            <button 
              onClick={() => onOpenComments(item.id)}
              className="flex items-center gap-1 group"
            >
              <MessageCircle className="w-6 h-6 text-foreground transition-transform group-hover:scale-110" />
            </button>
            <button 
              onClick={() => onShare(item.id)}
              className="flex items-center gap-1 group"
            >
              <Send className="w-6 h-6 text-foreground transition-transform group-hover:scale-110" />
            </button>
          </div>
          <button 
            onClick={() => onSave(item.id)}
            className="group"
          >
            <Bookmark 
              className={`w-6 h-6 transition-all group-hover:scale-110 ${
                item.isSaved ? 'text-foreground fill-foreground' : 'text-foreground'
              }`} 
            />
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm mb-2">
          <span className="font-semibold text-foreground">{formatNumber(item.likes)} likes</span>
          <span className="text-muted-foreground">{formatNumber(item.comments)} comments</span>
        </div>

        {/* Prompt */}
        <p className="text-sm text-foreground">
          <span className="font-semibold">@{item.author.username}</span>{" "}
          <span className="text-muted-foreground line-clamp-2">{item.prompt}</span>
        </p>

        {/* View comments */}
        {item.comments > 0 && (
          <button 
            onClick={() => onOpenComments(item.id)}
            className="text-sm text-muted-foreground mt-1 hover:text-foreground transition-colors"
          >
            View all {item.comments} comments
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default FeedCard;
