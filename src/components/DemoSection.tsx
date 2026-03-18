"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleImages = [
  "https://images.unsplash.com/photo-1686904423085-2e9da818e4cf?w=800&q=80",
  "https://images.unsplash.com/photo-1683009427666-340595e57e43?w=800&q=80",
  "https://images.unsplash.com/photo-1684779847639-fbcc5a57dfe9?w=800&q=80",
  "https://images.unsplash.com/photo-1699839028894-c3f7d71710a4?w=800&q=80",
  "https://images.unsplash.com/photo-1697577418970-95d99b5a55cf?w=800&q=80",
  "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&q=80",
];

const promptSuggestions = [
  "A futuristic cityscape at sunset with flying cars",
  "An astronaut riding a horse on Mars",
  "A magical forest with glowing mushrooms",
  "A cyberpunk samurai in neon-lit Tokyo",
  "An underwater palace made of crystals",
  "A steampunk dragon breathing colorful smoke",
];

const DemoSection = () => {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setGeneratedImage(null);
    
    const startTime = Date.now();
    
    // Simulate AI generation with random delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1500));
    
    const randomImage = sampleImages[Math.floor(Math.random() * sampleImages.length)];
    setGeneratedImage(randomImage);
    setGenerationTime((Date.now() - startTime) / 1000);
    setIsGenerating(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleReset = () => {
    setPrompt("");
    setGeneratedImage(null);
    setGenerationTime(null);
  };

  return (
    <section id="demo" className="py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 inline mr-2" />
            Live Demo
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Try It <span className="text-gradient">Right Now</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Enter a prompt and watch AI create stunning visuals in seconds. 
            No signup required for this demo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Main Demo Card */}
          <div className="glass-card p-8 rounded-2xl">
            {/* Prompt Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground/80 mb-3">
                Describe your image
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A magical forest with glowing mushrooms and fireflies at night..."
                  className="w-full h-32 px-4 py-3 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all resize-none"
                  disabled={isGenerating}
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {prompt.length}/500
                </div>
              </div>
            </div>

            {/* Prompt Suggestions */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground mb-3">Try these prompts:</p>
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.slice(0, 4).map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    disabled={isGenerating}
                    className="px-3 py-1.5 text-xs bg-background/50 border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all disabled:opacity-50"
                  >
                    {suggestion.slice(0, 35)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex gap-3 mb-8">
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Image
                  </>
                )}
              </Button>
              {generatedImage && (
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="h-12 px-4 border-border/50"
                >
                  <RefreshCw className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Output Area */}
            <div className="relative min-h-[400px] rounded-xl overflow-hidden bg-background/30 border border-border/30">
              <AnimatePresence mode="wait">
                {isGenerating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center"
                  >
                    {/* Loading Animation */}
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <div className="absolute inset-3 border-4 border-accent/20 rounded-full" />
                      <div className="absolute inset-3 border-4 border-accent border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
                      <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-foreground font-medium mb-2">Creating your masterpiece...</p>
                    <p className="text-sm text-muted-foreground">AI is working its magic</p>
                    
                    {/* Progress dots */}
                    <div className="flex gap-1 mt-4">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-primary rounded-full"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </motion.div>
                ) : generatedImage ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="relative h-full"
                  >
                    <img
                      src={generatedImage}
                      alt="AI Generated"
                      className="w-full h-[400px] object-cover"
                    />
                    {/* Overlay Info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Generated in</p>
                          <p className="text-2xl font-bold text-gradient">{generationTime?.toFixed(1)}s</p>
                        </div>
                        <Button variant="glass" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download HD
                        </Button>
                      </div>
                    </div>
                    
                    {/* Success Badge */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute top-4 right-4 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-medium"
                    >
                      ✓ Generation Complete
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
                  >
                    <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-primary" />
                    </div>
                    <p className="text-foreground font-medium mb-2">Your creation will appear here</p>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Enter a detailed prompt above and click Generate to create stunning AI art
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/30">
              <div className="text-center">
                <p className="text-2xl font-bold text-gradient">1024×1024</p>
                <p className="text-xs text-muted-foreground">Resolution</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gradient">FLUX</p>
                <p className="text-xs text-muted-foreground">AI Model</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gradient">~3s</p>
                <p className="text-xs text-muted-foreground">Avg. Time</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DemoSection;
