import { motion } from "framer-motion";
import { MessageSquare, Image, Video, Code, Palette, Megaphone, PenTool, Briefcase } from "lucide-react";

const creators = [
  {
    icon: Code,
    title: "Developers",
    description: "Build AI-powered apps with our robust API",
  },
  {
    icon: Palette,
    title: "Designers",
    description: "Generate stunning visuals and concepts instantly",
  },
  {
    icon: PenTool,
    title: "Storytellers",
    description: "Bring your narratives to life with AI imagery",
  },
  {
    icon: Megaphone,
    title: "Marketers",
    description: "Create campaigns and content at scale",
  },
];

const features = [
  {
    icon: MessageSquare,
    title: "Chat",
    description: "Converse with multiple LLMs",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Image,
    title: "Images",
    description: "Generate & transform visuals",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Video,
    title: "Videos",
    description: "Create motion from prompts",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Code,
    title: "APIs",
    description: "Integrate into your apps",
    color: "from-green-500 to-emerald-500",
  },
];

const EveryCreatorSection = () => {
  return (
    <section className="py-12 lg:py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/5 to-background" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Main Statement */}
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
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Developers, designers, storytellers, marketers — AEKO empowers everyone to create with AI.
          </p>
        </motion.div>

        {/* Creator Types */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {creators.map((creator, index) => {
            const Icon = creator.icon;
            return (
              <motion.div
                key={creator.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center group hover:border-primary/50 transition-all"
              >
                <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {creator.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {creator.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity rounded-2xl" 
                  style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} 
                />
                <div className="glass-card rounded-2xl p-6 h-full relative">
                  <div className={`w-12 h-12 mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EveryCreatorSection;
