"use client";

import { motion } from "framer-motion";
import { MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";

const posts = [
  {
    title: "How to Build Reliable AI Agents",
    excerpt: "Best practices for prompts, guardrails, and tool routing in production.",
  },
  {
    title: "Shipping Better AI UX",
    excerpt: "Design patterns for chat, generation workflows, and async feedback loops.",
  },
  {
    title: "MCP Integrations That Matter",
    excerpt: "Connect your stack and automate repetitive work with clean integration layers.",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Blog</h1>
            <p className="text-sm text-muted-foreground">Latest product updates, AI ideas, and guides.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post, idx) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition"
            >
              <h2 className="text-lg font-semibold">{post.title}</h2>
              <p className="text-sm text-muted-foreground mt-2">{post.excerpt}</p>
              <Link href="/dashboard/feed" className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-4">
                Read more <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}
