import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface Story {
  id: number;
  username: string;
  avatar: string;
  hasNew: boolean;
  isOwn?: boolean;
}

const stories: Story[] = [
  { id: 0, username: "Your Story", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100", hasNew: false, isOwn: true },
  { id: 1, username: "ai_master", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100", hasNew: true },
  { id: 2, username: "flux_pro", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", hasNew: true },
  { id: 3, username: "creative_ai", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd36?w=100", hasNew: true },
  { id: 4, username: "gen_art", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100", hasNew: false },
  { id: 5, username: "pixel_dream", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100", hasNew: true },
  { id: 6, username: "art_bot", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100", hasNew: true },
  { id: 7, username: "neural_net", avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100", hasNew: false },
];

const StoriesBar = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 mb-6"
    >
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {stories.map((story) => (
          <button
            key={story.id}
            className="flex flex-col items-center gap-2 flex-shrink-0"
          >
            <div className="relative">
              <div className={`p-0.5 rounded-full ${
                story.hasNew 
                  ? 'bg-gradient-to-br from-primary via-accent to-neon-500' 
                  : 'bg-muted'
              }`}>
                <div className="p-0.5 rounded-full bg-background">
                  <img 
                    src={story.avatar} 
                    alt={story.username}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                </div>
              </div>
              {story.isOwn && (
                <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
                  <Plus className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground truncate w-16 text-center">
              {story.isOwn ? "Add" : story.username}
            </span>
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default StoriesBar;
