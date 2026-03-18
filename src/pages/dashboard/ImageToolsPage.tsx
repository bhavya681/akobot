"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Sparkles,
  Copy,
  Image as ImageIcon,
  Info,
  HelpCircle,
  FlaskConical,
  Search,
  Filter,
  User,
  Play,
  ChevronDown,
  RefreshCw,
  Plus,
  StickyNote,
  Upload,
  X,
  Edit2,
  Download,
  Heart,
  Share2,
  MoreVertical,
  Check,
  Menu,
  Maximize2,
  Type,
  ArrowLeftRight,
  Eraser,
  Wand2,
  Shuffle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { moduleAPI, galleryAPI, authAPI, modelRegistryAPI, type RegistryModel } from "@/lib/api";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Polished loader used during rendering
const FancyLoader = ({ progress = 0 }: { progress?: number }) => {
  return (
    <div className="w-full p-5 rounded-2xl bg-card border border-border shadow-md">
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12">
          {/* Outer rotating gradient ring */}
          <span className="absolute inset-0 rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-violet-500 via-fuchsia-500 to-violet-500 animate-spin [animation-duration:2.4s]" />
          {/* Mask to create ring */}
          <span className="absolute inset-1 rounded-full bg-card border border-border" />
          {/* Inner pulsing dot */}
          <span className="absolute inset-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 animate-pulse shadow-[0_0_20px_rgba(139,92,246,0.45)]" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Rendering</span>
            <span className="text-xs font-bold text-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-secondary overflow-hidden">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_2px_8px_rgba(236,72,153,0.35)]"
              style={{ width: `${Math.max(6, Math.min(100, progress))}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">Synthesizing details…</p>
        </div>
      </div>
    </div>
  );
};

// Tool mode – header segment options
type ToolMode = "text2image" | "image2image" | "bg-removal" | "upscale";

const headerModes: { id: ToolMode; label: string; icon: typeof ImageIcon }[] = [
  { id: "text2image", label: "Text to Image", icon: Type },
  { id: "image2image", label: "Image to Image", icon: ArrowLeftRight },
  // { id: "bg-removal", label: "BG Removal", icon: Eraser },
  // { id: "upscale", label: "Upscale", icon: Maximize2 },
];

const FALLBACK_IMAGE_MODELS: { id: string; name: string; description: string; badge: string | null }[] = [
  { id: "flux-2-dev", name: "Flux 2 Dev", description: "High quality image generation", badge: "Pro" },
  { id: "flux-kontext-dev", name: "Kingly", description: "Advanced context understanding", badge: "New" },
  { id: "gen3", name: "Gen3", description: "Next-gen image model", badge: "Beta" },
  { id: "sdxl", name: "SDXL", description: "Stable Diffusion XL", badge: null },
  { id: "dalle-3", name: "DALL-E 3", description: "OpenAI's latest model", badge: "Premium" },
];

const IMAGE_TO_IMAGE_MODELS: { id: string; name: string; description: string; badge: string | null }[] = [
  { id: "flux", name: "flux", description: "Base image to image generation", badge: null },
  { id: "flux-kontext-dev", name: "flux-kontext-dev", description: "Advanced context understanding", badge: "New" },
  { id: "flux-kontext-pro", name: "flux-kontext-pro", description: "Professional generation", badge: "Pro" },
];

// Styles
const styles = [
  { id: "dynamic", name: "Dynamic" },
  { id: "cinematic", name: "Cinematic" },
  { id: "photographic", name: "Photographic" },
  { id: "anime", name: "Anime" },
  { id: "3d", name: "3D Render" },
];

// Aspect ratios
const aspectRatios = [
  { value: "2:3", label: "2:3", icon: "📐" },
  { value: "1:1", label: "1:1", icon: "⬜" },
  { value: "16:9", label: "16:9", icon: "📺" },
  { value: "4:3", label: "4:3", icon: "🖼️" },
];

// Task type
type TaskStatus = "pending" | "processing" | "completed" | "failed";

interface GeneratedImage {
  id: string;
  prompt: string;
  imageUrl: string;
  model: string;
  style?: string;
  aspectRatio: string;
  createdAt: Date;
  width: number;
  height: number;
}

interface Task {
  id: string;
  prompt: string;
  status: TaskStatus;
  progress: number;
  model: string;
  style?: string;
  aspectRatio: string;
  estimatedTime?: string;
  createdAt: Date;
  result?: string;
}

const registryToDisplay = (m: RegistryModel) => ({
  id: m.modelId,
  name: m.displayName || m.modelId,
  description: (m as { description?: string }).description || "AI image model",
  badge: m.costPerRequest != null ? `${m.costPerRequest} credits` : null,
});

const ImageToolsPage = () => {
  const router = useRouter();
  const [toolMode, setToolMode] = useState<ToolMode>("text2image");
  const [imageModels, setImageModels] = useState<{ id: string; name: string; description: string; badge: string | null }[]>(FALLBACK_IMAGE_MODELS);
  const [imageModelsLoading, setImageModelsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState("flux-2-dev");
  const [selectedStyle, setSelectedStyle] = useState("dynamic");
  const [prompt, setPrompt] = useState("");
  const [generationMode, setGenerationMode] = useState<"standard" | "quality">("standard");
  const [promptMagic, setPromptMagic] = useState<"auto" | "on" | "off">("auto");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numImages, setNumImages] = useState(1);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [referenceImageUrl, setReferenceImageUrl] = useState("");
  const [strength, setStrength] = useState(0.7);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modelPickerOpen, setModelPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const randomPrompts = [
    "A futuristic cyberpunk city at night with towering neon-lit skyscrapers, flying cars with glowing trails, holographic advertisements, rain-slicked streets reflecting colorful lights, cinematic composition, highly detailed, 8k resolution, volumetric fog",
    "A majestic African lion with a flowing golden mane standing on a rocky cliff at golden hour, dramatic backlighting creating a silhouette, lush savanna landscape in the background, hyper-realistic photography, national geographic style",
    "An enchanted magical forest with giant glowing mushrooms in various colors, fireflies illuminating the scene, fairy lights floating through the air, ancient twisted trees with glowing runes, mystical fog, fantasy art style",
    "A steampunk mechanical robot with brass gears and copper wiring playing an electric guitar in a Victorian-era parlor, warm fireplace lighting, vintage posters on the wall, leather furniture, detailed illustration",
    "A serene traditional Japanese garden in spring with cherry blossom trees in full bloom, pink petals falling, koi pond with graceful fish, stone lantern, torii gate in distance, peaceful atmosphere, soft natural lighting",
    "An astronaut floating in deep space, Earth perfectly reflected in the curved helmet visor showing continents and oceans, distant stars and nebulae in background, dramatic spacecraft in foreground, cinematic lighting",
    "A magnificent dragon made of transparent crystalline materials flying over snow-covered mountain range, ice crystals trailing from wings, aurora borealis in night sky, breath of cold mist, fantasy concept art",
    "A cozy artisan coffee shop interior with exposed brick walls, warm Edison bulb lighting, vintage leather armchairs, shelves filled with books, espresso machine on counter, steam rising from cups, inviting atmosphere",
    "A powerful warrior queen in elaborate golden armor with intricate filigree patterns, gemstone-encrusted crown, holding a legendary sword, commanding presence, epic fantasy portrait, dramatic lighting",
    "A breathtaking mountain range at twilight with vibrant aurora borealis dancing across the sky in greens and purities, snow-capped peaks, misty valleys below, ethereal atmosphere, landscape photography",
    "A vibrant underwater coral reef scene with tropical fish in every color, sea turtles gliding past,珊瑚 in rainbow colors, sunbeams penetrating from above, biodiverse marine ecosystem, photorealistic",
    "A vintage classic motorcycle in a retro-styled garage, chrome details gleaming, vintage posters of pin-up models and racing posters on brick walls, workbench with tools, warm amber lighting",
    "A fantasy castle on a floating island in the clouds, multiple towers with flags, cascading waterfalls falling into the void, rainbow mist, ancient trees, magical energy beams, concept art style",
    "A minimalist ultra-modern bedroom in a luxury seaside villa, floor-to-ceiling windows overlooking endless ocean, clean lines, beige and white palette, king bed, infinity pool visible, serene vibe",
    "A spectacular cosmic nebula with swirling colorful galaxies, newborn stars, cosmic dust clouds in purples and blues, distant planets, interstellar medium, space telescope photography style",
    "A bustling Tokyo street food vendor stall at night, lantern strings glowing warmly, steam rising from cooking pots, delicious ramen bowls, busy neon signs in Japanese, rainy reflections on ground",
    "A magnificent phoenix rising from vibrant orange and red flames, feathers with gradient from yellow to crimson, embers floating upward, powerful wings spread, rebirth symbolism, fantasy illustration",
    "An ancient enchanted library with towering bookshelves reaching ceiling, floating magical books glowing, spiral staircase, crystal chandelier, dust particles in light beams, mysterious atmosphere",
    "A glamorous fashion model on a high fashion runway, dramatic stage lighting, camera flashes, elaborate couture dress with intricate details, runway perspective, Vogue magazine style",
    "A stunning bouquet of wildflowers in a crystal clear glass vase, peonies and roses and lavender, soft watercolor painting background with blend of pastels, artistic photography, light and airy",
    "A hyper-realistic close-up of a human eye reflecting a cityscape, detailed iris with multiple colors, moisture droplets on surface, cinematic macro photography, dramatic depth of field",
    "A tranquil zen meditation room with floor cushions, minimal aesthetic, bamboo walls, koi pond visible through window, soft diffused light, Japanese aesthetic, peaceful harmony",
    "A explosive volcanic eruption at night, glowing lava rivers, ash clouds lit by molten rock, dramatic sky, satellite view or drone perspective, geological phenomenon, highly detailed",
    "A whimsical candy land scene with giant lollipops, gumdrop mountains, chocolate river, cotton candy clouds, playful saturated colors, storybook illustration style, childhood wonder",
    "A dark and moody gothic cathedral interior with stained glass windows casting colorful light, stone arches, candlelit atmosphere, fog, mysterious and atmospheric, dramatic shadows",
  ];

  const handleRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * randomPrompts.length);
    setPrompt(randomPrompts[randomIndex]);
  };

  const currentAvailableModels = toolMode === "image2image" ? IMAGE_TO_IMAGE_MODELS : imageModels;

  useEffect(() => {
    if (toolMode === "image2image") {
      if (!IMAGE_TO_IMAGE_MODELS.some(m => m.id === selectedModel)) {
        setSelectedModel(IMAGE_TO_IMAGE_MODELS[0].id);
      }
    } else {
      if (!imageModels.some(m => m.id === selectedModel) && imageModels.length > 0) {
        setSelectedModel(imageModels[0].id);
      }
    }
  }, [toolMode, imageModels]);

  useEffect(() => {
    let cancelled = false;
    setImageModelsLoading(true);
    modelRegistryAPI
      .getModels()
      .then((data) => {
        if (cancelled) return;
        const imageList = data.image ?? [];
        const i2iList = data.image_to_image ?? [];
        const combined = [...imageList, ...i2iList.filter((m) => !imageList.some((i) => i.modelId === m.modelId))];
        const display = combined.length > 0 ? combined.map(registryToDisplay) : FALLBACK_IMAGE_MODELS;
        setImageModels(display);
        if (display.length > 0 && !display.some((m) => m.id === selectedModel)) {
          setSelectedModel(display[0].id);
        }
      })
      .catch(() => {
        if (!cancelled) setImageModels(FALLBACK_IMAGE_MODELS);
      })
      .finally(() => {
        if (!cancelled) setImageModelsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  // Get current date
  const getCurrentDate = () => {
    const date = new Date();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImage(reader.result as string);
          setUploadedImageFile(file);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please upload a valid image file");
      }
    }
  };

  // Handle URL input for reference image
  const handleUrlImageLoad = async () => {
    if (!referenceImageUrl.trim()) return;
    try {
      const response = await fetch(referenceImageUrl);
      if (!response.ok) throw new Error("Failed to load image");
      const blob = await response.blob();
      const file = new File([blob], "reference-image.jpg", { type: blob.type });
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
        setUploadedImageFile(file);
      };
      reader.readAsDataURL(file);
      toast.success("Image loaded from URL");
    } catch (error) {
      toast.error("Failed to load image from URL");
    }
  };

  // Remove uploaded image
  const handleRemoveImage = () => {
    setUploadedImage(null);
    setUploadedImageFile(null);
    setReferenceImageUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper function to extract image from response (backend returns image_url, output, proxy_links)
  const extractImageFromResponse = (response: any): string | null => {
    if (response.image_url && typeof response.image_url === "string") {
      return response.image_url.startsWith("data:") ? response.image_url : response.image_url;
    }
    if (response.output?.[0] && typeof response.output[0] === "string") {
      const o = response.output[0];
      if (o.startsWith("data:") || o.startsWith("http")) return o;
      return `data:image/png;base64,${o}`;
    }
    if (response.proxy_links?.[0] && typeof response.proxy_links[0] === "string") {
      return response.proxy_links[0];
    }
    if (response.image_base64) {
      return response.image_base64.startsWith("data:")
        ? response.image_base64
        : `data:image/${response.mime?.split("/")[1] || "png"};base64,${response.image_base64}`;
    }
    if (response.base64) {
      return response.base64.startsWith("data:")
        ? response.base64
        : `data:image/png;base64,${response.base64}`;
    }
    if (response.data) {
      if (typeof response.data === "string") {
        return response.data.startsWith("data:")
          ? response.data
          : `data:image/png;base64,${response.data}`;
      }
      if (response.data.image_base64) {
        return response.data.image_base64.startsWith("data:")
          ? response.data.image_base64
          : `data:image/${response.data.mime?.split("/")[1] || "png"};base64,${response.data.image_base64}`;
      }
      if (response.data.base64) {
        return response.data.base64.startsWith("data:")
          ? response.data.base64
          : `data:image/png;base64,${response.data.base64}`;
      }
      if (response.data.image) {
        return response.data.image.startsWith("data:")
          ? response.data.image
          : `data:image/png;base64,${response.data.image}`;
      }
    }
    if (response.image) {
      return response.image.startsWith("data:")
        ? response.image
        : `data:image/png;base64,${response.image}`;
    }
    return null;
  };

  // Handle generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (
      (toolMode === "image2image" || toolMode === "bg-removal" || toolMode === "upscale") &&
      !uploadedImage && !uploadedImageFile
    ) {
      toast.error("Please upload an image first");
      return;
    }

    setIsGenerating(true);

    const newTasks: Task[] = [];
    for (let i = 0; i < numImages; i++) {
      const newTask: Task = {
        id: `task-${Date.now()}-${i}`,
        prompt: prompt.trim(),
        status: "pending",
        progress: 0,
        model: selectedModel,
        style: selectedStyle,
        aspectRatio: aspectRatio,
        createdAt: new Date(),
      };
      newTasks.push(newTask);
    }

    setTasks((prev) => [...newTasks, ...prev]);

    for (const task of newTasks) {
      processTask(task);
    }

    setPrompt("");
  };

  // Process a single task
  const processTask = async (task: Task) => {
    try {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: "processing", progress: 5 } : t
        )
      );

      const progressInterval = setInterval(() => {
        setTasks((prev) =>
          prev.map((t) => {
            if (t.id === task.id && t.status === "processing") {
              const newProgress = Math.min(t.progress + Math.random() * 15, 90);
              return { ...t, progress: newProgress };
            }
            return t;
          })
        );
      }, 500);

      let imageUrl: string | null = null;

      if (toolMode === "text2image") {
        const ratio = aspectRatios.find((r) => r.value === aspectRatio);
        const width = 512;
        const height = 512;

        const response = await moduleAPI.imageGen({
          prompt: task.prompt,
          model_id: selectedModel,
          width,
          height,
        });
        imageUrl = extractImageFromResponse(response);
        if (!imageUrl && response && typeof response === "object" && "id" in response && typeof response.id === "string") {
          const fetched = await moduleAPI.fetchImageResult(response.id);
          imageUrl = extractImageFromResponse(fetched);
        }
      } else if (toolMode === "image2image" || toolMode === "upscale") {
        let fileToSend: File | undefined;
        let initImageBase64: string | undefined;

        if (uploadedImageFile) {
          fileToSend = uploadedImageFile;
        } else if (uploadedImage) {
          const base64String = uploadedImage.includes(",")
            ? uploadedImage.split(",")[1]
            : uploadedImage;
          initImageBase64 = base64String;
        }

        const response = await moduleAPI.imageToImage({
          prompt: task.prompt,
          model_id: selectedModel,
          file: fileToSend,
          init_image: fileToSend ? undefined : initImageBase64,
          strength: toolMode === "upscale" ? 0.35 : strength,
        });

        imageUrl = extractImageFromResponse(response);
      } else if (toolMode === "bg-removal") {
        let fileToSend: File | undefined;
        let initImageBase64: string | undefined;

        if (uploadedImageFile) {
          fileToSend = uploadedImageFile;
        } else if (uploadedImage) {
          const base64String = uploadedImage.includes(",")
            ? uploadedImage.split(",")[1]
            : uploadedImage;
          initImageBase64 = base64String;
        }

        const response = await moduleAPI.backgroundRemoval({
          file: fileToSend,
          init_image: fileToSend ? undefined : initImageBase64,
        });

        imageUrl = extractImageFromResponse(response);
      }

      clearInterval(progressInterval);

      if (imageUrl) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: "completed", progress: 100, result: imageUrl }
              : t
          )
        );

        const ratio = aspectRatios.find((r) => r.value === aspectRatio);
        const width = ratio?.value === "1:1" ? 1024 : ratio?.value === "2:3" ? 768 : ratio?.value === "16:9" ? 1024 : 1024;
        const height = ratio?.value === "1:1" ? 1024 : ratio?.value === "2:3" ? 1152 : ratio?.value === "16:9" ? 576 : 1024;

        const newImage: GeneratedImage = {
          id: task.id,
          prompt: task.prompt,
          imageUrl: imageUrl,
          model: selectedModel,
          style: selectedStyle,
          aspectRatio: aspectRatio,
          createdAt: new Date(),
          width,
          height,
        };

        setGeneratedImages((prev) => [newImage, ...prev]);
        if (!selectedImage) setSelectedImage(newImage);

        // Add to gallery when authenticated and URL is a proper http(s) URL (not data:)
        if (authAPI.isAuthenticated() && imageUrl.startsWith("http")) {
          galleryAPI.createGalleryItem({
            contentType: toolMode === "image2image" || toolMode === "upscale" ? "image_to_image" : "image",
            url: imageUrl,
            thumbnailUrl: imageUrl,
            storageKey: imageUrl.replace(/^https?:\/\/[^/]+\//, ""),
            prompt: task.prompt,
            modelId: selectedModel,
            isPrivate: false,
            mimeType: "image/png",
          }).catch(() => { /* silent - don't block UX */ });
        }

        toast.success("Creation complete!");
        setIsGenerating(false);
      } else {
        throw new Error("No image in response. Try again or use a different prompt.");
      }
    } catch (error: any) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: "failed", progress: 0 } : t
        )
      );
      toast.error(error?.message || "Generation failed. Ensure MODELSLAB_API_KEY is set in the backend.");
      setIsGenerating(false);
    }
  };

  // Download image (fetch as blob so external URLs don't open in same tab)
  const handleDownloadImage = async (image: GeneratedImage, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const url = image.imageUrl;
      const filename = `creation-${image.id}.png`;
      if (url.startsWith("data:")) {
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const res = await fetch(url, { mode: "cors" });
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
      toast.success("Downloaded!");
    } catch (err) {
      toast.error("Download failed. Try right‑click → Save image.");
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden selection:bg-primary/30 transition-colors duration-200">
      {/* TOP NAVIGATION BAR – theme-aware header */}
      <div className="flex-shrink-0 min-h-[52px] py-2 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 z-50">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 lg:hidden hover:bg-accent shrink-0"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3 min-w-0">
            <motion.div
              className="relative w-10 h-10 flex items-center justify-center shrink-0 cursor-pointer"
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img
                src="/logo.webp"
                alt="AKO.ai Logo"
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
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                Image generation tool
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                Create images with AI
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-0.5 p-1 rounded-xl bg-secondary border border-border flex-wrap justify-end max-w-full">
          {headerModes.map((mode) => {
            const isActive = toolMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setToolMode(mode.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-[#FF6B47] to-[#FF9A4D] text-white shadow-md"
                    : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-md z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* LEFT SIDEBAR – theme-aware sidebar */}
        <div className={cn(
          "w-72 sm:w-80 flex-shrink-0 border-r border-border bg-card overflow-y-auto fixed lg:static inset-y-0 left-0 z-50 lg:z-auto transform transition-all duration-300 ease-in-out shadow-xl lg:shadow-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}>
          <div className="pt-2 px-4 pb-4 sm:pt-3 sm:px-5 sm:pb-5 space-y-5">
            <div className="flex items-center justify-between lg:hidden pb-3 border-b border-border">
              <span className="text-sm font-bold text-foreground">Studio Settings</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSidebarOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Model – dropdown with vibrant gradient border (no label above) */}
            <div>
              <div className="rounded-xl overflow-hidden p-[2px] bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-500 shadow-[0_0_0_1px_rgba(168,85,247,0.5),0_0_16px_rgba(168,85,247,0.35)]">
                <Popover open={modelPickerOpen} onOpenChange={setModelPickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={imageModelsLoading && toolMode !== "image2image"}
                      className="w-full h-12 rounded-[10px] bg-secondary border border-border flex items-center justify-between gap-2 px-4 text-left hover:bg-accent transition-all disabled:opacity-70"
                    >
                      <span className="font-semibold text-base text-foreground truncate">
                        {imageModelsLoading && toolMode !== "image2image" ? "Loading models..." : (currentAvailableModels.find((m) => m.id === selectedModel)?.name ?? selectedModel)}
                      </span>
                      {currentAvailableModels.find((m) => m.id === selectedModel)?.badge && (
                        <Badge className="text-[9px] h-5 bg-primary/10 text-primary border-0 shrink-0">
                          {currentAvailableModels.find((m) => m.id === selectedModel)?.badge}
                        </Badge>
                      )}
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="right"
                    sideOffset={8}
                    className="w-[320px] sm:w-[360px] p-0 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
                  >
                    <div className="p-3 border-b border-border bg-secondary">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Choose model</span>
                    </div>
                    <div className="max-h-[320px] overflow-y-auto p-2 space-y-1.5">
                      {currentAvailableModels.map((model) => {
                        const isSelected = selectedModel === model.id;
                        return (
                          <button
                            key={model.id}
                            type="button"
                            onClick={() => {
                              setSelectedModel(model.id);
                              setModelPickerOpen(false);
                            }}
                            className={cn(
                              "w-full rounded-xl p-3 text-left transition-all border",
                              isSelected
                                ? "bg-primary/10 border-primary/50 shadow-sm"
                                : "bg-secondary border-transparent hover:bg-accent hover:border-border"
                            )}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-semibold text-sm text-foreground">{model.name}</span>
                                  {model.badge && (
                                    <Badge className="text-[9px] h-4 bg-primary/10 text-primary border-0">{model.badge}</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{model.description}</p>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Reference Image Upload – section with sub-border */}
            {(toolMode !== "text2image") && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Source Image</label>
                {uploadedImage ? (
                  <div className="relative group rounded-lg overflow-hidden border border-border bg-secondary shadow-inner">
                    <img src={uploadedImage} alt="Ref" className="w-full h-auto max-h-[180px] object-cover opacity-80 group-hover:opacity-100 transition-all" />
                    <div className="absolute inset-0 bg-black/40 dark:bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all">
                      <Button onClick={() => fileInputRef.current?.click()} size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md"><Edit2 className="w-3 h-3" /></Button>
                      <Button onClick={handleRemoveImage} size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-md"><X className="w-3 h-3" /></Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center border border-dashed border-border rounded-lg p-8 cursor-pointer hover:border-primary hover:bg-accent transition-all group bg-secondary">
                    <div className="w-10 h-10 rounded-full bg-accent border border-border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">Upload base image</span>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            )}

            {/* Style – dropdown with icon, subtle border */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-3.5 h-3.5 text-muted-foreground" />
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Style</label>
              </div>
              <Select value={selectedStyle} onValueChange={(v) => setSelectedStyle(v)}>
                <SelectTrigger className="h-11 rounded-lg bg-secondary border border-border text-foreground font-medium text-base focus:ring-2 focus:ring-primary/20">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {styles.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="focus:bg-accent text-foreground">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Content dimension – section with gradient border on selected */}
            {toolMode === "text2image" && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground">Content dimension</span>
                  <button type="button" className="p-0.5 rounded-full text-muted-foreground hover:text-foreground" aria-label="Help">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {aspectRatios.map((ratio) => {
                    const isSelected = aspectRatio === ratio.value;
                    return (
                      <button
                        key={ratio.value}
                        type="button"
                        onClick={() => setAspectRatio(ratio.value)}
                        className={cn(
                          "h-12 flex flex-col items-center justify-center gap-1 rounded-lg transition-all font-bold text-[9px] text-foreground relative overflow-hidden",
                          isSelected
                            ? "shadow-[0_0_0_1px_rgba(168,85,247,0.5),0_0_14px_rgba(168,85,247,0.35)] dark:shadow-[0_0_0_1px_rgba(168,85,247,0.5),0_0_14px_rgba(168,85,247,0.35)]"
                            : "border border-border bg-secondary hover:bg-accent hover:border-primary/50"
                        )}
                      >
                        {isSelected ? (
                          <span className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-500">
                            <span className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[5px] bg-card text-foreground">
                              <span className="text-sm">{ratio.icon}</span>
                              <span>{ratio.label}</span>
                            </span>
                          </span>
                        ) : (
                          <>
                            <span className="text-sm">{ratio.icon}</span>
                            <span>{ratio.label}</span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Number of images – gradient border on selected, help icon */}
            {toolMode === "text2image" && (
              <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground">Number of images</span>
                  <button type="button" className="p-0.5 rounded-full text-muted-foreground hover:text-foreground" aria-label="Help">
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4].map((n) => {
                    const isSelected = numImages === n;
                    return (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setNumImages(n)}
                        className={cn(
                          "h-10 min-w-10 px-4 rounded-lg font-bold text-sm text-foreground transition-all relative",
                          isSelected
                            ? "shadow-[0_0_0_1px_rgba(168,85,247,0.5),0_0_14px_rgba(168,85,247,0.35)] dark:shadow-[0_0_0_1px_rgba(168,85,247,0.5),0_0_14px_rgba(168,85,247,0.35)]"
                            : "border border-border bg-secondary hover:bg-accent hover:border-primary/50"
                        )}
                      >
                        {isSelected ? (
                          <span className="absolute inset-0 rounded-lg p-[2px] bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-500">
                            <span className="flex h-full w-full items-center justify-center rounded-[5px] bg-card">
                              {n}
                            </span>
                          </span>
                        ) : (
                          n
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Advanced settings – dropdown, clear sub-border */}
            <Collapsible>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <CollapsibleTrigger className="group flex w-full items-center justify-between p-4 text-left hover:bg-accent transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Advanced settings</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border">
                    <div className="space-y-1.5 pt-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Seed (optional)</label>
                      <Input
                        type="number"
                        placeholder="Random"
                        className="h-9 text-sm bg-secondary border border-border placeholder:text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Steps</label>
                      <Input
                        type="number"
                        defaultValue="28"
                        min={1}
                        max={50}
                        className="h-9 text-sm bg-secondary border border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Guidance scale</label>
                      <Input
                        type="number"
                        defaultValue="7.5"
                        min={1}
                        max={20}
                        step={0.5}
                        className="h-9 text-sm bg-secondary border border-border"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>

            {/* Enhance & Reset – single row with icons */}
            <div className="rounded-xl border border-border bg-card p-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/50 transition-all"
                  title="Enhance"
                >
                  <Wand2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium">Enhance</span>
                </button>
                <button
                  type="button"
                  className="flex-1 flex items-center justify-center gap-2 h-9 rounded-lg border border-border bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary/50 transition-all"
                  title="Reset"
                >
                  <RefreshCw className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-medium">Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA – output area with theme-aware grid background */}
        <div className="flex-1 flex flex-col bg-background relative transition-colors duration-300">
          {/* Generated output at top – more space for larger images */}
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 relative">
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
            <div className="relative z-10 p-5 sm:p-8 max-w-7xl mx-auto min-h-full">
              {generatedImages.length === 0 && !isGenerating ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-center py-12">
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 rounded-2xl bg-muted border border-border shadow-lg" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="w-10 h-10 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Ready to Create</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Enter your prompt in the sidebar and click generate to watch your imagination come to life.
                  </p>
                </div>
              ) : generatedImages.length === 0 && isGenerating ? (
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-center py-12">
                  <div className="w-full max-w-3xl rounded-2xl border border-border bg-card/80 dark:bg-black/60 shadow-lg overflow-hidden">
                    <div className="h-64 sm:h-80 bg-muted/70 dark:bg-zinc-900 animate-pulse" />
                    <div className="p-4 sm:p-5 space-y-3 bg-card/90 dark:bg-black">
                      <div className="h-4 w-40 rounded-full bg-muted/80 animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-3 w-24 rounded-full bg-muted/70 animate-pulse" />
                        <div className="h-3 w-16 rounded-full bg-muted/60 animate-pulse" />
                      </div>
                      <div className="h-9 w-32 rounded-full bg-muted/80 animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">Generating your image…</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Centered main image in output area */}
                  <div className="flex flex-col items-center justify-center min-h-[50vh]">
                    {selectedImage && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-xl max-w-3xl w-full"
                      >
                        <img
                          src={selectedImage.imageUrl}
                          alt="Generated"
                          className="w-full h-auto max-h-[70vh] object-contain block"
                        />
                        <button
                          type="button"
                          onClick={(e) => handleDownloadImage(selectedImage, e)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                          title="Download"
                          aria-label="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )}

                    {/* Thumbnail strip to switch image */}
                    {generatedImages.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto py-4 no-scrollbar justify-center flex-wrap">
                        {generatedImages.map((image) => (
                          <button
                            key={image.id}
                            type="button"
                            onClick={() => setSelectedImage(image)}
                            className={cn(
                              "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                              selectedImage?.id === image.id ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/50"
                            )}
                          >
                            <img src={image.imageUrl} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Prompt line + small download when one image */}
                    {selectedImage && generatedImages.length === 1 && (
                      <p className="text-sm text-muted-foreground text-center max-w-xl mt-2 line-clamp-2">"{selectedImage.prompt}"</p>
                    )}
                  </div>

                  {/* Rendering Progress */}
                  {tasks.filter(t => t.status !== "completed" && t.status !== "failed").length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                      {tasks
                        .filter(t => t.status !== "completed" && t.status !== "failed")
                        .map(task => (
                          <FancyLoader key={task.id} progress={task.progress} />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Prompt area at bottom – compact so output area gets more space */}
          <div className="flex-shrink-0 p-3 sm:p-4 border-t border-border bg-card">
            <div className="w-full min-h-0">
              <div className="rounded-xl bg-secondary border border-border shadow-lg overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your imagination in detail..."
                    className="min-h-[72px] max-h-[96px] w-full bg-transparent border-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0 resize-none p-0 text-foreground rounded-none"
                    onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && handleGenerate()}
                  />
                </div>
                <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-card">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRandomPrompt}
                    className="group relative overflow-hidden gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity"
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                    />
                    <Shuffle className="w-4 h-4 text-purple-500 group-hover:text-purple-400 transition-colors" />
                    <span className="text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent group-hover:from-purple-400 group-hover:to-pink-400 transition-all">Random</span>
                  </Button>
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="h-9 sm:h-10 px-5 sm:px-6 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#FF6B47] via-[#FF6B47] to-[#FF9A4D] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition-transform"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d4d4d8; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a1a1aa; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </div>
  );
};

export default ImageToolsPage;