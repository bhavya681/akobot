"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Image as ImageIcon,
  Video,
  LayoutGrid,
  Infinity as InfinityIcon,
  Maximize2,
  Square,
  PenTool,
  Mic,
  Plus,
  Sparkles,
  FileText,
  Code,
  Crown,
  Upload,
  Bot,
  ChevronDown,
  Wand2,
  User,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Loader2,
  ArrowRight,
  Globe,
  Volume2,
  VolumeX,
  Users,
  Contact,
  TrendingUp,
  Headphones,
  Settings,
  MessageSquare,
} from "lucide-react";
import { moduleAPI, providerAPI, SARVAM_VOICE_WS_URL, audioAPI, type VoiceItem } from "@/lib/api";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  responseTime?: string;
}

const contentTypes = [
  { id: "design", label: "Design", icon: Sparkles, isSelected: true },
  { id: "image", label: "Image", icon: ImageIcon, isSelected: false },
  { id: "doc", label: "Doc", icon: FileText, isSelected: false },
  { id: "code", label: "</> Code", icon: Code, isSelected: false },
  { id: "video", label: "Video clip", icon: Video, isSelected: false, isPremium: true },
  { id: "audio", label: "Audio", icon: Volume2, isSelected: false },
];

const availableAgents = [
  { id: "general", name: "General Assistant", icon: Bot },
  { id: "hr", name: "HR", icon: Users },
  { id: "crm", name: "CRM", icon: Contact },
  { id: "sales", name: "Sales", icon: TrendingUp },
  { id: "support", name: "Support", icon: Headphones },
  { id: "it", name: "IT", icon: Settings },
];

interface ModelInfo {
  name: string;
  model: string;
  modified_at?: string;
  size?: string;
  digest?: string;
  details?: any;
}

const AgentLLMPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedContentType, setSelectedContentType] = useState("design");
  const [selectedAgent, setSelectedAgent] = useState<string>("general");
  const [agentMood, setAgentMood] = useState("Professional");
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [loadingModels, setLoadingModels] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const voiceSocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const ttsChunksRef = useRef<string[]>([]);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [ttsVoices, setTtsVoices] = useState<VoiceItem[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>("Tara");
  const [playingTtsId, setPlayingTtsId] = useState<string | null>(null);
  const [ttsLoadingId, setTtsLoadingId] = useState<string | null>(null);
  const [voicesLoading, setVoicesLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /** Normalize voices from API: array, { voices }, or { "language": VoiceItem[] } */
  const normalizeVoices = useCallback((data: unknown): VoiceItem[] => {
    const isVoice = (v: unknown): v is VoiceItem =>
      !!v && typeof v === "object" && "voice_id" in (v as Record<string, unknown>);
    if (Array.isArray(data)) return data.filter(isVoice);
    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj.voices)) return obj.voices.filter(isVoice);
      const flat: VoiceItem[] = [];
      for (const val of Object.values(obj)) {
        if (Array.isArray(val)) flat.push(...val.filter(isVoice));
      }
      if (flat.length > 0) return flat;
    }
    return [];
  }, []);

  const agentMoods = [
    { id: "professional", label: "Professional" },
    { id: "friendly", label: "Friendly" },
    { id: "sales", label: "Sales" },
    { id: "creative", label: "Creative" },
  ];

  useEffect(() => {
    const query = searchParams?.get("q");
    if (query) {
      setInput(query);
      if (pathname) {
        router.replace(pathname);
      }
    }
  }, [searchParams, router, pathname]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Fetch available models on mount
  useEffect(() => {
    fetchModels();
  }, []);

  // Fetch TTS voices on mount
  useEffect(() => {
    const loadVoices = async () => {
      setVoicesLoading(true);
      try {
        const data = await audioAPI.getVoices();
        const list = normalizeVoices(data);
        setTtsVoices(list);
        if (list.length > 0) {
          const hasCurrent = list.some((v) => v.voice_id === selectedVoice);
          if (!hasCurrent) setSelectedVoice(list[0].voice_id);
        }
      } catch {
        setTtsVoices([{ voice_id: "Tara" }, { voice_id: "Leah" }, { voice_id: "Jess" }, { voice_id: "Mia" }, { voice_id: "Zoe" }, { voice_id: "Leo" }, { voice_id: "Dan" }, { voice_id: "Zac" }]);
      } finally {
        setVoicesLoading(false);
      }
    };
    loadVoices();
  }, [normalizeVoices]);

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      const data = await providerAPI.getModels();
      // Handle different response formats
      let models: ModelInfo[] = [];

      if (Array.isArray(data)) {
        // Check if array contains objects or strings
        if (data.length > 0 && typeof data[0] === 'object') {
          // Array of model objects
          models = data.map((item: any) => ({
            name: item.name || item.model || 'Unknown',
            model: item.model || item.name || '',
            modified_at: item.modified_at,
            size: item.size,
            digest: item.digest,
            details: item.details,
          }));
        } else {
          // Array of strings
          models = data.map((model: string) => ({
            name: model,
            model: model,
          }));
        }
      } else if (data && typeof data === 'object') {
        // If it's an object, try to extract models array
        const modelsArray = (data as any).models || (data as any).data || Object.values(data);
        if (Array.isArray(modelsArray)) {
          if (modelsArray.length > 0 && typeof modelsArray[0] === 'object') {
            models = modelsArray.map((item: any) => ({
              name: item.name || item.model || 'Unknown',
              model: item.model || item.name || '',
              modified_at: item.modified_at,
              size: item.size,
              digest: item.digest,
              details: item.details,
            }));
          } else {
            models = modelsArray.map((model: string) => ({
              name: model,
              model: model,
            }));
          }
        }
      }

      setAvailableModels(models);
      // Set default model if available
      if (models.length > 0 && !selectedModel) {
        setSelectedModel(models[0].model);
      }
    } catch (error: any) {
      console.error("Error fetching models:", error);
      toast.error(error.message || "Failed to load available models");
      // Set a default fallback model
      const fallbackModel: ModelInfo = {
        name: "gpt-oss:120b",
        model: "gpt-oss:120b",
      };
      setAvailableModels([fallbackModel]);
      setSelectedModel("gpt-oss:120b");
    } finally {
      setLoadingModels(false);
    }
  };

  const addFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    setAttachedFiles((prev) => {
      const next = [...prev];
      for (const file of incoming) {
        const alreadyAdded = next.some(
          (f) =>
            f.name === file.name &&
            f.size === file.size &&
            f.lastModified === file.lastModified
        );
        if (!alreadyAdded) next.push(file);
      }
      return next;
    });
    toast.success(`${incoming.length} file${incoming.length > 1 ? "s" : ""} added`);
  }, []);

  const handleFilePick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addFiles(e.target.files);
      e.target.value = "";
    },
    [addFiles]
  );

  const removeAttachedFile = useCallback((idx: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || isLoading) return;

    const filesNote =
      attachedFiles.length > 0
        ? `\n\nAttached files:\n${attachedFiles
            .map((f) => `- ${f.name} (${Math.max(1, Math.round(f.size / 1024))} KB)`)
            .join("\n")}`
        : "";
    const composedInput =
      input.trim() || (attachedFiles.length > 0 ? "Please review my uploaded files." : "");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: `${composedInput}${filesNote}`,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    const currentInput = composedInput;
    setInput("");
    setAttachedFiles([]);

    try {
      const startTime = Date.now();

      // Convert conversation history to a prompt string
      // Include previous messages for context
      let prompt = currentInput;
      if (messages.length > 0) {
        const conversationContext = messages
          .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
          .join("\n\n");
        prompt = `${conversationContext}\n\nUser: ${currentInput}\n\nAssistant:`;
      }

      // Try apimodule chat completions first; fallback to provider chatcompletion.
      const modelToUse = selectedModel || availableModels[0]?.model || "gpt-oss:120b";
      const modelString =
        typeof modelToUse === "string" ? modelToUse : (modelToUse as any)?.model || "gpt-oss:120b";

      const toReply = (response: unknown): string => {
        if (typeof response === "string") return response;
        if (!response || typeof response !== "object") return "I'm sorry, I couldn't generate a response.";
        const payload = response as {
          text?: string;
          content?: string;
          message?: string;
          choices?: Array<{ message?: { content?: string }; text?: string; content?: string }>;
          response?: string;
        };
        return (
          payload.choices?.[0]?.message?.content ||
          payload.choices?.[0]?.text ||
          payload.choices?.[0]?.content ||
          payload.text ||
          payload.content ||
          payload.message ||
          payload.response ||
          JSON.stringify(response)
        );
      };

      let reply = "";
      try {
        const response = await moduleAPI.chatCompletions({
          prompt,
          model: modelString,
          stream: false,
        });
        reply = toReply(response);
      } catch {
        const fallback = await providerAPI.chatCompletion({
          prompt,
          model: modelString,
        });
        reply = toReply(fallback);
      }

      const responseTime = ((Date.now() - startTime) / 1000).toFixed(1);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: reply.trim(),
        timestamp: new Date(),
        responseTime: `${responseTime}s`,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Auto-play TTS when Audio content type is selected
      if (selectedContentType === "audio" && reply.trim()) {
        const msgId = assistantMessage.id;
        setTtsLoadingId(msgId);
        setTimeout(async () => {
          try {
            const { language, emotion } = getVoiceConfig();
            const res = await audioAPI.textToSpeech({
              prompt: reply.trim(),
              voice_id: selectedVoice,
              language,
              speed: 1,
              emotion,
            });
            const url = (res as { url?: string })?.url;
            if (url) {
              const audio = new Audio(url);
              audioRef.current = audio;
              setPlayingTtsId(msgId);
              audio.onended = () => setPlayingTtsId(null);
              audio.onerror = () => setPlayingTtsId(null);
              await audio.play();
            }
          } catch {
            toast.error("Could not play audio response");
          } finally {
            setTtsLoadingId(null);
          }
        }, 300);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Error: ${error.message || "Failed to get response. Please check if the API server is running and VITE_APIMODULE_URL is configured. Make sure models are available via /v1/provider/list."}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error(error.message || "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const stopVoice = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    voiceSocketRef.current?.close();
    voiceSocketRef.current = null;
    setIsVoiceActive(false);
  }, []);

  const handleMicClick = useCallback(async () => {
    if (isVoiceActive) {
      stopVoice();
      return;
    }
    if (!SARVAM_VOICE_WS_URL) {
      toast.error("Voice is not configured. Set VITE_SARVAM_CHAT_URL for voice.");
      return;
    }

    try {
      const socket = new WebSocket(SARVAM_VOICE_WS_URL);
      voiceSocketRef.current = socket;

      socket.onopen = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = stream;
          const mediaRecorder = new MediaRecorder(stream);
          mediaRecorderRef.current = mediaRecorder;

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0 && socket.readyState === WebSocket.OPEN) {
              socket.send(e.data);
            }
          };
          mediaRecorder.start(250);
          setIsVoiceActive(true);
          toast.success("Voice on — speak now");
        } catch (err: any) {
          toast.error(err?.message || "Microphone access denied");
          socket.close();
        }
      };

      socket.onmessage = (event) => {
        try {
          if (typeof event.data !== "string") return;
          const data = JSON.parse(event.data);
          if (data.type === "stt") {
            setInput((prev) => (data.text ? data.text : prev));
          }
          if (data.type === "tts_start") {
            setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "assistant",
                content: data.text || "",
                timestamp: new Date(),
              },
            ]);
            ttsChunksRef.current = [];
          }
          if (data.type === "tts_chunk" && data.chunk) {
            ttsChunksRef.current.push(data.chunk);
          }
          if (data.type === "tts_end") {
            const chunks = ttsChunksRef.current;
            if (chunks.length > 0) {
              const base64 = chunks.join("");
              const audio = new Audio("data:audio/mp3;base64," + base64);
              audio.play().catch(() => { });
            }
            ttsChunksRef.current = [];
          }
          if (data.type === "error") {
            toast.error(data.message || "Voice error");
            stopVoice();
          }
        } catch (_) { }
      };

      socket.onerror = () => {
        toast.error("Voice connection error. Is the backend running on port 3000?");
        stopVoice();
      };
      socket.onclose = () => {
        stopVoice();
      };
    } catch (err: any) {
      toast.error(err?.message || "Failed to start voice");
      setIsVoiceActive(false);
    }
  }, [isVoiceActive, stopVoice]);

  useEffect(() => {
    return () => {
      stopVoice();
      audioRef.current?.pause();
    };
  }, [stopVoice]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getVoiceConfig = useCallback(() => {
    const v = ttsVoices.find((x) => x.voice_id === selectedVoice);
    return {
      language: v?.language ?? "american english",
      emotion: v?.emotion ?? ["Tara", "Leah", "Jess", "Mia", "Zoe", "Leo", "Dan", "Zac"].includes(selectedVoice),
    };
  }, [ttsVoices, selectedVoice]);

  const handlePlayTts = async (messageId: string, text: string) => {
    if (playingTtsId === messageId) {
      stopTts();
      return;
    }
    if (playingTtsId) {
      audioRef.current?.pause();
      setPlayingTtsId(null);
    }
    setTtsLoadingId(messageId);
    try {
      const { language, emotion } = getVoiceConfig();
      const res = await audioAPI.textToSpeech({
        prompt: text,
        voice_id: selectedVoice,
        language,
        speed: 1,
        emotion,
      });
      const url = (res as { url?: string })?.url;
      if (!url) throw new Error("No audio URL returned");
      const audio = new Audio(url);
      audioRef.current = audio;
      setPlayingTtsId(messageId);
      audio.onended = () => setPlayingTtsId(null);
      audio.onerror = () => {
        toast.error("Failed to play audio");
        setPlayingTtsId(null);
      };
      await audio.play();
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate speech");
    } finally {
      setTtsLoadingId(null);
    }
  };

  const stopTts = () => {
    audioRef.current?.pause();
    setPlayingTtsId(null);
  };

  const hasMessages = messages.length > 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied to clipboard"));
  };

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#fafafa] dark:bg-[#050508] transition-colors duration-300">
      {/* Subtle gradient + noise */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/95 via-[#fafafa] to-gray-100/95 dark:from-[#0a0a0f] dark:via-[#050508] dark:to-[#000000] transition-colors duration-300" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] max-w-2xl h-[400px] rounded-full bg-violet-100/40 dark:bg-violet-950/20 blur-[100px] transition-colors duration-300" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-20 flex flex-col h-full" style={{ minHeight: "100vh" }}>
        {/* Compact header - always visible for context */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 px-2 sm:px-3 py-3 border-b border-gray-200/60 dark:border-white/[0.06] bg-white/70 dark:bg-[#0a0a0f]/80 backdrop-blur-xl transition-colors duration-300"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2.5 rounded-lg py-1.5 pr-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/10 flex items-center justify-center shrink-0">
                <img src="/logo.webp" alt="AKOBOT" className="w-5 h-5 object-contain" />
              </div>
              <span className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">
                AKOBOT<span className="text-violet-600 dark:text-violet-400">.AI</span>
              </span>
            </button>
            <div className="flex items-center gap-2">
              {availableModels.length > 0 && (
                <div className="relative">
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    disabled={loadingModels}
                    className="appearance-none bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 text-xs font-medium pl-3 pr-7 py-2 rounded-lg border border-gray-200/80 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-violet-500/20 cursor-pointer hover:bg-gray-200/80 dark:hover:bg-white/10 transition-colors"
                  >
                    {availableModels.map((modelInfo, index) => (
                      <option key={`${modelInfo.model}-${index}`} className="bg-white dark:bg-gray-900" value={modelInfo.model}>
                        {modelInfo.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                </div>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors border border-gray-200/80 dark:border-white/10">
                    {(() => {
                      const agent = availableAgents.find((a) => a.id === selectedAgent);
                      const Icon = agent?.icon ?? Bot;
                      return <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />;
                    })()}
                    <span className="hidden sm:inline">{availableAgents.find((a) => a.id === selectedAgent)?.name || "Agent"}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {availableAgents.map((agent) => {
                    const Icon = agent.icon;
                    return (
                      <DropdownMenuItem key={agent.id} onClick={() => setSelectedAgent(agent.id)}>
                        <Icon className="w-4 h-4 mr-3 text-muted-foreground" />
                        {agent.name}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </motion.header>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilePick}
        />
        <input
          ref={imageInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleFilePick}
        />
        <input
          ref={videoInputRef}
          type="file"
          multiple
          accept="video/*"
          className="hidden"
          onChange={handleFilePick}
        />

        {/* Messages Area - flex-1 with min-h-0 so it scrolls correctly */}
        <div
          className={`flex-1 min-h-0 overflow-y-auto ${hasMessages ? "px-2 sm:px-3 py-6" : "flex flex-col items-center justify-center"}`}
          style={{ scrollBehavior: "smooth" }}
        >
          <div className={hasMessages ? "max-w-6xl mx-auto" : "w-full max-w-5xl mx-auto px-2 sm:px-3"}>
            {!hasMessages && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center w-full text-center"
              >
                <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white tracking-tight mb-3">
                  Let&apos;s Create
                </h1>
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                  Start a conversation with your AI assistant. Describe what you want to create, ask questions, or explore creative possibilities.
                </p>
                <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
                  {contentTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedContentType(type.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${selectedContentType === type.id
                        ? "bg-violet-600 dark:bg-violet-500 text-white shadow-md shadow-violet-900/20"
                        : "bg-white dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-gray-200/80 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/15 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                      <type.icon className="w-4 h-4 shrink-0" />
                      {type.label}
                      {type.isPremium && <Crown className="w-3 h-3 text-amber-400 ml-0.5" />}
                    </button>
                  ))}
                </div>
                <div className="relative w-full">
                  <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden transition-all duration-200 focus-within:border-violet-400/50 dark:focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                    <div className="flex items-end gap-2 pt-5 pl-4 pr-3 pb-2">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Describe what you want to create..."
                        rows={1}
                        className="flex-1 min-w-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none overflow-y-auto text-[15px] leading-relaxed py-2 min-h-[28px] max-h-[180px] transition-colors"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${input.trim() && !isLoading
                          ? "bg-violet-600 dark:bg-violet-500 text-white hover:bg-violet-700 dark:hover:bg-violet-600 shadow-md shadow-violet-900/20"
                          : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          }`}
                        aria-label="Send"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          title="Upload"
                        >
                          <Upload className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="p-2 rounded-full bg-violet-600 dark:bg-violet-500 text-white hover:bg-violet-700 dark:hover:bg-violet-600 transition-colors shadow-md"
                          title="Attach"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <div className="flex items-center rounded-lg border border-gray-200/80 dark:border-white/10 overflow-hidden">
                          <button
                            type="button"
                            onClick={() => imageInputRef.current?.click()}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            title="Image"
                          >
                            <ImageIcon className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => videoInputRef.current?.click()}
                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border-l border-gray-200/80 dark:border-white/10"
                            title="Video"
                          >
                            <Video className="w-4 h-4" />
                          </button>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                              {(() => {
                                const agent = availableAgents.find((a) => a.id === selectedAgent);
                                const Icon = agent?.icon ?? Bot;
                                return <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />;
                              })()}
                              <span className="hidden sm:inline max-w-[100px] truncate">{availableAgents.find((a) => a.id === selectedAgent)?.name || "Agent"}</span>
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-52">
                            {availableAgents.map((agent) => {
                              const Icon = agent.icon;
                              return (
                                <DropdownMenuItem key={agent.id} onClick={() => setSelectedAgent(agent.id)}>
                                  <Icon className="w-4 h-4 mr-3 text-muted-foreground" />
                                  {agent.name}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        {(selectedContentType === "audio" || messages.some((m) => m.role === "assistant")) && (
                          <div className="flex items-center">
                            <div className="relative">
                              <select
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                disabled={voicesLoading}
                                className="appearance-none bg-transparent text-gray-600 dark:text-gray-400 text-xs font-medium pl-2 pr-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none cursor-pointer disabled:opacity-60"
                              >
                                {ttsVoices.map((v) => {
                                  const id = v.voice_id;
                                  const label = [id, v.language, v.gender].filter(Boolean).join(" · ");
                                  return <option key={id} value={id}>{label || id}</option>;
                                })}
                              </select>
                              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={handleMicClick}
                          className={`p-2 rounded-lg transition-all duration-200 ${isVoiceActive
                            ? "bg-red-500/15 text-red-600 dark:text-red-400"
                            : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                            }`}
                          aria-label="Voice"
                          title={isVoiceActive ? "Stop voice" : "Voice input"}
                        >
                          <Mic className="w-4 h-4" />
                        </button>
                        <button type="button" className="p-2 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors" aria-label="Enhance" title="Enhance">
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {attachedFiles.length > 0 && (
                      <div className="px-3 pb-3 flex flex-wrap gap-2">
                        {attachedFiles.map((file, idx) => (
                          <button
                            key={`${file.name}-${file.lastModified}-${idx}`}
                            type="button"
                            onClick={() => removeAttachedFile(idx)}
                            className="inline-flex items-center gap-1.5 max-w-[260px] px-2.5 py-1.5 rounded-full text-xs border border-violet-200/80 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-200"
                            title="Click to remove"
                          >
                            <span className="truncate">{file.name}</span>
                            <Square className="w-3 h-3" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {hasMessages && (
              <div className="space-y-6 pb-36">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-3 sm:gap-4 group ${message.role === "user" ? "justify-end" : ""}`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 dark:from-violet-500/30 dark:to-violet-600/30 border border-violet-200/50 dark:border-violet-700/30 flex items-center justify-center">
                          <img src="/logo.webp" alt="AI" className="w-5 h-5 object-contain" />
                        </div>
                      </div>
                    )}
                    <div className={`flex flex-col max-w-[88%] sm:max-w-[82%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-2 mb-1.5 px-0.5">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-500">
                          {message.role === "assistant" ? "AKOBOT" : "You"}
                        </span>
                        <span className="text-[11px] text-gray-400 dark:text-gray-600">{formatTime(message.timestamp)}</span>
                        {message.role === "assistant" && message.responseTime && (
                          <span className="text-[10px] text-gray-400 dark:text-gray-600">· {message.responseTime}</span>
                        )}
                        {message.role === "assistant" && message.content && (
                          <>
                            <button
                              onClick={() => copyToClipboard(message.content)}
                              className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                              title="Copy"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => (playingTtsId === message.id ? stopTts() : ttsLoadingId === message.id ? undefined : handlePlayTts(message.id, message.content))}
                              disabled={ttsLoadingId === message.id}
                              className="p-1 rounded-md text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors disabled:opacity-50"
                              title={ttsLoadingId === message.id ? "Generating..." : playingTtsId === message.id ? "Stop" : "Listen"}
                            >
                              {ttsLoadingId === message.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : playingTtsId === message.id ? (
                                <VolumeX className="w-3.5 h-3.5" />
                              ) : (
                                <Volume2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </>
                        )}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm border transition-colors duration-200 ${
                          message.role === "user"
                            ? "bg-gray-900 dark:bg-gray-800 text-white border-gray-700/50 dark:border-white/10"
                            : "bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 border-gray-200/80 dark:border-white/10"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-[15px] leading-[1.6] font-normal">{message.content}</p>
                      </div>
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-1 mt-1.5 px-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100">
                          <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Good response">
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors" title="Bad response">
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="flex-shrink-0 mt-0.5">
                        <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 sm:gap-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 dark:from-violet-500/30 dark:to-violet-600/30 border border-violet-200/50 dark:border-violet-700/30 flex items-center justify-center shrink-0">
                      <img src="/logo.webp" alt="AI" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/10 shadow-sm">
                      <div className="flex gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-violet-500 dark:bg-violet-400 animate-bounce [animation-delay:0ms]" />
                        <span className="w-2 h-2 rounded-full bg-violet-500 dark:bg-violet-400 animate-bounce [animation-delay:150ms]" />
                        <span className="w-2 h-2 rounded-full bg-violet-500 dark:bg-violet-400 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        {/* Input Container - at bottom only when there are messages */}
        {hasMessages && (
        <div className="z-30 shrink-0 w-full">
          <div
            className="w-full border-t border-gray-200/80 dark:border-white/[0.06] bg-white/90 dark:bg-[#0a0a0f]/90 backdrop-blur-xl py-4 sm:py-5 transition-colors duration-300"
          >
            <div className="w-full mx-auto px-2 sm:px-3 max-w-6xl">
              <div className="relative">
                <div className="rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-white/5 shadow-lg shadow-gray-200/50 dark:shadow-none overflow-hidden transition-all duration-200 focus-within:border-violet-400/50 dark:focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/10">
                  <div className="flex items-end gap-2 pt-4 pl-4 pr-3 pb-2">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={hasMessages ? "Message AKOBOT..." : "Ask anything..."}
                      rows={1}
                      className="flex-1 min-w-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none resize-none overflow-y-auto text-[15px] leading-relaxed py-2 min-h-[24px] max-h-[180px] transition-colors"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 ${input.trim() && !isLoading
                        ? "bg-violet-600 dark:bg-violet-500 text-white hover:bg-violet-700 dark:hover:bg-violet-600 shadow-md shadow-violet-900/20"
                        : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                        }`}
                      aria-label="Send"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between px-3 pb-3 pt-1 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        title="Upload"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                        title="Attach"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <div className="flex items-center rounded-lg border border-gray-200/80 dark:border-white/10 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                          title="Image"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border-l border-gray-200/80 dark:border-white/10"
                          title="Video"
                        >
                          <Video className="w-4 h-4" />
                        </button>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-white/10">
                            {(() => {
                              const agent = availableAgents.find((a) => a.id === selectedAgent);
                              const Icon = agent?.icon ?? Bot;
                              return <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />;
                            })()}
                            <span className="hidden sm:inline max-w-[100px] truncate">{availableAgents.find((a) => a.id === selectedAgent)?.name || "Agent"}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-52">
                          {availableAgents.map((agent) => {
                            const Icon = agent.icon;
                            return (
                              <DropdownMenuItem key={agent.id} onClick={() => setSelectedAgent(agent.id)}>
                                <Icon className="w-4 h-4 mr-3 text-muted-foreground" />
                                {agent.name}
                              </DropdownMenuItem>
                            );
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {(selectedContentType === "audio" || messages.some((m) => m.role === "assistant")) && (
                        <div className="flex items-center">
                          <div className="relative">
                            <select
                              value={selectedVoice}
                              onChange={(e) => setSelectedVoice(e.target.value)}
                              disabled={voicesLoading}
                              className="appearance-none bg-transparent text-gray-600 dark:text-gray-400 text-xs font-medium pl-2 pr-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none cursor-pointer disabled:opacity-60"
                            >
                              {ttsVoices.map((v) => {
                                const id = v.voice_id;
                                const label = [id, v.language, v.gender].filter(Boolean).join(" · ");
                                return <option key={id} value={id}>{label || id}</option>;
                              })}
                            </select>
                            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleMicClick}
                        className={`p-2 rounded-lg transition-all duration-200 ${isVoiceActive
                          ? "bg-red-500/15 text-red-600 dark:text-red-400"
                          : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10"
                          }`}
                        aria-label="Voice"
                        title={isVoiceActive ? "Stop voice" : "Voice input"}
                      >
                        <Mic className="w-4 h-4" />
                      </button>
                      <button type="button" className="p-2 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors" aria-label="Enhance" title="Enhance">
                        <Sparkles className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {attachedFiles.length > 0 && (
                    <div className="px-3 pb-3 flex flex-wrap gap-2">
                      {attachedFiles.map((file, idx) => (
                        <button
                          key={`${file.name}-${file.lastModified}-${idx}`}
                          type="button"
                          onClick={() => removeAttachedFile(idx)}
                          className="inline-flex items-center gap-1.5 max-w-[260px] px-2.5 py-1.5 rounded-full text-xs border border-violet-200/80 dark:border-violet-500/30 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-200"
                          title="Click to remove"
                        >
                          <span className="truncate">{file.name}</span>
                          <Square className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AgentLLMPage;