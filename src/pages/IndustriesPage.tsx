"use client";

import { motion } from "framer-motion";
import { Monitor, ShoppingCart, Landmark, GraduationCap, Heart, Building2 } from "lucide-react";

const industries = [
  { name: "SaaS & Tech", icon: Monitor, desc: "Support, analytics, MoM, and outbound workflows." },
  { name: "E-Commerce", icon: ShoppingCart, desc: "Ticket handling, SEO, and conversion operations." },
  { name: "Finance & FinTech", icon: Landmark, desc: "Secure notes, reminders, and analytics pipelines." },
  { name: "Education", icon: GraduationCap, desc: "Student support, faculty workflows, and reminders." },
  { name: "Healthcare", icon: Heart, desc: "Patient communication and process automation." },
  { name: "Enterprise", icon: Building2, desc: "Cross-team AI agent rollout and integration at scale." },
];

export default function IndustriesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl sm:text-3xl font-bold">Industries</h1>
        <p className="text-sm text-muted-foreground mt-1">Use-case blueprints by business domain.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {industries.map((item, idx) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="mt-3 text-base font-semibold">{item.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
