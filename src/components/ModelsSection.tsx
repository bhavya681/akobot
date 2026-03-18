import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Zap, Star, Sparkles, Clock } from "lucide-react";

const models = [
  {
    name: "Stable Diffusion XL",
    description: "High-quality image generation with exceptional detail",
    tags: ["Fast", "Realistic"],
    featured: false,
    image: "https://images.unsplash.com/photo-1683009427666-340595e57e43?w=300&q=80",
  },
  {
    name: "FLUX Pro",
    description: "Next-gen model for stunning photorealistic outputs",
    tags: ["Photorealistic", "Premium"],
    featured: true,
    image: "https://images.unsplash.com/photo-1686904423085-2e9da818e4cf?w=300&q=80",
  },
  {
    name: "Anime Diffusion",
    description: "Perfect for anime and manga-style illustrations",
    tags: ["Anime", "Fast"],
    featured: false,
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&q=80",
  },
  {
    name: "Creative Mix",
    description: "Artistic and creative interpretations of prompts",
    tags: ["Artistic", "Creative"],
    featured: false,
    image: "https://images.unsplash.com/photo-1684779847639-fbcc5a57dfe9?w=300&q=80",
  },
  {
    name: "Cinematic AI",
    description: "Film-quality visuals with dramatic lighting",
    tags: ["Cinematic", "Premium"],
    featured: true,
    image: "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=300&q=80",
  },
  {
    name: "Portrait Master",
    description: "Specialized in photorealistic human portraits",
    tags: ["Portraits", "Realistic"],
    featured: false,
    image: "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?w=300&q=80",
  },
];

const tagIcons: Record<string, typeof Zap> = {
  Fast: Zap,
  Premium: Star,
  Photorealistic: Sparkles,
  Cinematic: Clock,
};

const ModelsSection = () => {
  return (
    <section id="models" className="py-12 lg:py-16 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Powered by <span className="gradient-text">50+ AI Models</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access the world's best AI models for image and video generation
          </p>
        </motion.div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {models.map((model, index) => (
            <motion.div
              key={model.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`glass-card-glow p-0 relative overflow-hidden group ${
                model.featured ? "ring-1 ring-primary/50" : ""
              }`}
            >
              {/* Model Preview Image */}
              <div className="relative h-32 overflow-hidden">
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                
                {/* Featured badge */}
                {model.featured && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full">
                      Featured
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Content */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {model.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {model.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {model.tags.map((tag) => {
                    const Icon = tagIcons[tag] || Sparkles;
                    return (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-secondary/50 text-muted-foreground rounded-md border border-border/50"
                      >
                        <Icon className="w-3 h-3" />
                        {tag}
                      </span>
                    );
                  })}
                </div>

                {/* Try button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full group-hover:border-primary/50 transition-colors"
                >
                  Try Model
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-12"
        >
          <Button variant="glass" size="lg">
            View All Models
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default ModelsSection;
