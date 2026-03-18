"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  BarChart3,
  Bot,
  Check,
  Shield,
  Zap,
  Plug,
  Layers,
  Sparkles,
  ArrowRight,
  Star,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";

const fadeIn = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-50px" },
  transition: { staggerChildren: 0.1, delayChildren: 0.2 },
};

const cardHover = {
  scale: 1.02,
  y: -4,
  transition: { duration: 0.3 },
};

const agents = [
  {
    icon: MessageSquare,
    title: "Support Agent – 24/7 Intelligent Customer Automation",
    desc: "Deliver instant, human-like responses across channels. Handle inquiries, resolve issues, analyze sentiment, and automatically generate support tickets. Reduce support costs. Increase customer satisfaction. Scale effortlessly.",
  },
  {
    icon: TrendingUp,
    title: "Sales Agent – Your 24/7 Revenue Engine",
    desc: "Engage visitors, qualify leads, schedule meetings, and guide prospects through intelligent sales conversations. Shorten sales cycles and increase conversions through AI-powered engagement.",
  },
  {
    icon: Users,
    title: "Lead Management Agent – Automated Prospect Qualification",
    desc: "Capture and score leads in real time. Route high-value prospects directly into your CRM and sales pipeline. Never miss an opportunity again.",
  },
  {
    icon: Calendar,
    title: "Booking Agent – Seamless Appointment Automation",
    desc: "Automate scheduling, confirmations, and reminders. Eliminate back-and-forth communication and improve customer experience.",
  },
  {
    icon: FileText,
    title: "Content Creation Agent – AI Marketing at Scale",
    desc: "Generate marketing content, promotional materials, and digital assets instantly. Maintain consistent branding while reducing creative workload.",
  },
  {
    icon: BarChart3,
    title: "Data Analysis Agent – Smarter Business Decisions",
    desc: "Turn business data into actionable insights. Automated reporting and intelligent analytics for faster strategic decisions.",
  },
];

const customUseCases = [
  "E-commerce automation bots",
  "HR & recruitment agents",
  "Customer onboarding assistants",
  "Finance & operations bots",
  "Industry-specific AI systems",
  "Internal workflow automation agents",
  "Custom API-integrated AI solutions",
];

const whyPoints = [
  "24/7 AI-powered customer support",
  "Automated lead capture & sales engagement",
  "Smart scheduling & workflow automation",
  "AI-driven content & visual generation",
  "Seamless integration with existing tools",
  "Scalable infrastructure for growing businesses",
];

const securityPoints = [
  "Data security",
  "System reliability",
  "Ethical AI deployment",
  "Performance optimization",
  "Business-grade infrastructure",
];

const AboutUsPage = () => {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden w-full relative">
      <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }} ></div>
      <div className="relative z-10">
        <Navbar />
        {/* Hero Section */}
        <section className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="mx-auto max-w-5xl text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Automation Platform</span>
            </motion.div>
            
            <motion.h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              Build Your{" "}
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent">
                AI Workforce
              </span>
              .<br />
              Automate Everything.
            </motion.h1>
            
            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-6 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              Deploy intelligent AI agents for support, sales, content creation, and custom automation — all in one scalable ecosystem.
            </motion.p>
            
            <motion.div
              className="flex flex-wrap gap-3 justify-center text-sm sm:text-base text-muted-foreground mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {["24/7 Support", "Sales Automation", "Content Generation", "Custom AI Agents"].map((item, i) => (
                <motion.span
                  key={i}
                  className="px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  {item}
                </motion.span>
              ))}
            </motion.div>
            
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group"
                onClick={() => router.push("/auth/sign-in")}
              >
                Start Building Your AI Agent
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-border hover:border-primary/50 px-8 py-6 text-base font-semibold backdrop-blur-sm bg-background/50 hover:bg-muted/30 transition-all"
                onClick={() => router.push("/pricing")}
              >
                Book a Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-border hover:border-primary/50 px-8 py-6 text-base font-semibold backdrop-blur-sm bg-background/50 hover:bg-muted/30 transition-all"
                onClick={() => window.open("https://discord.gg/54FjQR7G", "_blank")}
              >
                Join our Discord
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Why AKOBOT Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-border/50 relative">
          <div className="mx-auto max-w-6xl">
            <motion.div className="text-center mb-12" {...fadeIn}>
              <div className="inline-flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Why Choose Us</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Why <span className="text-primary">AKOBOT</span>?
              </h2>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
                Modern businesses need more than chatbots. They need intelligent AI agents that perform real work.
              </p>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                AKOBOT combines conversational AI, workflow automation, sales intelligence, and content generation into one unified platform.
              </p>
            </motion.div>
            
            <motion.ul
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-50px" }}
            >
              {whyPoints.map((point, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all group"
                  variants={fadeIn}
                  whileHover={{ scale: 1.02, y: -2 }}
                >
                  <div className="rounded-lg bg-primary/10 p-2 group-hover:bg-primary/20 transition-colors">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                  </div>
                  <span className="text-foreground font-medium pt-0.5">{point}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </section>

        {/* AI Agents Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background dark:from-muted/10 dark:to-background relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="mx-auto max-w-7xl relative z-10">
            <motion.div className="text-center mb-16" {...fadeIn}>
              <div className="inline-flex items-center gap-2 mb-4">
                <Rocket className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Our Agents</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Our Most Powerful{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  AI Agents
                </span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These flagship agents demonstrate the full power of AKOBOT. Built for real business impact.
              </p>
            </motion.div>
            
            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, margin: "-50px" }}
            >
              {agents.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    className="group relative rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6 shadow-sm hover:shadow-2xl hover:shadow-primary/5 transition-all overflow-hidden"
                    variants={fadeIn}
                    whileHover={cardHover}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10">
                      <div className="flex gap-4 mb-4">
                        <div className="rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 h-fit group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-bold text-lg text-foreground mb-3 leading-tight">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* Custom Agents Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-5xl">
            <motion.div className="text-center mb-12" {...fadeIn}>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Not Just These Bots —{" "}
                <span className="text-primary">Build Any AI Agent</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-4">
                AKOBOT is fully customizable. You are not limited to predefined bots.
              </p>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Our platform allows you to build any AI agent tailored to your workflow, industry, or business model.
              </p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-card to-card/50 rounded-3xl border border-border/50 p-8 md:p-12 shadow-xl"
              {...fadeIn}
            >
              <h3 className="text-xl font-bold text-foreground text-center mb-8">
                Create Custom Solutions:
              </h3>
              <motion.ul
                className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto"
                variants={staggerContainer}
                initial="initial"
                whileInView="whileInView"
                viewport={{ once: true }}
              >
                {customUseCases.map((useCase, i) => (
                  <motion.li
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    variants={fadeIn}
                  >
                    <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="text-foreground">{useCase}</span>
                  </motion.li>
                ))}
              </motion.ul>
              
              <motion.div
                className="mt-10 text-center p-6 rounded-2xl bg-primary/5 border border-primary/20"
                {...fadeIn}
              >
                <p className="text-lg font-semibold text-foreground">
                  If your business has a process —{" "}
                  <span className="text-primary">AKOBOT can automate it.</span>
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Integration Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20 border-y border-border/50 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />
          <div className="mx-auto max-w-4xl text-center relative z-10">
            <motion.div {...fadeIn} className="flex justify-center mb-6">
              <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-6">
                <Plug className="w-12 h-12 text-primary" />
              </div>
            </motion.div>
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6"
              {...fadeIn}
            >
              Works With Your{" "}
              <span className="text-primary">Existing Tools</span>
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
              {...fadeIn}
            >
              AKOBOT integrates seamlessly with CRMs, helpdesk platforms, e-commerce systems, marketing tools, and custom APIs. No disruption. No complex setup. Just intelligent automation layered onto your existing infrastructure.
            </motion.p>
          </div>
        </section>

        {/* Scale Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div {...fadeIn} className="flex justify-center mb-6">
              <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-6">
                <Layers className="w-12 h-12 text-primary" />
              </div>
            </motion.div>
            <motion.h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6"
              {...fadeIn}
            >
              Built for{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Scale
              </span>
            </motion.h2>
            <motion.p
              className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto"
              {...fadeIn}
            >
              Whether you are a startup, growing business, or enterprise organization, AKOBOT scales with your operations.
            </motion.p>
            <motion.p
              className="text-base text-muted-foreground max-w-2xl mx-auto"
              {...fadeIn}
            >
              Automate thousands of conversations. Manage unlimited workflows. Deploy AI agents across multiple departments. Grow without increasing overhead.
            </motion.p>
          </div>
        </section>

        {/* Security Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background dark:from-muted/10 dark:to-background relative">
          <div className="mx-auto max-w-5xl">
            <motion.div className="text-center mb-12" {...fadeIn}>
              <div className="flex justify-center mb-6">
                <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-6">
                  <Shield className="w-12 h-12 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Secure, Reliable &{" "}
                <span className="text-primary">Responsible AI</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We prioritize:
              </p>
            </motion.div>
            
            <motion.ul
              className="flex flex-wrap justify-center gap-4 mb-10"
              variants={staggerContainer}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true }}
            >
              {securityPoints.map((point, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 text-foreground font-medium transition-all"
                  variants={fadeIn}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Zap className="w-5 h-5 text-primary shrink-0" />
                  {point}
                </motion.li>
              ))}
            </motion.ul>
            
            <motion.p
              className="text-center text-lg font-semibold text-foreground"
              {...fadeIn}
            >
              Your automation runs securely and reliably at scale.
            </motion.p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
          <motion.div
            className="mx-auto max-w-3xl text-center relative z-10"
            {...fadeIn}
          >
            <div className="rounded-3xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-12 md:p-16 shadow-2xl">
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Bot className="w-10 h-10 text-primary" />
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
                Stop hiring for{" "}
                <span className="text-primary">repetitive tasks</span>.
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
                Start deploying AI agents that work 24/7. Build your AI workforce with AKOBOT.
              </p>
              
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all group"
                onClick={() => router.push("/auth/sign-in")}
              >
                Start Building Your AI Agent
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </section>

        <Footer />
      </div>
    </main>
  );
};

export default AboutUsPage;
