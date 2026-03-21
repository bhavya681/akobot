"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  ArrowLeft,
  Loader2,
  User,
  Paperclip,
  Mic,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  X,
  FileText,
  ImageIcon,
  Copy,
  Check,
  Sparkles,
  BarChart3,
  ExternalLink,
  Phone,
  Download,
  Smile,
  Play,
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { customAgentAPI, type CustomAgent } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  attachments?: { name: string; type: "file" | "image"; url?: string }[];
  feedback?: "up" | "down" | null;
}

const SESSION_KEY = "agent-chat-session";
const ACCEPT_FILES = ".pdf,.docx,.txt,.md,.csv,.xlsx,.tsv";
const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp";

function getOrCreateSessionId(agentId: string): string {
  if (typeof window === "undefined") return `session-${Date.now()}`;
  const key = `${SESSION_KEY}-${agentId}`;
  let session = sessionStorage.getItem(key);
  if (!session) {
    session = `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(key, session);
  }
  return session;
}

function TypingDots() {
  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full bg-muted-foreground/60"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function extractAsyncJobId(payload: Record<string, unknown>): string | null {
  const v =
    payload.jobId ??
    payload.job_id ??
    payload.analyticsJobId ??
    payload.analytics_job_id ??
    null;
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

function AnimatedChatBackground() {
  return (
    <>
      {/* Layered gradient base (light/dark adaptive) */}
      <div className="absolute inset-0 akko-bg-base" />

      {/* Moving mesh lights */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div className="akko-mesh akko-mesh--a" />
        <div className="akko-mesh akko-mesh--b" />
        <div className="akko-mesh akko-mesh--c" />
        <div className="akko-aurora akko-aurora--a" />
        <div className="akko-aurora akko-aurora--b" />
        <div className="akko-aurora akko-aurora--c" />
      </div>

      {/* Center spotlight */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
        <div className="akko-spot" />
      </div>

      {/* Edge vignette + subtle grain */}
      <div className="absolute inset-0 pointer-events-none akko-vignette" aria-hidden />
      <div
        className="absolute inset-0 pointer-events-none akko-dots opacity-[0.45] dark:opacity-[0.3]"
        aria-hidden
      />

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .akko-mesh,
          .akko-aurora,
          .akko-dots {
            animation: none !important;
            transform: none !important;
          }
        }

        .akko-bg-base {
          background:
            radial-gradient(circle at 15% 15%, rgba(129, 140, 248, 0.28), transparent 45%),
            radial-gradient(circle at 85% 20%, rgba(14, 165, 233, 0.2), transparent 42%),
            radial-gradient(circle at 75% 80%, rgba(236, 72, 153, 0.16), transparent 45%),
            linear-gradient(170deg, #eef2ff 0%, #e8ecff 42%, #dbeafe 100%);
        }
        :is(.dark *) .akko-bg-base {
          background:
            radial-gradient(circle at 18% 16%, rgba(129, 140, 248, 0.18), transparent 42%),
            radial-gradient(circle at 80% 12%, rgba(56, 189, 248, 0.14), transparent 40%),
            radial-gradient(circle at 70% 84%, rgba(217, 70, 239, 0.12), transparent 46%),
            linear-gradient(170deg, #0f1226 0%, #121632 48%, #101726 100%);
        }

        .akko-mesh {
          position: absolute;
          width: 54vmax;
          height: 54vmax;
          border-radius: 9999px;
          opacity: 0.32;
          filter: blur(58px);
          will-change: transform;
          mix-blend-mode: soft-light;
        }
        :is(.dark *) .akko-mesh {
          opacity: 0.22;
          mix-blend-mode: screen;
        }
        .akko-mesh--a {
          left: -20vmax;
          top: -16vmax;
          background: radial-gradient(closest-side, rgba(45, 212, 191, 0.7), transparent 70%);
          animation: akkoMeshA 20s ease-in-out infinite;
        }
        .akko-mesh--b {
          right: -18vmax;
          top: 4vmax;
          background: radial-gradient(closest-side, rgba(96, 165, 250, 0.72), transparent 72%);
          animation: akkoMeshB 24s ease-in-out infinite;
        }
        .akko-mesh--c {
          left: 18vmax;
          bottom: -24vmax;
          background: radial-gradient(closest-side, rgba(244, 114, 182, 0.62), transparent 72%);
          animation: akkoMeshC 28s ease-in-out infinite;
        }

        .akko-spot {
          width: min(640px, 86vw);
          height: min(640px, 86vw);
          border-radius: 9999px;
          background:
            radial-gradient(circle at 30% 8%, rgba(236, 72, 153, 0.16), transparent 56%),
            radial-gradient(circle at 70% 90%, rgba(56, 189, 248, 0.22), transparent 54%),
            radial-gradient(circle at 50% 40%, rgba(99, 102, 241, 0.4), transparent 70%);
          filter: blur(26px);
          opacity: 0.86;
          mix-blend-mode: soft-light;
          animation: akkoSpotPulse 18s ease-in-out infinite alternate;
          transform-origin: center;
        }
        :is(.dark *) .akko-spot {
          opacity: 0.6;
          filter: blur(32px);
          mix-blend-mode: screen;
        }

        .akko-aurora {
          position: absolute;
          width: 64vmax;
          height: 64vmax;
          border-radius: 9999px;
          filter: blur(46px);
          opacity: 0.48;
          mix-blend-mode: multiply;
          will-change: transform;
        }
        :is(.dark *) .akko-aurora {
          opacity: 0.34;
          mix-blend-mode: screen;
        }

        .akko-aurora--a {
          left: -18vmax;
          top: -16vmax;
          background: radial-gradient(
            closest-side,
            rgba(99, 102, 241, 0.55),
            rgba(168, 85, 247, 0.18),
            transparent 70%
          );
          animation: akkoAuroraA 12s ease-in-out infinite;
        }
        .akko-aurora--b {
          right: -20vmax;
          top: 10vmax;
          background: radial-gradient(
            closest-side,
            rgba(236, 72, 153, 0.35),
            rgba(99, 102, 241, 0.14),
            transparent 72%
          );
          animation: akkoAuroraB 16s ease-in-out infinite;
        }
        .akko-aurora--c {
          left: 8vmax;
          bottom: -24vmax;
          background: radial-gradient(
            closest-side,
            rgba(34, 211, 238, 0.22),
            rgba(168, 85, 247, 0.14),
            transparent 70%
          );
          animation: akkoAuroraC 20s ease-in-out infinite;
        }

        .akko-vignette {
          background:
            radial-gradient(circle at 50% 40%, transparent 42%, rgba(15, 23, 42, 0.08) 100%);
        }
        :is(.dark *) .akko-vignette {
          background:
            radial-gradient(circle at 50% 40%, transparent 34%, rgba(2, 6, 23, 0.4) 100%);
        }

        @keyframes akkoMeshA {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(12vmax, 4vmax, 0) scale(1.06); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes akkoMeshB {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-10vmax, 9vmax, 0) scale(1.08); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes akkoMeshC {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-6vmax, -12vmax, 0) scale(1.07); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }

        @keyframes akkoSpotPulse {
          0% {
            transform: translate3d(0, 8px, 0) scale(0.96);
            opacity: 0.7;
          }
          35% {
            transform: translate3d(0, -4px, 0) scale(1.02);
            opacity: 0.9;
          }
          70% {
            transform: translate3d(0, 4px, 0) scale(1.04);
            opacity: 0.85;
          }
          100% {
            transform: translate3d(0, 0, 0) scale(1);
            opacity: 0.8;
          }
        }

        @keyframes akkoAuroraA {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
          50% {
            transform: translate3d(12vmax, 5vmax, 0) rotate(22deg) scale(1.08);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
        }
        @keyframes akkoAuroraB {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
          50% {
            transform: translate3d(-13vmax, -7vmax, 0) rotate(-18deg)
              scale(1.07);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
        }
        @keyframes akkoAuroraC {
          0% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
          50% {
            transform: translate3d(7vmax, -11vmax, 0) rotate(16deg)
              scale(1.09);
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
          }
        }

        .akko-dots {
          background-image:
            radial-gradient(rgba(255, 255, 255, 0.72) 1px, transparent 1px),
            radial-gradient(rgba(30, 41, 59, 0.05) 1px, transparent 1px);
          background-size: 20px 20px, 36px 36px;
          background-position: 0 0, 10px 18px;
          animation: akkoDotsDrift 34s linear infinite;
        }
        :is(.dark *) .akko-dots {
          background-image:
            radial-gradient(rgba(148, 163, 184, 0.24) 1px, transparent 1px),
            radial-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px);
        }

        @keyframes akkoDotsDrift {
          0% {
            background-position: 0 0, 10px 18px;
          }
          100% {
            background-position: 140px 80px, -110px 130px;
          }
        }
      `}</style>
    </>
  );
}

export default function AgentChatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const agentId = (params?.agentId ?? "") as string;
  const isWidget = searchParams?.get("widget") === "1" || (typeof window !== "undefined" && !!window.opener);
  const [agent, setAgent] = useState<CustomAgent | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [metricsOpen, setMetricsOpen] = useState(false);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [streamingMsgId, setStreamingMsgId] = useState<string | null>(null);
  const [sessionErrorBanner, setSessionErrorBanner] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playingAudioRef = useRef<HTMLAudioElement | null>(null);
  const analyticsPollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (analyticsPollTimerRef.current) {
        clearTimeout(analyticsPollTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!agentId) return;
    sessionIdRef.current = getOrCreateSessionId(agentId);
    customAgentAPI
      .get(agentId)
      .then((a) => {
        setAgent(a);
        if (a.welcomeMessage) {
          setMessages([
            {
              id: `welcome-${Date.now()}`,
              role: "assistant",
              content: a.welcomeMessage,
              timestamp: new Date(),
            },
          ]);
        }
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "Agent not found.";
        toast.error("Failed to load agent", { description: msg });
        const isSessionErr = msg.toLowerCase().includes("session") || msg.toLowerCase().includes("sign in");
        if (isSessionErr && (searchParams?.get("widget") === "1" || (typeof window !== "undefined" && !!window.opener))) {
          setSessionErrorBanner(true);
        } else if (isSessionErr) {
          router.push("/auth/sign-in");
        } else {
          router.push("/dashboard/agent-store");
        }
      })
      .finally(() => setLoading(false));
  }, [agentId, router, searchParams]);

  useEffect(() => {
    if (!agentId || bootstrapped || loading || !agent) return;
    customAgentAPI
      .bootstrap(agentId)
      .then(() => setBootstrapped(true))
      .catch(() => {});
  }, [agentId, bootstrapped, loading, agent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if ((!text && attachedFiles.length === 0 && attachedImages.length === 0) || sending || !agentId) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text || "(attachments only)",
      timestamp: new Date(),
      attachments: [
        ...attachedFiles.map((f) => ({ name: f.name, type: "file" as const })),
        ...attachedImages.map((f) => ({
          name: f.name,
          type: "image" as const,
          url: URL.createObjectURL(f),
        })),
      ],
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    const filesToSend = [...attachedFiles];
    const imagesToSend = [...attachedImages];
    setAttachedFiles([]);
    setAttachedImages([]);
    setSending(true);

    const assistantPlaceholder: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantPlaceholder]);
    setStreamingMsgId(assistantPlaceholder.id);

    try {
      let fullContent = "";
      let analyticsJobId: string | null = null;
      await customAgentAPI.chatStream(agentId, {
        query: text || "Please analyze the attached files/images.",
        session_id: sessionIdRef.current,
        files: filesToSend.length > 0 ? filesToSend : undefined,
        images: imagesToSend.length > 0 ? imagesToSend : undefined,
        widgetMode: isWidget,
        onChunk: (chunk) => {
          fullContent += chunk;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholder.id ? { ...m, content: fullContent } : m
            )
          );
        },
        onJson: (payload) => {
          const jobId = extractAsyncJobId(payload);
          if (jobId) analyticsJobId = jobId;
        },
        onDone: () => {
          setStreamingMsgId(null);
        },
        onError: (e) => {
          setStreamingMsgId(null);
          toast.error("Stream error", { description: e.message });
        },
      });

      if (analyticsJobId) {
        let attempts = 0;
        let completed = false;
        while (!completed && attempts < 60) {
          attempts += 1;
          const progress = await customAgentAPI.getAnalyticsProgress(agentId, analyticsJobId);
          const statusText = String(progress.status ?? "processing").toLowerCase();
          const resultText =
            (progress.response as string | undefined) ??
            (progress.answer as string | undefined) ??
            (progress.result as string | undefined) ??
            (progress.output as string | undefined) ??
            (progress.text as string | undefined) ??
            (progress.message as string | undefined) ??
            "";
          const pct = typeof progress.progress === "number" ? Math.max(0, Math.min(100, Math.round(progress.progress))) : undefined;

          if (/(failed|error|cancelled)/i.test(statusText)) {
            throw new Error(resultText || "Analytics job failed");
          }

          if (/(completed|complete|done|success|succeeded|finished)/i.test(statusText)) {
            completed = true;
            const finalText = resultText || "Analytics job completed.";
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantPlaceholder.id ? { ...m, content: finalText } : m
              )
            );
            break;
          }

          const waitingText = `Running analytics${pct !== undefined ? ` (${pct}%)` : ""}...`;
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantPlaceholder.id ? { ...m, content: waitingText } : m
            )
          );

          await new Promise<void>((resolve) => {
            analyticsPollTimerRef.current = setTimeout(() => resolve(), 2000);
          });
        }

        if (!completed) {
          throw new Error("Analytics job timed out");
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send message";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantPlaceholder.id ? { ...m, content: `Error: ${msg}` } : m
        )
      );
      setStreamingMsgId(null);
      toast.error("Chat failed", { description: msg });
      setSending(false);
      const isSessionErr = msg.toLowerCase().includes("session") || msg.toLowerCase().includes("sign in");
      if (isSessionErr && isWidget) {
        setSessionErrorBanner(true);
      } else if (isSessionErr) {
        router.push("/auth/sign-in");
      }
    } finally {
      setSending(false);
      setStreamingMsgId(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const list = Array.from(files);
    const docs = list.filter((f) => !f.type.startsWith("image/"));
    const imgs = list.filter((f) => f.type.startsWith("image/"));
    setAttachedFiles((prev) => [...prev, ...docs]);
    setAttachedImages((prev) => [...prev, ...imgs]);
    e.target.value = "";
  };

  const removeAttachment = (idx: number, isImage: boolean) => {
    if (isImage) setAttachedImages((p) => p.filter((_, i) => i !== idx));
    else setAttachedFiles((p) => p.filter((_, i) => i !== idx));
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (audioChunksRef.current.length === 0) return;
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], "voice.webm", { type: "audio/webm" });
        try {
          const res = await customAgentAPI.transcribe(agentId, file);
          const text = res?.text ?? res?.transcription ?? "";
          if (text) setInput((prev) => (prev ? `${prev} ${text}` : text));
          else toast.info("No speech detected", { description: "Try speaking clearly or use a supported format (WAV, MP3, M4A)." });
        } catch {
          toast.error("Transcription failed", { description: "Use WAV, MP3, or M4A for best results." });
        }
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      toast.error("Microphone access denied");
    }
  };

  const handleSpeak = async (msg: ChatMessage) => {
    if (!msg.content) return;
    if (speakingMsgId === msg.id) {
      playingAudioRef.current?.pause();
      playingAudioRef.current = null;
      setSpeakingMsgId(null);
      return;
    }
    setSpeakingMsgId(msg.id);
    try {
      const res = await customAgentAPI.tts(agentId, { text: msg.content });
      const url = res?.url ?? res?.audio_url;
      if (!url || typeof url !== "string") throw new Error("No audio URL in response");
      const audio = new Audio(url);
      playingAudioRef.current = audio;
      audio.onended = () => {
        playingAudioRef.current = null;
        setSpeakingMsgId(null);
      };
      audio.onerror = () => {
        playingAudioRef.current = null;
        setSpeakingMsgId(null);
        toast.error("Playback failed");
      };
      await audio.play();
    } catch {
      setSpeakingMsgId(null);
      toast.error("Text-to-speech failed");
    }
  };

  const handleFeedback = async (msg: ChatMessage, rating: "up" | "down") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, feedback: rating } : m))
    );
    try {
      await customAgentAPI.feedback(agentId, {
        session_id: sessionIdRef.current,
        rating,
        metadata: { message_id: msg.id },
      });
      toast.success("Thanks for your feedback!");
    } catch {
      toast.error("Could not submit feedback");
    }
  };

  const handleCopy = async (msg: ChatMessage) => {
    if (!msg.content) return;
    await navigator.clipboard.writeText(msg.content);
    setCopiedId(msg.id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fetchMetrics = async () => {
    setMetricsLoading(true);
    try {
      const m = await customAgentAPI.metrics(agentId);
      setMetrics(m);
    } catch {
      toast.error("Failed to load metrics");
    } finally {
      setMetricsLoading(false);
    }
  };

  if (loading) {
    if (isWidget) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-primary/5 to-slate-100 dark:from-background dark:via-primary/5 dark:to-background" />
          <div className="relative w-full max-w-[500px] rounded-3xl bg-card/95 dark:bg-card/90 border border-border/80 shadow-2xl overflow-hidden p-12 flex flex-col items-center justify-center min-h-[360px]">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground font-medium">Loading chatbot...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background via-background to-muted/20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 border border-primary/20 flex items-center justify-center shadow-lg"
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </motion.div>
        <p className="mt-6 text-sm text-muted-foreground font-medium">Loading agent...</p>
      </div>
    );
  }

  const isWelcomeOnly = messages.length === 1 && messages[0]?.role === "assistant";

  const sessionBanner = (
    <div className="flex items-center justify-between gap-3 px-4 py-3 bg-amber-500/10 dark:bg-amber-500/20 border-b border-amber-500/30 text-amber-800 dark:text-amber-200 text-sm">
      <span>Session isn’t valid in this window. Sign in below or open chat from the dashboard.</span>
      <div className="flex items-center gap-2 shrink-0">
        <Button size="sm" variant="outline" className="border-amber-500/50" onClick={() => router.push("/auth/sign-in")}>
          Sign in
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setSessionErrorBanner(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  if (isWidget) {
    const agentName = agent?.name ?? "Chatbot";
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#E8ECFF] dark:bg-[#1a1a2e]">
        <AnimatedChatBackground />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="relative w-full max-w-[500px] flex flex-col rounded-3xl overflow-hidden bg-[#E8ECFF] dark:bg-[#0f0f23] shadow-2xl border border-violet-200/50 dark:border-white/10"
          style={{ maxHeight: "88vh", minHeight: "580px" }}
        >
          {sessionErrorBanner && sessionBanner}
          {/* Header - solid white, reference style */}
          <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#0f0f23] border-b border-violet-100 dark:border-white/10 rounded-t-3xl">
            <button
              type="button"
              onClick={() => router.push("/dashboard/agent-store")}
              className="flex items-center gap-2.5 rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-400 via-fuchsia-400 to-violet-500 shadow-md">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </button>
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
              <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate w-full">{agentName}</h1>
              <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                Always Available
              </p>
            </div>
            <div className="flex items-center gap-0.5">
              <button type="button" className="p-2.5 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" aria-label="Call"><Phone className="w-5 h-5" /></button>
              <button
                type="button"
                onClick={() => setMessages(agent?.welcomeMessage ? [{ id: `welcome-${Date.now()}`, role: "assistant", content: agent.welcomeMessage, timestamp: new Date() }] : [])}
                className="p-2.5 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                aria-label="New chat"
              >
                <PenTool className="w-5 h-5" />
              </button>
              <button type="button" className="p-2.5 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" aria-label="Download"><Download className="w-5 h-5" /></button>
            </div>
          </header>

          {/* Messages - lavender area, bubbles with timestamp */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0 pb-28">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "")}
                >
                  {msg.role === "assistant" && (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-gradient-to-br from-violet-400 via-fuchsia-400 to-violet-500 shadow-md">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm transition-colors",
                        msg.role === "user"
                          ? "bg-gray-800 dark:bg-gray-700 text-white"
                          : "bg-[#E0E7FF]/90 dark:bg-violet-500/20 text-gray-800 dark:text-gray-100 border border-violet-200/50 dark:border-violet-400/20 backdrop-blur-sm"
                      )}
                    >
                      {msg.content ? (
                        <>
                          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">
                            {msg.content}
                            {streamingMsgId === msg.id && <span className="inline-block w-2 h-4 ml-0.5 bg-violet-500 animate-pulse align-middle rounded-sm" />}
                          </p>
                          {msg.role === "assistant" && msg.content && (
                            <div className="flex items-center gap-0.5 mt-2.5 pt-2 border-t border-violet-200/30 dark:border-white/10">
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleCopy(msg)} title="Copy">
                                {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleSpeak(msg)} title={speakingMsgId === msg.id ? "Stop" : "Listen"}>
                                {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                              </Button>
                              <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-lg", msg.feedback === "up" && "text-emerald-500")} onClick={() => handleFeedback(msg, "up")} title="Good response">
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-lg", msg.feedback === "down" && "text-red-500")} onClick={() => handleFeedback(msg, "down")} title="Poor response">
                                <ThumbsDown className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center gap-2 py-0.5">
                          <TypingDots />
                          <span className="text-xs text-muted-foreground">Thinking...</span>
                        </div>
                      )}
                    </div>
                    <span className={cn("text-[11px] text-gray-500 dark:text-gray-400 mt-1", msg.role === "user" && "text-right")}>
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-gray-300 dark:bg-gray-600">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Floating pill input - glassmorphism */}
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-6">
            <div className="rounded-full bg-white/80 dark:bg-[#0f0f23]/90 border border-white/60 dark:border-white/10 shadow-xl backdrop-blur-xl flex items-center gap-2 pl-4 pr-2 py-2 min-h-[52px] focus-within:ring-2 focus-within:ring-violet-400/30">
              <input type="file" ref={fileInputRef} multiple accept={`${ACCEPT_FILES},${ACCEPT_IMAGES}`} onChange={handleFileSelect} className="hidden" />
              <button type="button" className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors" aria-label="Attach" onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="w-5 h-5" />
              </button>
              <button type="button" className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-white/10 transition-colors" aria-label="Emoji">
                <Smile className="w-5 h-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Ask ${agentName} about...`}
                className="flex-1 min-w-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none text-[15px] py-2"
                disabled={sending}
              />
              <button
                type="button"
                onClick={handleVoiceInput}
                className={cn("p-2.5 rounded-full transition-colors", isRecording ? "bg-red-500/20 text-red-600 dark:text-red-400" : "text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20")}
                aria-label="Voice"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={(!input.trim() && attachedFiles.length === 0 && attachedImages.length === 0) || sending}
                className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-violet-600 dark:bg-violet-500 text-white hover:bg-violet-700 dark:hover:bg-violet-600 shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Send"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const agentNameFull = agent?.name ?? "Agent";
  return (
    <div className="min-h-screen flex flex-col bg-[#E8ECFF] dark:bg-[#1a1a2e]">
      <AnimatedChatBackground />

      <div className="relative z-10 flex flex-col max-w-lg mx-auto w-full shadow-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden bg-[#E8ECFF] dark:bg-[#0f0f23] min-h-full sm:min-h-[90vh] sm:my-[5vh] border border-violet-200/50 dark:border-white/10">
        {/* Header - same as widget */}
        <header className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#0f0f23] border-b border-violet-100 dark:border-white/10 rounded-t-3xl">
          <button type="button" onClick={() => router.push("/dashboard/agent-store")} className="flex items-center gap-2.5 rounded-full p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors" aria-label="Back">
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-violet-400 via-fuchsia-400 to-violet-500 shadow-md">
              <Bot className="w-5 h-5 text-white" />
            </div>
          </button>
          <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center">
            <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white truncate w-full">{agentNameFull}</h1>
            <p className="flex items-center justify-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              Always Available
            </p>
          </div>
          <div className="flex items-center gap-0.5">
            <Popover open={metricsOpen} onOpenChange={(o) => { setMetricsOpen(o); if (o && !metrics) fetchMetrics(); }}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" title="View metrics">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Agent Metrics</h4>
                  {metricsLoading ? (
                    <div className="flex items-center gap-2 py-4">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  ) : metrics ? (
                    <pre className="text-xs bg-muted/50 rounded-lg p-3 overflow-auto max-h-48 font-mono">{JSON.stringify(metrics, null, 2)}</pre>
                  ) : (
                    <p className="text-sm text-muted-foreground">No metrics available.</p>
                  )}
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" onClick={() => setMessages(agent?.welcomeMessage ? [{ id: `welcome-${Date.now()}`, role: "assistant", content: agent.welcomeMessage, timestamp: new Date() }] : [])} title="New chat">
              <PenTool className="w-5 h-5" />
            </Button>
          </div>
        </header>

      {/* Messages - same bubble style as widget */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 min-h-0 pb-28">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn("flex gap-3", msg.role === "user" ? "justify-end" : "")}
              >
                {msg.role === "assistant" && (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-gradient-to-br from-violet-400 via-fuchsia-400 to-violet-500 shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 shadow-sm",
                      msg.role === "user"
                        ? "bg-gray-800 dark:bg-gray-700 text-white"
                        : "bg-[#E0E7FF]/90 dark:bg-violet-500/20 text-gray-800 dark:text-gray-100 border border-violet-200/50 dark:border-violet-400/20 backdrop-blur-sm"
                    )}
                  >
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {msg.attachments.map((a, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {a.type === "image" && a.url && (
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted/50 border border-border/50">
                                <img src={a.url} alt={a.name} className="w-full h-full object-cover" />
                              </div>
                            )}
                            <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs", msg.role === "user" ? "bg-white/20" : "bg-white/60 dark:bg-white/10")}>
                              {a.type === "image" && !a.url && <ImageIcon className="w-3 h-3" />}
                              {a.type === "file" && <FileText className="w-3 h-3" />}
                              {a.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {msg.content ? (
                      <>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">
                          {msg.content}
                          {streamingMsgId === msg.id && <span className="inline-block w-2 h-4 ml-0.5 bg-violet-500 animate-pulse align-middle rounded-sm" />}
                        </p>
                        {msg.role === "assistant" && msg.content && (
                          <div className="flex items-center gap-0.5 mt-2.5 pt-2 border-t border-violet-200/30 dark:border-white/10">
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleCopy(msg)} title="Copy">
                              {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={() => handleSpeak(msg)} title="Listen">
                              {speakingMsgId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            </Button>
                            <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-lg", msg.feedback === "up" && "text-emerald-500")} onClick={() => handleFeedback(msg, "up")} title="Good response">
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-lg", msg.feedback === "down" && "text-red-500")} onClick={() => handleFeedback(msg, "down")} title="Poor response">
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center gap-2 py-0.5">
                        <TypingDots />
                        <span className="text-xs text-muted-foreground">Thinking...</span>
                      </div>
                    )}
                  </div>
                  <span className={cn("text-[11px] text-gray-500 dark:text-gray-400 mt-1", msg.role === "user" && "text-right")}>{formatTime(msg.timestamp)}</span>
                </div>
                {msg.role === "user" && (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-gray-300 dark:bg-gray-600">
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        {(attachedFiles.length > 0 || attachedImages.length > 0) && (
          <div className="absolute bottom-20 left-4 right-4 flex flex-wrap gap-2 z-20">
            {attachedFiles.map((f, i) => (
              <span key={`f-${i}`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-white/10 text-xs border border-violet-200/50">
                <FileText className="w-3.5 h-3.5" />
                {f.name}
                <button onClick={() => removeAttachment(i, false)} className="ml-0.5 rounded p-0.5 hover:bg-destructive/20"><X className="w-3 h-3" /></button>
              </span>
            ))}
            {attachedImages.map((f, i) => (
              <span key={`i-${i}`} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/90 dark:bg-white/10 text-xs border border-violet-200/50">
                <ImageIcon className="w-3.5 h-3.5" />
                {f.name}
                <button onClick={() => removeAttachment(i, true)} className="ml-0.5 rounded p-0.5 hover:bg-destructive/20"><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
        )}

        {/* Floating pill input */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 pb-6">
          <div className="rounded-full bg-white/80 dark:bg-[#0f0f23]/90 border border-white/60 dark:border-white/10 shadow-xl backdrop-blur-xl flex items-center gap-2 pl-4 pr-2 py-2 min-h-[52px] focus-within:ring-2 focus-within:ring-violet-400/30">
            <input type="file" ref={fileInputRef} multiple accept={`${ACCEPT_FILES},${ACCEPT_IMAGES}`} onChange={handleFileSelect} className="hidden" />
            <button type="button" className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/80" aria-label="Attach" onClick={() => fileInputRef.current?.click()}>
              <Paperclip className="w-5 h-5" />
            </button>
            <button type="button" className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/80" aria-label="Emoji"><Smile className="w-5 h-5" /></button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={`Ask ${agentNameFull} about...`}
              className="flex-1 min-w-0 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none text-[15px] py-2"
              disabled={sending}
            />
            <button
              type="button"
              onClick={handleVoiceInput}
              className={cn("p-2.5 rounded-full transition-colors", isRecording ? "bg-red-500/20 text-red-600 dark:text-red-400" : "text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-500/20")}
              aria-label="Voice"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleSend}
              disabled={(!input.trim() && attachedFiles.length === 0 && attachedImages.length === 0) || sending}
              className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full bg-violet-600 dark:bg-violet-500 text-white hover:bg-violet-700 dark:hover:bg-violet-600 shadow-lg shadow-violet-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              aria-label="Send"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 ml-0.5 fill-white" />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">Supports PDF, DOCX, TXT, images. Use voice for transcription.</p>
        </div>
      </div>
    </div>
  );
}
