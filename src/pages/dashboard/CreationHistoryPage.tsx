"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const CreationHistoryPage = () => {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full max-w-4xl mx-auto px-4 md:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
          </div>
          
          <div className="space-y-4">
            <Sparkles className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Creation History
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your creation history has been moved to the dashboard home page for easier access.
            </p>
            
            <div className="pt-6">
              <Link href="/dashboard">
                <Button
                  variant="hero"
                  size="lg"
                  className="gap-2 shadow-md px-6 py-3 text-base font-medium transition-transform hover:scale-105"
                >
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CreationHistoryPage;
