"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Send, MoreHorizontal } from "lucide-react";

interface Comment {
  id: number;
  author: {
    username: string;
    avatar: string;
  };
  text: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  replies?: Comment[];
}

interface CommentsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: number | string;
}

const mockComments: Comment[] = [
  {
    id: 1,
    author: { username: "ai_artist", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" },
    text: "This is absolutely stunning! The details are incredible 🔥",
    likes: 234,
    isLiked: false,
    createdAt: "2h",
  },
  {
    id: 2,
    author: { username: "creative_pro", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
    text: "What prompt did you use? I need to try this model!",
    likes: 89,
    isLiked: true,
    createdAt: "4h",
    replies: [
      {
        id: 21,
        author: { username: "creator_1", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100" },
        text: "@creative_pro check the description, I shared the full prompt!",
        likes: 12,
        isLiked: false,
        createdAt: "3h",
      }
    ]
  },
  {
    id: 3,
    author: { username: "tech_lover", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
    text: "FLUX Pro is really something else. Amazing work!",
    likes: 156,
    isLiked: false,
    createdAt: "6h",
  },
  {
    id: 4,
    author: { username: "design_guru", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100" },
    text: "The composition and lighting are perfect 👌",
    likes: 67,
    isLiked: false,
    createdAt: "8h",
  },
  {
    id: 5,
    author: { username: "newbie_creator", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" },
    text: "How do you get such clean outputs? Mine always look noisy",
    likes: 23,
    isLiked: false,
    createdAt: "12h",
  },
];

const CommentsSheet = ({ isOpen, onClose, itemId }: CommentsSheetProps) => {
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");

  const handleLikeComment = (commentId: number) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          isLiked: !comment.isLiked,
          likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
        };
      }
      return comment;
    }));
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now(),
      author: { 
        username: "you", 
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" 
      },
      text: newComment,
      likes: 0,
      isLiked: false,
      createdAt: "now",
    };
    
    setComments(prev => [comment, ...prev]);
    setNewComment("");
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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
            className="fixed bottom-0 left-0 right-0 h-[70vh] glass-card rounded-t-3xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <span className="font-semibold text-foreground">Comments</span>
              <button onClick={onClose} className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="space-y-3">
                  <div className="flex gap-3">
                    <img 
                      src={comment.author.avatar} 
                      alt={comment.author.username}
                      className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-sm text-foreground">
                            @{comment.author.username}
                          </span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {comment.createdAt}
                          </span>
                          <p className="text-sm text-foreground mt-1">{comment.text}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <button 
                              onClick={() => handleLikeComment(comment.id)}
                              className="flex items-center gap-1 hover:text-foreground transition-colors"
                            >
                              <Heart 
                                className={`w-4 h-4 ${comment.isLiked ? 'text-red-500 fill-red-500' : ''}`} 
                              />
                              {formatNumber(comment.likes)}
                            </button>
                            <button className="hover:text-foreground transition-colors">Reply</button>
                          </div>
                        </div>
                        <button className="p-1 hover:bg-secondary/50 rounded-full transition-colors">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Replies */}
                  {comment.replies?.map(reply => (
                    <div key={reply.id} className="flex gap-3 ml-12">
                      <img 
                        src={reply.author.avatar} 
                        alt={reply.author.username}
                        className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-sm text-foreground">
                          @{reply.author.username}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {reply.createdAt}
                        </span>
                        <p className="text-sm text-foreground mt-1">{reply.text}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <Heart className="w-3 h-3" />
                            {formatNumber(reply.likes)}
                          </button>
                          <button className="hover:text-foreground transition-colors">Reply</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" 
                  alt="You"
                  className="w-9 h-9 rounded-full object-cover"
                />
                <div className="flex-1 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                    placeholder="Add a comment..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  <button 
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim()}
                    className="text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommentsSheet;
