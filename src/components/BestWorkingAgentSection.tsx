import { motion } from "framer-motion";
import { Sparkles, Rocket, Ticket } from "lucide-react";

const bestWorkingFeatures = [
  {
    icon: Sparkles,
    title: "Learn from your business data",
    description:
      "AI-powered insights and personalization from your data. Becomes uniquely yours over time.",
  },
  {
    icon: Rocket,
    title: "Scale with your business needs",
    description:
      "Grow seamlessly as your business expands. Full access or sandboxed—your choice.",
  },
  {
    icon: Ticket,
    title: "Support ticket creation",
    description:
      "Automated ticket generation and tracking. Extend with community skills or build your own.",
  },
];

const BestWorkingAgentSection = () => {
  return (
    <section className="relative w-full py-14 lg:py-18 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Three feature cards only - Works With Everything stays in CreateAgentSection above */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {bestWorkingFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="rounded-2xl p-6 lg:p-8 bg-card/60 dark:bg-white/[0.06] border border-border/50 dark:border-white/10 hover:border-purple-500/30 transition-all duration-300"
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-4 flex justify-center">
                      <div className="rounded-xl p-2.5 border-2 border-purple-500/80 text-purple-500 dark:border-purple-500 dark:text-purple-400">
                        <Icon className="w-7 h-7" strokeWidth={2} />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground dark:text-white mb-2 text-center">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground dark:text-white/70 leading-relaxed text-center flex-1">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BestWorkingAgentSection;
