import { motion } from "framer-motion";
import {
  Youtube,
  Instagram,
  ShoppingBag,
  Paintbrush,
  Users,
  Megaphone,
} from "lucide-react";

const useCases = [
  {
    icon: Youtube,
    title: "YouTube Thumbnails",
    description: "Eye-catching thumbnails that boost click-through rates",
    image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=300&q=80",
  },
  {
    icon: Instagram,
    title: "Instagram Reels",
    description: "Stunning visuals for social media content",
    image: "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=300&q=80",
  },
  {
    icon: ShoppingBag,
    title: "Product Mockups",
    description: "Professional product visuals without a photoshoot",
    image: "https://images.unsplash.com/photo-1586880244406-556ebe35f282?w=300&q=80",
  },
  {
    icon: Paintbrush,
    title: "Concept Art",
    description: "Rapid visualization of creative ideas",
    image: "https://images.unsplash.com/photo-1683009427666-340595e57e43?w=300&q=80",
  },
  {
    icon: Users,
    title: "AI Avatars",
    description: "Unique profile pictures and digital personas",
    image: "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?w=300&q=80",
  },
  {
    icon: Megaphone,
    title: "Marketing Creatives",
    description: "Ad visuals and campaign assets at scale",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&q=80",
  },
];

const UseCasesSection = () => {
  return (
    <section className="py-12 lg:py-16 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Built for <span className="gradient-text">Every Creator</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From content creators to marketers, AEKO powers visual creation
          </p>
        </motion.div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="glass-card-glow p-0 text-center group cursor-pointer overflow-hidden"
            >
              {/* Image */}
              <div className="relative h-24 overflow-hidden">
                <img
                  src={useCase.image}
                  alt={useCase.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              
              <div className="p-4">
                <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                  <useCase.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  {useCase.title}
                </h3>
                <p className="text-xs text-muted-foreground hidden lg:block">
                  {useCase.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Gallery Preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <div className="glass-card p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Recent Community Creations</h3>
              <span className="text-sm text-muted-foreground">Updated live</span>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
              {[
                "https://images.unsplash.com/photo-1686904423085-2e9da818e4cf?w=200&q=80",
                "https://images.unsplash.com/photo-1683009427666-340595e57e43?w=200&q=80",
                "https://images.unsplash.com/photo-1684779847639-fbcc5a57dfe9?w=200&q=80",
                "https://images.unsplash.com/photo-1699839028894-c3f7d71710a4?w=200&q=80",
                "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?w=200&q=80",
                "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=200&q=80",
                "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&q=80",
                "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&q=80",
              ].map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="aspect-square rounded-lg overflow-hidden group cursor-pointer"
                >
                  <img
                    src={src}
                    alt={`Creation ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UseCasesSection;
