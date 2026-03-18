import { motion } from "framer-motion";
import { Sparkles, Upload, Download } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    number: "01",
    title: "Choose AI Model",
    description:
      "Select from 50+ cutting-edge AI models optimized for different styles and use cases.",
  },
  {
    icon: Upload,
    number: "02",
    title: "Upload or Write Prompt",
    description:
      "Describe your vision in text or upload an existing image to transform.",
  },
  {
    icon: Download,
    number: "03",
    title: "Generate & Download",
    description:
      "Get your AI-generated content in seconds, ready to use anywhere.",
  },
];

const HowItWorksSection = () => {
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
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create stunning AI content in three simple steps
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative text-center"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
              )}

              {/* Step number badge */}
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-secondary to-muted border border-border/50 mb-6 relative">
                <span className="text-4xl font-bold gradient-text">
                  {step.number}
                </span>
                <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <step.icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
