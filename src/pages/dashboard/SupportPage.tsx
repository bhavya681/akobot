"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  HelpCircle,
  MessageCircle,
  Book,
  ExternalLink,
  ChevronDown,
  Send,
  Mail,
  Github,
  Twitter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const faqs = [
  {
    question: "How do AI credits work?",
    answer: "AI credits are consumed each time you generate content. Different actions use different amounts of credits. For example, generating an image uses more credits than a simple chat message. You can view your credit usage in your account settings.",
  },
  {
    question: "Can I use generated content commercially?",
    answer: "Yes! All paid plans include a commercial license for the content you generate. You can use images and videos in your projects, products, and marketing materials.",
  },
  {
    question: "What AI models are available?",
    answer: "We offer access to GPT-4, GPT-3.5, Claude 3, FLUX Pro, Stable Diffusion XL, DALL-E 3, and various video generation models. The available models depend on your subscription plan.",
  },
  {
    question: "How do I upgrade my plan?",
    answer: "You can upgrade your plan anytime from your Account settings. Go to Account → Subscription and click 'Manage Plan' to view available options.",
  },
  {
    question: "Is there an API available?",
    answer: "Yes! Standard and Pro plans include API access. You can generate an API key from your Account settings and integrate AEKO into your applications.",
  },
];

const supportLinks = [
  {
    name: "Documentation",
    description: "Guides and API reference",
    href: "#",
    icon: Book,
    action: "Read docs"
  },
  {
    name: "Discord Community",
    description: "Chat with other creators",
    href: "#",
    icon: MessageCircle,
    action: "Join Discord"
  },
  {
    name: "Email Support",
    description: "Get help from our team",
    href: "mailto:support@aeko.ai",
    icon: Mail,
    action: "Contact us"
  }
];

const socialLinks = [
  {
    icon: Twitter,
    label: "Twitter",
    href: "#"
  },
  {
    icon: Github,
    label: "GitHub",
    href: "#"
  },
  {
    icon: MessageCircle,
    label: "Discord",
    href: "#"
  }
];

const SupportPage = () => {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  return (
    <div className="w-full px-4 md:px-8 py-8 space-y-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center space-y-4"
      >
        <motion.div
          className="relative w-16 h-16 flex items-center justify-center cursor-pointer"
          onClick={() => router.push("/")}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.img 
            src="/logo.png" 
            alt="AKO.ai Logo" 
            className="h-auto w-full max-w-[160px] object-contain"
            animate={{
              filter: [
                "drop-shadow(0 0 8px rgba(255,255,255,0.4))",
                "drop-shadow(0 0 15px rgba(255,255,255,0.7))",
                "drop-shadow(0 0 8px rgba(255,255,255,0.4))"
              ]
            }}
            transition={{ 
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
            Help & Support
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mt-2">
            Find answers, explore resources, or get in touch with our team.
          </p>
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4"
      >
        {supportLinks.map((link, idx) => (
          <a
            key={link.name}
            href={link.href}
            className="glass-card rounded-2xl p-6 flex flex-col h-full border border-transparent hover:border-primary/70 transition group"
            tabIndex={0}
            aria-label={link.name}
          >
            <div className="flex items-center justify-center mb-4">
              <link.icon className="w-8 h-8 text-primary transition-colors duration-200 group-hover:text-primary/85" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1 text-center">
              {link.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              {link.description}
            </p>
            <div className="flex items-center justify-center gap-1 text-sm text-primary font-medium mt-auto">
              <span>{link.action}</span>
              <ExternalLink className="w-4 h-4 ml-1" />
            </div>
          </a>
        ))}
      </motion.div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="glass-card rounded-2xl p-6 md:p-8"
      >
        <div className="flex items-center gap-3 mb-6 ">
          <HelpCircle className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="space-y-3 ">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`rounded-xl bg-secondary/40 overflow-hidden border transition-all ${
                openFaq === idx
                  ? "border-primary/30 shadow"
                  : "border-transparent"
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between gap-6 p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-expanded={openFaq === idx}
                aria-controls={`faq-${idx}`}
              >
                <span className="font-medium text-foreground text-base sm:text-lg">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    openFaq === idx ? "rotate-180" : ""
                  }`}
                />
              </button>
              <motion.div
                initial={false}
                animate={openFaq === idx ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                id={`faq-${idx}`}
                className={`overflow-hidden px-4 pb-4`}
                style={openFaq === idx ? {} : { height: 0, paddingTop: 0, paddingBottom: 0 }}
              >
                {openFaq === idx && (
                  <p className="text-sm sm:text-base text-muted-foreground">{faq.answer}</p>
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Feedback Form */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26 }}
        className="glass-card rounded-2xl p-6 md:p-8"
      >
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Send Feedback
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">
          Have a suggestion or found a bug? Share your thoughts with us!
        </p>
        <form className="space-y-4 w-full mx-auto">
          <textarea
            value={feedbackMessage}
            onChange={(e) => setFeedbackMessage(e.target.value)}
            placeholder="Tell us what you think..."
            className="w-full min-h-[10rem] max-h-40 px-4 py-3 rounded-xl bg-secondary/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/70 resize-none transition"
          />
          <div className="flex justify-end">
            <Button
              variant="hero"
              className="gap-2 px-5 py-2.5"
              disabled={feedbackMessage.trim().length === 0}
              type="submit"
            >
              <Send className="w-4 h-4" />
              Send Feedback
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.33 }}
        className="flex items-center justify-center gap-3 md:gap-6"
      >
        {socialLinks.map((social, idx) => (
          <a
            key={social.label}
            href={social.href}
            aria-label={social.label}
            className="w-10 h-10 rounded-full bg-secondary/60 hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary shadow transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/60"
            tabIndex={0}
          >
            <social.icon className="w-5 h-5" />
          </a>
        ))}
      </motion.div>
    </div>
  );
};

export default SupportPage;
