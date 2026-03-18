import { motion } from "framer-motion";
import {
  ImageIcon,
  Palette,
  Video,
  Film,
  Zap,
  Code,
} from "lucide-react";

const features = [
  {
    icon: ImageIcon,
    title: "Text-to-Image",
    description:
      "Generate stunning images from text descriptions using state-of-the-art AI models.",
    image: "https://images.unsplash.com/photo-1683009427666-340595e57e43?w=400&q=80",
  },
  {
    icon: Palette,
    title: "Image-to-Image",
    description:
      "Transform existing images with AI-powered style transfer and modifications.",
    image: "https://images.unsplash.com/photo-1684779847639-fbcc5a57dfe9?w=400&q=80",
  },
  {
    icon: Video,
    title: "Image-to-Video",
    description:
      "Bring your images to life with smooth, cinematic video animations.",
    video: "https://images.unsplash.com/photo-1699839028894-c3f7d71710a4?w=400&q=80",
  },
  {
    icon: Film,
    title: "Text-to-Video",
    description:
      "Create videos directly from text prompts with advanced AI generation.",
    image: "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=400&q=80",
  },
  {
    icon: Zap,
    title: "Upscale & Enhance",
    description:
      "Enhance resolution and quality of any image with AI-powered upscaling.",
    image: "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?w=400&q=80",
  },
  {
    icon: Code,
    title: "API for Developers",
    description:
      "Integrate AI generation into your apps with our powerful REST API.",
    image: "https://images.unsplash.com/photo-1686904423085-2e9da818e4cf?w=400&q=80",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-12 lg:py-16 relative">
      {/* Background gradient */}
      <div className="absolute inset-0 hero-gradient opacity-30" />

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
            Everything You Need to{" "}
            <span className="gradient-text">Create</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful AI tools designed for creators, designers, and developers
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card-glow p-0 group cursor-pointer overflow-hidden"
            >
              {/* Image Preview */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={feature.image || feature.video}
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                
                {/* Play button for video features */}
                {feature.video && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/80 flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
