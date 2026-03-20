"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Wand2,
  Paperclip,
  Settings2,
  Zap,
  Loader2,
  Sparkles,
  ChevronDown,
  Download,
  Share2,
  Copy,
  Play,
  Pause,
  Trash2,
  Star,
  Grid3x3,
  Square,
  Film,
  ArrowLeftRight,
  Maximize2,
  Eye,
  Palette,
  Timer,
  Clock,
  CheckCircle2,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { moduleAPI, galleryAPI, authAPI, modelRegistryAPI, type RegistryModel } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const videoModes = [
  { id: "text-to-video", label: "Text to Video", icon: Video, color: "from-orange-500 to-red-500" },
  // { id: "video-to-video", label: "Video to Video", icon: ArrowLeftRight, color: "from-blue-500 to-cyan-500" },
  // { id: "enhance", label: "Enhance", icon: Wand2, color: "from-pink-500 to-rose-500" },
];

const FALLBACK_VIDEO_MODELS = [
  { id: "cogvideox", name: "CogVideoX", icon: Film, description: "High quality video generation" },
  { id: "runway", name: "Runway Gen-2", icon: Film, description: "Cinematic quality videos" },
  { id: "pika", name: "Pika Labs", icon: Zap, description: "Fast generation" },
  { id: "stability", name: "Stable Video", icon: Video, description: "Stable and consistent" },
];

const registryToVideoModel = (m: RegistryModel) => ({
  id: m.modelId,
  name: m.displayName || m.modelId,
  icon: Film,
  description: (m as { description?: string }).description || (m.costPerRequest != null ? `${m.costPerRequest} credits` : "AI video model"),
});

const quantityOptions = [
  { value: "1", label: "1 Video", badge: "1x" },
  { value: "2", label: "2 Videos", badge: "2x" },
  { value: "3", label: "3 Videos", badge: "3x" },
];

const VideoToolsPage = () => {
  const router = useRouter();
  const [activeMode, setActiveMode] = useState("text-to-video");
  const [videoModels, setVideoModels] = useState<{ id: string; name: string; icon: typeof Film; description: string }[]>(FALLBACK_VIDEO_MODELS);
  const [videoModelsLoading, setVideoModelsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState(FALLBACK_VIDEO_MODELS[0]);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [enhancePrompt, setEnhancePrompt] = useState(false);
  const [numberOfVideos, setNumberOfVideos] = useState("1");
  const [viewMode, setViewMode] = useState<"grid" | "single">("single");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setVideoModelsLoading(true);
    modelRegistryAPI
      .getModels()
      .then((data) => {
        if (cancelled) return;
        const list = data.video ?? [];
        const display = list.length > 0 ? list.map(registryToVideoModel) : FALLBACK_VIDEO_MODELS;
        setVideoModels(display);
        const currentId = selectedModel.id;
        if (!display.some((m) => m.id === currentId)) {
          setSelectedModel(display[0]);
        }
      })
      .catch(() => {
        if (!cancelled) setVideoModels(FALLBACK_VIDEO_MODELS);
      })
      .finally(() => {
        if (!cancelled) setVideoModelsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const extractVideoUrl = (response: unknown): string | null => {
    const r = response as Record<string, unknown>;
    if (r.video) {
      const v = r.video;
      return typeof v === "string" ? v : (v as Record<string, string>)?.url || (v as Record<string, string>)?.data || null;
    }
    if (Array.isArray(r.output) && r.output[0]) return r.output[0] as string;
    if (Array.isArray(r.proxy_links) && r.proxy_links[0]) return r.proxy_links[0] as string;
    if (r.url) return r.url as string;
    if (r.data) {
      const d = r.data as string | { video?: string };
      if (typeof d === "string" && d.startsWith("data:")) return d;
      if (typeof d === "string") return `data:video/mp4;base64,${d}`;
      if (d?.video?.startsWith("data:")) return d.video;
      if (d?.video) return `data:video/mp4;base64,${d.video}`;
    }
    return null;
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setGeneratedVideo(null);
    try {
      const response = await moduleAPI.textToVideo({
        prompt: prompt.trim(),
        model_id: selectedModel.id,
        num_frames: 25,
        width: 512,
        height: 512,
        num_inference_steps: 20,
        guidance_scale: 7,
        fps: 16,
      });

      const videoUrl = extractVideoUrl(response);
      if (videoUrl) {
        setGeneratedVideo(videoUrl);
        // Add to gallery when authenticated and URL is a proper http(s) URL (not data:)
        if (authAPI.isAuthenticated() && videoUrl.startsWith("http")) {
          galleryAPI.createGalleryItem({
            contentType: "video",
            url: videoUrl,
            thumbnailUrl: videoUrl,
            storageKey: videoUrl.replace(/^https?:\/\/[^/]+\//, ""),
            prompt: prompt.trim(),
            modelId: selectedModel.id,
            isPrivate: false,
            mimeType: "video/mp4",
          }).catch(() => { /* silent - don't block UX */ });
        }
        toast.success("Video generated successfully!");
      } else {
        // If we can't extract a video URL, show the response for debugging
        console.log("Video generation response:", response);
        toast.error("Video generated but couldn't extract video URL. Check console for details.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Video generation failed";
      toast.error(msg);
      console.error("Video generation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="video-tools-playground flex flex-col h-screen w-full overflow-hidden bg-background text-foreground relative font-sans selection:bg-primary/30 transition-colors duration-300">
      
      {/* Subtle grid background (reference UI) */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Header – theme-aware with thin border */}
      <div className="relative z-10 flex-shrink-0 border-b border-border bg-card/90 backdrop-blur-xl px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between w-full max-w-[1920px] mx-auto">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative w-10 h-10 flex items-center justify-center cursor-pointer"
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img 
                src="/logo.webp" 
                alt="AKOBOT.ai Logo" 
                className="h-auto w-full max-w-[120px] object-contain"
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
              <h1 className="text-lg font-bold tracking-tight text-foreground">AI Video Playground</h1>
              <p className="text-xs font-medium text-muted-foreground">Create stunning videos with AI</p>
            </div>
          </div>
          
          {/* Mode Switcher */}
          <div className="flex p-1 bg-secondary rounded-xl border border-border">
            {videoModes.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;
              return (
                <motion.button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all z-10 ${
                    isActive ? "text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute inset-0 rounded-lg bg-gradient-to-r ${mode.color} shadow-lg opacity-90`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10 hidden sm:inline">{mode.label}</span>
                  <span className="relative z-10 sm:hidden">{mode.label.split(' ')[0]}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Playground Layout */}
      <div className="relative z-10 flex flex-1 h-full w-full max-w-[1920px] mx-auto min-h-0 gap-4 overflow-hidden p-4 sm:p-6">
        
        {/* LEFT: Input Section - Adaptive Glass Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col w-full lg:w-[30%] min-h-0 h-full"
        >
          <div className="flex flex-col rounded-2xl border border-border bg-card shadow-xl p-5 space-y-5 h-full overflow-y-auto custom-scrollbar">
            
            {/* Header with Model Selector */}
            <div className="flex items-center justify-between pb-4 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center">
                  <Wand2 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Creative Input</h2>
                  <p className="text-[11px] text-muted-foreground">Describe your vision</p>
                </div>
              </div>
              
              {/* Model Selector */}
              <DropdownMenu open={isModelOpen} onOpenChange={setIsModelOpen}>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent border border-border text-foreground text-xs font-medium transition-all"
                  >
                    {(() => {
                      const ModelIcon = selectedModel.icon;
                      return <ModelIcon className="w-3.5 h-3.5 text-primary" />;
                    })()}
                    <span className="hidden sm:inline">{videoModelsLoading ? "Loading..." : selectedModel.name}</span>
                    <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${isModelOpen ? 'rotate-180' : ''}`} />
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-card backdrop-blur-xl border border-border shadow-xl p-1">
                  {videoModels.map((model) => {
                    const ModelIcon = model.icon;
                    const isSelected = selectedModel.id === model.id;
                    return (
                      <DropdownMenuItem
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model);
                          setIsModelOpen(false);
                        }}
                        className={`cursor-pointer hover:bg-accent transition-colors p-2 rounded-md mb-1 ${
                          isSelected ? "bg-primary/10 text-primary" : "text-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <ModelIcon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                          <div className="flex flex-col flex-1">
                            <span className="font-medium text-xs">{model.name}</span>
                            <span className="text-[10px] text-muted-foreground">{model.description}</span>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-primary" />}
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Prompt Input - theme-aware background */}
            <div className="flex-1 flex flex-col min-h-0 space-y-4">
              <div className="flex-1 flex flex-col min-h-0 relative group">
                <label className="block text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-muted-foreground" /> Video Prompt
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A futuristic cityscape at sunset, neon lights reflecting on wet streets, cyberpunk aesthetic..."
                  disabled={activeMode === "video-to-video"}
                  className="w-full flex-1 min-h-[140px] bg-secondary border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm leading-relaxed transition-all"
                />
                <div className="absolute bottom-3 right-3">
                  <Badge variant="outline" className="text-[10px] h-5 border-border bg-background/80 text-muted-foreground">
                    {prompt.length} chars
                  </Badge>
                </div>
              </div>
              
              {/* Video Upload for Video-to-Video */}
              {activeMode === "video-to-video" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="border border-dashed border-border rounded-xl p-6 text-center bg-secondary hover:bg-accent transition-colors cursor-pointer"
                >
                  <Video className="w-8 h-8 mx-auto mb-2 text-primary opacity-80" />
                  <p className="text-sm font-medium text-foreground">Upload source video</p>
                  <p className="text-xs text-muted-foreground mt-1">MP4, MOV up to 50MB</p>
                </motion.div>
              )}
              
              {/* Action row – theme-aware buttons */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border">
                  <Switch
                    checked={enhancePrompt}
                    onCheckedChange={setEnhancePrompt}
                    className="scale-75"
                  />
                  <span className="text-xs font-medium text-muted-foreground">Enhance</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-accent border border-border text-xs font-medium text-muted-foreground hover:text-foreground transition-all"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>Improve</span>
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPrompt("")}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary hover:bg-accent border border-border text-muted-foreground hover:text-destructive transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Quantity & Duration – theme-aware borders */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Quantity
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="w-full flex items-center justify-between px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-xs hover:bg-accent hover:border-primary/50 transition-all focus:outline-none focus:ring-1 focus:ring-primary/20 group">
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-background flex items-center justify-center text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors border border-border">
                           {numberOfVideos}
                        </span>
                        <span>{numberOfVideos === "1" ? "Video" : "Videos"}</span>
                      </span>
                      <ChevronDown className="w-3 h-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-[140px] bg-card backdrop-blur-xl border border-border shadow-xl p-1 z-50">
                    {quantityOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => setNumberOfVideos(option.value)}
                        className={`cursor-pointer flex items-center justify-between p-2 rounded-md text-xs mb-1 last:mb-0 ${
                          numberOfVideos === option.value
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-accent"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                           <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border ${
                              numberOfVideos === option.value 
                                ? "bg-primary/20 text-primary border-primary/30" 
                                : "bg-secondary text-muted-foreground border-border"
                           }`}>
                              {option.value}
                           </span>
                           {option.label}
                        </div>
                        {numberOfVideos === option.value && <CheckCircle2 className="w-3 h-3 text-primary" />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Duration
                </label>
                <div className="px-3 py-2 bg-secondary border border-border rounded-lg flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground">5 seconds</span>
                  <Badge variant="outline" className="text-[9px] h-4 border-border text-muted-foreground">Auto</Badge>
                </div>
              </div>
            </div>

            {/* Generate Button – purple–magenta gradient (reference) */}
            <motion.div
              whileHover={{ scale: isLoading || !prompt.trim() ? 1 : 1.02 }}
              whileTap={{ scale: isLoading || !prompt.trim() ? 1 : 0.98 }}
              className="pt-2"
            >
              <Button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full h-11 relative overflow-hidden bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-500 hover:via-pink-500 hover:to-pink-400 text-white font-semibold text-sm shadow-lg border-0 transition-all"
              >
                {/* Shimmer Effect */}
                 {!isLoading && (
                   <div className="absolute inset-0 -translate-x-full hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                )}
                
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin text-white/80" />
                    <span className="animate-pulse">Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 fill-white/20" />
                    Generate Video
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT: Output Section - Adaptive Glass Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col w-full lg:w-[70%] min-h-0 h-full"
        >
          <div className="flex flex-col rounded-2xl border border-border bg-card shadow-xl p-6 space-y-6 h-full min-h-0 overflow-hidden relative">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border flex-shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary border border-border flex items-center justify-center">
                  <Eye className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Live Preview</h2>
                  <p className="text-[11px] text-muted-foreground">Real-time generation</p>
                </div>
              </div>
              <div className="flex items-center gap-1 bg-secondary p-1 rounded-lg border border-border">
                <motion.button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  title="Grid View"
                >
                  <Grid3x3 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => setViewMode("single")}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === "single" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  title="Single View"
                >
                  <Square className="w-4 h-4" />
                </motion.button>
                <div className="w-px h-4 bg-border mx-1" />
                <motion.button
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            {/* Video Preview Area – theme-aware with grid */}
            <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden bg-background rounded-xl border border-border relative group">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
              
              <AnimatePresence mode="wait">
                {isLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center w-full z-10"
                  >
                    <div className="w-full max-w-xl rounded-2xl border border-border bg-card/80 dark:bg-black/70 shadow-lg overflow-hidden">
                      <div className="h-56 sm:h-72 bg-muted/70 dark:bg-zinc-900 animate-pulse" />
                      <div className="p-4 sm:p-5 space-y-3 bg-card/90 dark:bg-black">
                        <div className="h-4 w-36 rounded-full bg-muted/80 animate-pulse" />
                        <div className="flex gap-2">
                          <div className="h-3 w-24 rounded-full bg-muted/70 animate-pulse" />
                          <div className="h-3 w-16 rounded-full bg-muted/60 animate-pulse" />
                        </div>
                        <div className="flex gap-2">
                          <div className="h-9 w-24 rounded-full bg-muted/80 animate-pulse" />
                          <div className="h-9 w-24 rounded-full bg-muted/70 animate-pulse" />
                        </div>
                      </div>
                    </div>
                    <p className="mt-4 text-xs text-muted-foreground">Generating your video…</p>
                  </motion.div>
                ) : generatedVideo ? (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full h-full flex flex-col min-h-0 space-y-4 p-4 z-10"
                  >
                    <div className="relative rounded-lg overflow-hidden flex-1 min-h-0 bg-black border border-border shadow-2xl group/video">
                      <video
                        src={generatedVideo}
                        className="w-full h-full object-contain"
                        controls={false}
                        autoPlay
                        loop
                        ref={(video) => {
                          if (video) {
                            video.onplay = () => setIsPlaying(true);
                            video.onpause = () => setIsPlaying(false);
                          }
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 dark:bg-black/60 opacity-0 group-hover/video:opacity-100 transition-opacity duration-300">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => {
                            const video = e.currentTarget.parentElement?.previousElementSibling as HTMLVideoElement;
                            if (video) isPlaying ? video.pause() : video.play();
                          }}
                          className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all border border-white/30 shadow-2xl"
                        >
                          {isPlaying ? (
                            <Pause className="w-8 h-8 text-white fill-white" />
                          ) : (
                            <Play className="w-8 h-8 text-white ml-1 fill-white" />
                          )}
                        </motion.button>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-emerald-500/90 backdrop-blur-md text-white border-0 text-[10px] px-2 py-0.5">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Generated
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <Button variant="outline" size="sm" className="flex-1 gap-2 border-border bg-secondary hover:bg-accent text-foreground transition-all shadow-sm">
                        <Download className="w-3.5 h-3.5" /> Download
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 gap-2 border-border bg-secondary hover:bg-accent text-foreground transition-all shadow-sm">
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </Button>
                      <Button variant="outline" size="sm" className="gap-2 border-border bg-secondary hover:bg-accent text-foreground transition-all shadow-sm">
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center w-full max-w-md px-4 z-10"
                  >
                    <div className="relative w-24 h-24 mb-6">
                       <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
                       <div className="relative w-full h-full rounded-2xl bg-secondary border border-border flex items-center justify-center">
                         <Sparkles className="w-10 h-10 text-muted-foreground" />
                       </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      Ready to Create
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                      Enter your prompt in the sidebar and click generate to watch your imagination come to life.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VideoToolsPage;