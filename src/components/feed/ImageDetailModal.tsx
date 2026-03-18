import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Heart, MessageCircle, Share2, Download, Bookmark, 
  Copy, ChevronLeft, ChevronRight, User, Globe, Lock, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { FeedItem } from "./FeedCard";

interface ImageDetailModalProps {
  isOpen: boolean;
  item: FeedItem | null;
  onClose: () => void;
  onLike: (id: number | string) => void;
  onSave: (id: number | string) => void;
  onShare: (id: number | string) => void;
  onOpenComments: (id: number | string) => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onToggleVisibility?: (item: FeedItem) => void;
  togglingId?: string | null;
}

const ImageDetailModal = ({ 
  isOpen, 
  item, 
  onClose, 
  onLike,
  onSave,
  onShare,
  onOpenComments,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  onToggleVisibility,
  togglingId
}: ImageDetailModalProps) => {
  if (!item) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.prompt);
    toast.success("Prompt copied to clipboard!");
  };

  const handleDownload = () => {
    toast.success("Download started!");
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center"
          onClick={onClose}
        >
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
          </button>

          {/* Navigation arrows */}
          {hasPrev && (
            <button 
              onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </button>
          )}
          {hasNext && (
            <button 
              onClick={(e) => { e.stopPropagation(); onNext?.(); }}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
            </button>
          )}

          {/* Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="flex flex-col lg:flex-row max-w-7xl w-full max-h-[90vh] mx-2 sm:mx-4 rounded-2xl overflow-hidden bg-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex-1 flex items-center justify-center bg-secondary/30 p-2 sm:p-4 min-h-[40vh] lg:min-h-0">
              <img
                src={item.mediaUrl}
                alt={item.prompt}
                className="max-w-full max-h-[40vh] lg:max-h-[80vh] object-contain rounded-lg"
              />
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-border flex flex-col max-h-[50vh] lg:max-h-none">
              {/* Author */}
              <div className="flex items-center gap-3 p-3 sm:p-4 border-b border-border">
                <img 
                  src={item.author.avatar} 
                  alt={item.author.username}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover ring-2 ring-primary/50"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm sm:text-base text-foreground truncate">
                      @{item.author.username}
                    </span>
                    {item.author.verified && (
                      <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] text-primary-foreground">✓</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">{item.model}</span>
                </div>
              </div>

              {/* Prompt */}
              <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
                <h4 className="text-xs sm:text-sm font-medium text-muted-foreground mb-2">Prompt</h4>
                <p className="text-sm sm:text-base text-foreground leading-relaxed mb-4">{item.prompt}</p>
                
                {onToggleVisibility && item.galleryId && (
                  <div className="pt-4 border-t border-border">
                    <button
                      onClick={() => onToggleVisibility(item)}
                      disabled={togglingId === item.galleryId}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors text-sm text-foreground"
                    >
                      {togglingId === item.galleryId ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                      ) : item.isPrivate ? (
                        <><Globe className="w-4 h-4 text-green-500" /> Make Public</>
                      ) : (
                        <><Lock className="w-4 h-4 text-yellow-500" /> Make Private</>
                      )}
                    </button>
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      {item.isPrivate ? "Only you can see this creation" : "This creation is visible to everyone"}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-3 sm:p-4 border-t border-border">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <button 
                      onClick={() => onLike(item.id)}
                      className="flex items-center gap-1.5 group"
                    >
                      <Heart 
                        className={`w-5 h-5 sm:w-6 sm:h-6 transition-all group-hover:scale-110 ${
                          item.isLiked ? 'text-red-500 fill-red-500' : 'text-foreground'
                        }`} 
                      />
                      <span className="text-xs sm:text-sm text-muted-foreground">{formatNumber(item.likes)}</span>
                    </button>
                    <button 
                      onClick={() => onOpenComments(item.id)}
                      className="flex items-center gap-1.5 group"
                    >
                      <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-foreground transition-transform group-hover:scale-110" />
                      <span className="text-xs sm:text-sm text-muted-foreground">{formatNumber(item.comments)}</span>
                    </button>
                    <button 
                      onClick={() => onShare(item.id)}
                      className="flex items-center gap-1.5 group"
                    >
                      <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-foreground transition-transform group-hover:scale-110" />
                    </button>
                  </div>
                  <button 
                    onClick={() => onSave(item.id)}
                    className="group"
                  >
                    <Bookmark 
                      className={`w-5 h-5 sm:w-6 sm:h-6 transition-all group-hover:scale-110 ${
                        item.isSaved ? 'text-foreground fill-foreground' : 'text-foreground'
                      }`} 
                    />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleCopyPrompt}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-sm"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy Prompt</span>
                    <span className="sm:hidden">Copy</span>
                  </button>
                  <button 
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                    <span className="sm:hidden">Save</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImageDetailModal;
