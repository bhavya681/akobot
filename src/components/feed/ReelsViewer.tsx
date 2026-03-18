"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, MessageCircle, Share2, Bookmark, X, 
  Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown,
  Music2, Send
} from "lucide-react";
import { FeedItem } from "./FeedCard";

interface ReelsViewerProps {
  items: FeedItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onLike: (id: number | string) => void;
  onSave: (id: number | string) => void;
  onShare: (id: number | string) => void;
  onOpenComments: (id: number | string) => void;
}

const ReelsViewer = ({
  items,
  initialIndex,
  isOpen,
  onClose,
  onLike,
  onSave,
  onShare,
  onOpenComments
}: ReelsViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reference for the video element to control playback
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentItem = items[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Effect to handle play/pause when state or index changes
  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(e => console.log("Autoplay prevented:", e));
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, isPlaying, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowUp' && currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
      } else if (e.key === 'ArrowDown' && currentIndex < items.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else if (e.key === 'Escape') {
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, items.length, onClose]);

  const handleScroll = (direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (direction === 'down' && currentIndex < items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleDoubleTap = () => {
    if (!currentItem.isLiked) {
      onLike(currentItem.id);
    }
    setShowLikeAnimation(true);
    setTimeout(() => setShowLikeAnimation(false), 1000);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (!isOpen || !currentItem) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 left-3 sm:top-4 sm:left-4 z-50 p-2 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-colors"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
        </button>

        {/* Main Content */}
        <div 
          ref={containerRef}
          className="h-full w-full flex items-center justify-center"
          onDoubleClick={handleDoubleTap}
        >
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="relative h-full w-full max-w-lg mx-auto bg-black"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              {currentItem.type === 'video' ? (
                <video
                  ref={videoRef}
                  src={currentItem.mediaUrl}
                  className="w-full h-full object-cover"
                  loop
                  muted={isMuted}
                  playsInline
                  // We control playback via ref in useEffect
                />
              ) : (
                <img
                  src={currentItem.mediaUrl}
                  alt={currentItem.prompt}
                  className="w-full h-full object-cover"
                />
              )}
              
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
            </div>

            {/* Play/Pause Overlay */}
            <div 
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
                  >
                    <Play className="w-10 h-10 text-white ml-1" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Like Animation */}
              <AnimatePresence>
                {showLikeAnimation && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute pointer-events-none"
                  >
                    <Heart className="w-32 h-32 text-red-500 fill-red-500" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-2 sm:right-4 bottom-24 sm:bottom-32 flex flex-col items-center gap-4 sm:gap-6 z-20">
              <button 
                onClick={() => onLike(currentItem.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/60 transition-colors">
                  <Heart 
                    className={`w-5 h-5 sm:w-7 sm:h-7 ${
                      currentItem.isLiked ? 'text-red-500 fill-red-500' : 'text-white'
                    }`} 
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-white shadow-black drop-shadow-md">{formatNumber(currentItem.likes)}</span>
              </button>

              <button 
                onClick={() => onOpenComments(currentItem.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/60 transition-colors">
                  <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-white shadow-black drop-shadow-md">{formatNumber(currentItem.comments)}</span>
              </button>

              <button 
                onClick={() => onShare(currentItem.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/60 transition-colors">
                  <Send className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-white shadow-black drop-shadow-md">Share</span>
              </button>

              <button 
                onClick={() => onSave(currentItem.id)}
                className="flex flex-col items-center gap-1 group"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/60 transition-colors">
                  <Bookmark 
                    className={`w-5 h-5 sm:w-7 sm:h-7 ${
                      currentItem.isSaved ? 'text-white fill-white' : 'text-white'
                    }`} 
                  />
                </div>
                <span className="text-[10px] sm:text-xs font-medium text-white shadow-black drop-shadow-md">Save</span>
              </button>

              {/* Show volume control only for videos */}
              {currentItem.type === 'video' && (
                <button 
                  onClick={() => setIsMuted(!isMuted)}
                  className="flex flex-col items-center gap-1 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-black/60 transition-colors">
                    {isMuted ? (
                      <VolumeX className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    ) : (
                      <Volume2 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    )}
                  </div>
                </button>
              )}

              {/* Model Avatar */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg border-2 border-white/50 overflow-hidden animate-[spin_4s_linear_infinite]">
                <img 
                  src={currentItem.author.avatar} 
                  alt={currentItem.model}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute left-3 sm:left-4 right-16 sm:right-20 bottom-6 sm:bottom-8 z-20 text-white">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <img 
                  src={currentItem.author.avatar} 
                  alt={currentItem.author.username}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-white/50"
                />
                <span className="font-semibold text-sm sm:text-base shadow-black drop-shadow-md">@{currentItem.author.username}</span>
                <button className="px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-medium border border-white/50 rounded-lg hover:bg-white/10 transition-colors backdrop-blur-sm">
                  Follow
                </button>
              </div>
              <p className="text-xs sm:text-sm text-white/90 line-clamp-2 sm:line-clamp-3 mb-1 sm:mb-2 shadow-black drop-shadow-sm">
                {currentItem.prompt}
              </p>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/70">
                <Music2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="truncate">AI Generated • {currentItem.model}</span>
              </div>
            </div>

            {/* Navigation Arrows - Hidden on mobile, shown on desktop */}
            <div className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 flex-col gap-2 z-20">
              <button
                onClick={() => handleScroll('up')}
                disabled={currentIndex === 0}
                className="p-2 rounded-full bg-black/20 backdrop-blur-sm disabled:opacity-30 hover:bg-black/40 transition-colors text-white"
              >
                <ChevronUp className="w-6 h-6" />
              </button>
              <button
                onClick={() => handleScroll('down')}
                disabled={currentIndex === items.length - 1}
                className="p-2 rounded-full bg-black/20 backdrop-blur-sm disabled:opacity-30 hover:bg-black/40 transition-colors text-white"
              >
                <ChevronDown className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1 z-20">
              {items.slice(Math.max(0, currentIndex - 2), Math.min(items.length, currentIndex + 3)).map((_, idx) => {
                const actualIndex = Math.max(0, currentIndex - 2) + idx;
                return (
                  <div
                    key={actualIndex}
                    className={`h-1 rounded-full transition-all ${
                      actualIndex === currentIndex ? 'w-6 bg-white' : 'w-2 bg-white/30'
                    }`}
                  />
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReelsViewer;