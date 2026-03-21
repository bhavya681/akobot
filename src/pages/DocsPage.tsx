"use client";

import { motion } from "framer-motion";
import { BookOpen, Code2, Plug, Bot } from "lucide-react";

const sections = [
  { title: "Getting Started", desc: "Setup, auth, and first request flow.", icon: BookOpen },
  { title: "API Reference", desc: "Endpoints, payloads, and response models.", icon: Code2 },
  { title: "Integrations", desc: "MCP and external tool connection guides.", icon: Plug },
  { title: "Custom Agents", desc: "Create, train, and deploy custom agents.", icon: Bot },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold">Documentation</h1>
        <p className="text-sm text-muted-foreground mt-1">Technical guides and API docs.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {sections.map((s, idx) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="mt-3 text-base font-semibold">{s.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
