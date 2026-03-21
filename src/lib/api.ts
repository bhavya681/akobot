import { apiClient, clearAuthTokens, setLastLoginTime } from "./axiosClient";

// Server-side proxy: client calls /api/* (same-origin), Next.js rewrites to api.akobot.in
const API_AUTH = "/api/auth";
const API_ADMIN = "/api/admin";
const API_MAIN = "/api/main";
const API_PACKAGES = "/api/packages";
const API_PAYMENT = "/api/payment";
const API_APIMODULE = "/api/apimodule";
const API_PROVIDER = "/api/provider";

/** True when main backend points to Liquidata. */
export const isPaymentBackendMisconfigured = (): boolean => false;

// Get auth token from localStorage (client-only)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// Get admin auth token from localStorage (client-only)
const getAdminAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminAccessToken');
};

// Get refresh token from localStorage (client-only)
const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('refreshToken');
};

/** Centralised helper: clear tokens, notify React, and send user to sign-in page. */
const forceLogoutAndRedirect = (): void => {
  clearAuthTokens();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("auth-storage-change"));
    // Use hard redirect so all state is reset
    window.location.href = "/auth/sign-in";
  }
};

/** Convert axios response/error to fetch-like Response for compatibility */
function toResponse(data: unknown, status: number, statusText: string): Response {
  return new Response(typeof data === "string" ? data : JSON.stringify(data ?? {}), {
    status,
    statusText,
    headers: { "Content-Type": "application/json" },
  });
}

/** API request - uses axios client with refresh interceptor (single-flight, 5min cooldown, no retry loop) */
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  _retryOn401 = true
): Promise<Response> => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = path.startsWith("/auth") ? `${API_AUTH}${path.slice(5)}` : `${API_MAIN}${path}`;
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : undefined;
  let data: unknown = undefined;
  if (body?.trim()) {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }
  try {
    const res = await apiClient.request({
      url,
      method: method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
      data,
    });
    return toResponse(res.data, res.status, res.statusText);
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status: number; statusText: string; data: unknown } };
    if (axiosErr?.response) {
      return toResponse(axiosErr.response.data, axiosErr.response.status, axiosErr.response.statusText);
    }
    throw err;
  }
};

/** Main API request - same as apiRequest for auth endpoints, uses /api/main for others */
const mainApiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_MAIN}${path}`;
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : undefined;
  let data: unknown = undefined;
  if (body?.trim()) {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }
  try {
    const res = await apiClient.request({
      url,
      method: method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
      data,
    });
    return toResponse(res.data, res.status, res.statusText);
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status: number; statusText: string; data: unknown } };
    if (axiosErr?.response) {
      return toResponse(axiosErr.response.data, axiosErr.response.status, axiosErr.response.statusText);
    }
    throw err;
  }
};

// Admin API request helper (uses admin token, falls back to regular token)
const adminApiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Try admin token first, then fall back to regular access token
  let token = getAdminAuthToken();
  const tokenType = token ? 'admin' : 'user';
  if (!token) {
    token = getAuthToken();
  }
  
  if (!token) {
    console.error('No admin or user token found for admin API request');
    throw new Error('Authentication required. Please log in as admin.');
  }
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': '*/*',
    ...options.headers,
  };
  (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  let adminPath = path;
  if (path.startsWith("/api/admin")) adminPath = path.slice(10);
  else if (path.startsWith("/admin")) adminPath = path.slice(6);
  const url = `${API_ADMIN}${adminPath.startsWith("/") ? adminPath : `/${adminPath}`}`;

  const response = await fetch(url, { ...options, headers });

  // Log response for debugging
  if (!response.ok) {
    let errorData: any = {};
    try {
      const errorText = await response.clone().text();
      errorData = JSON.parse(errorText);
    } catch {
      // If parsing fails, use empty object
    }
    
    console.error('Admin API Error:', {
      status: response.status,
      statusText: response.statusText,
      url,
      endpoint,
      error: errorData
    });

    // If 401, provide better error message and suggest re-login
    if (response.status === 401) {
      const message = errorData.message || 'Unauthorized. Your session may have expired.';
      
      // If token doesn't belong to device, suggest clearing and re-logging
      if (message.includes('token does not belong to this device') || message.includes('Session invalid')) {
        console.error('Token validation failed. This may indicate:');
        console.error('1. Token was issued for a different device/session');
        console.error('2. Backend session validation is strict');
        console.error('3. Token format mismatch');
        console.error('Solution: Clear localStorage and log in again as admin.');
        
        // Clear tokens to force re-login
        localStorage.removeItem('adminAccessToken');
        localStorage.removeItem('adminRefreshToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        throw new Error(`${message} Please log out and log in again as admin.`);
      }
      
      throw new Error(message);
    }
  }

  return response;
};

/** Active session/device from GET /auth/sessions */
export interface AuthSession {
  token: string;
  createdAt: string;
  expiresAt: string;
  deviceInfo?: Record<string, unknown>;
}

// Auth API
export const authAPI = {
  /**
   * Register a new user
   * POST /auth/register
   * @param email - User email
   * @param username - Username
   * @param password - User password
   * @returns Promise with accessToken, refreshToken, tokenType, and user data
   */
  register: async (email: string, username: string, password: string) => {
    try {
      // Backend expects: { username, email, password } (not name)
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });

      // Accept both 200 and 201 status codes for registration
      if (!response.ok && response.status !== 201) {
        const errorData = await response.json().catch(() => ({}));
        // Handle validation errors array
        if (Array.isArray(errorData.message)) {
          const errorMessage = errorData.message.join(", ");
          const error = new Error(errorMessage);
          (error as any).message = errorData.message; // Keep array for detailed handling
          throw error;
        }
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      const payload = data?.data ?? data;
      const accessToken = payload?.accessToken ?? data?.accessToken;
      const refreshToken = payload?.refreshToken ?? data?.refreshToken;
      const user = payload?.user ?? data?.user;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        if (user && typeof user === 'object') {
          localStorage.setItem('user', JSON.stringify(user));
        }
        setLastLoginTime();
      }
      return { accessToken, refreshToken, user, ...data };
    } catch (error: any) {
      // Handle network/fetch errors
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      // Re-throw the original error if it's already an Error instance
      if (error instanceof Error) {
        throw error;
      }
      // Handle other error types
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred during registration');
    }
  },

  /**
   * Login with email/username and password
   * POST /auth/login
   * @param identifier - Email or username
   * @param password - User password
   * @returns Promise with accessToken, refreshToken, tokenType, and user data
   */
  login: async (identifier: string, password: string) => {
    try {
      // Backend expects: { identifier, password } (not email)
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Handle validation errors array
        if (Array.isArray(errorData.message)) {
          const errorMessage = errorData.message.join(", ");
          const error = new Error(errorMessage);
          (error as any).message = errorData.message; // Keep array for detailed handling
          throw error;
        }
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      // Support multiple response shapes: { accessToken, user } or { data: { accessToken, user } }
      const payload = data?.data ?? data;
      const accessToken = payload?.accessToken ?? data?.accessToken;
      const refreshToken = payload?.refreshToken ?? data?.refreshToken;
      const user = payload?.user ?? data?.user;
      if (accessToken) {
        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) {
          localStorage.setItem('refreshToken', refreshToken);
        }
        if (user && typeof user === 'object') {
          localStorage.setItem('user', JSON.stringify(user));
        }
        setLastLoginTime();
      }
      return { accessToken, refreshToken, user, ...data };
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Logout current device/session
   * POST /auth/logout
   * @returns Promise
   */
  logout: async () => {
    try {
      const response = await apiRequest('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({}), // Send empty JSON body to avoid "Body cannot be empty" error
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return response.json().catch(() => ({}));
    } catch (error: any) {
      // Clear local storage even if request fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Logout from all devices/sessions
   * POST /auth/logout-all
   * @returns Promise
   */
  logoutAll: async () => {
    try {
      const response = await apiRequest('/auth/logout-all', {
        method: 'POST',
        body: JSON.stringify({}), // Send empty JSON body to avoid "Body cannot be empty" error
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return response.json().catch(() => ({}));
    } catch (error: any) {
      // Clear local storage even if request fails
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Get current user from localStorage
   * Normalizes _id to id for MongoDB compatibility.
   * @returns User object or null
   */
  getCurrentUser: () => {
    if (typeof window === 'undefined') return null;
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      const u = JSON.parse(userStr);
      if (!u || typeof u !== 'object') return null;
      if (u._id && !u.id) u.id = u._id;
      return u;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns boolean
   */
  isAuthenticated: (): boolean => {
    return !!getAuthToken();
  },

  /**
   * Initiate Google OAuth login
   * GET /auth/google
   * @returns Promise with redirectUrl
   */
  googleLogin: async () => {
    try {
      const response = await apiRequest('/auth/google', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      // If redirectUrl is provided, redirect the user
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Google OAuth callback handler
   * GET /auth/google/callback
   * This is typically called by the OAuth provider after authentication
   * @returns Promise with accessToken, refreshToken, tokenType, and user data
   */
  googleCallback: async () => {
    try {
      const response = await apiRequest('/auth/google/callback', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      }
      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Refresh access token using refresh token
   * POST /auth/refresh
   * Uses direct fetch (no Bearer token) so refresh works when access token is expired.
   * @param refreshToken - Optional refresh token (uses stored token if not provided)
   * @returns Promise with new accessToken, refreshToken, tokenType, and user data
   */
  refresh: async (refreshToken?: string) => {
    try {
      const token = refreshToken || getRefreshToken();
      if (!token) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${API_AUTH}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken: token }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { message?: string; error?: string };
        const msg = errorData?.message || errorData?.error || `Server error: ${response.status}`;
        if (response.status === 401) {
          clearAuthTokens();
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth-storage-change'));
            window.location.href = '/auth/sign-in';
          }
        }
        throw new Error(msg);
      }

      const data = await response.json() as {
        accessToken?: string;
        refreshToken?: string;
        tokenType?: string;
        user?: Record<string, unknown>;
      };
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        // Notify AuthContext and other listeners that tokens have been refreshed
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth-storage-change'));
        }
      }
      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Request password reset email (public, no login required)
   * POST /auth/forgot-password
   * Always returns same success message whether email exists or not (security).
   * @param email - User email address
   * @returns Promise with message
   */
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const trimmed = (email || '').trim();
    if (!trimmed) {
      throw new Error('Email is required');
    }
    try {
      const response = await apiRequest('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: trimmed }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.message || errorData.error || `Server error: ${response.status}`;
        throw new Error(typeof msg === 'string' ? msg : Array.isArray(msg) ? msg.join(', ') : 'Request failed');
      }

      const data = await response.json().catch(() => ({}));
      return {
        message: data?.message ?? 'If your email is registered, you will receive a password reset link shortly.',
      };
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Reset password using reset token
   * POST /auth/reset-password
   * @param token - Password reset token
   * @param newPassword - New password
   * @returns Promise
   */
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await apiRequest('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json().catch(() => ({}));
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Get all active sessions/devices
   * GET /auth/sessions
   * @returns Promise with array of active sessions (user-specific)
   */
  getSessions: async (): Promise<AuthSession[]> => {
    try {
      const response = await apiRequest('/auth/sessions', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },
};

// LLM API (Sarvam AI via backend)
export const llmAPI = {
  chat: async (
    message: string,
    options?: {
      systemPrompt?: string;
      max_tokens?: number;
      temperature?: number;
      top_p?: number;
    }
  ) => {
    try {
      const response = await apiRequest('/api/llm/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          ...options,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      // Handle network errors (backend not running, CORS, etc.)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running on port 5000.');
      }
      throw error;
    }
  },

  /** Sarvam AI chat completions (used by Agent LLM page). Returns OpenAI-compatible shape. */
  chatCompletions: async (data: {
    prompt: string;
    model?: string;
    temperature?: number;
    reasoning_effort?: string;
    stream?: boolean;
  }) => {
    try {
      const response = await apiRequest('/api/llm/chat-completions', {
        method: 'POST',
        body: JSON.stringify({
          prompt: data.prompt,
          model: data.model ?? 'sarvam-m',
          temperature: data.temperature ?? 0.7,
          reasoning_effort: data.reasoning_effort ?? 'high',
          stream: data.stream ?? false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running on port 5000.');
      }
      throw error;
    }
  },
};

// Sarvam chat – use main backend (same origin / proxy) so no separate server on 3000
const SARVAM_CHAT_BASE = (process.env.NEXT_PUBLIC_SARVAM_CHAT_URL || '').trim();

/** WebSocket URL for voice agent. Only set if using a separate chat server. */
export const SARVAM_VOICE_WS_URL = SARVAM_CHAT_BASE ? SARVAM_CHAT_BASE.replace(/^http/, 'ws').replace(/\/$/, '') : '';

function stripThinkBlocks(text: string): string {
  if (typeof text !== 'string') return text;
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<think>[\s\S]*/gi, '').trim();
}

export const sarvamChatAPI = {
  chat: async (messages: { role: string; content: string }[]) => {
    const response = await apiRequest('/api/llm/chat-completions', {
      method: 'POST',
      body: JSON.stringify({ messages, stream: false }),
    });
    const data = await response.json().catch(() => ({})) as {
      choices?: Array<{ message?: { content?: string } }>;
      message?: string;
    };
    if (!response.ok) {
      throw new Error((data as { message?: string }).message || `Server error: ${response.status}`);
    }
    let reply = data.choices?.[0]?.message?.content;
    if (reply === undefined) {
      throw new Error((data as { message?: string }).message || 'Invalid response from chat API');
    }
    return stripThinkBlocks(reply);
  },
};

// Video API (ModelsLab Text2Video - key on backend)
export const videoAPI = {
  generateVideo: async (body: { prompt: string; negative_prompt?: string }) => {
    const response = await apiRequest('/api/video/generate-video', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error((data as { error?: string }).error || 'Video generation failed');
    return data as { request_id?: string; [k: string]: unknown };
  },
  getVideoStatus: async (request_id: string) => {
    const response = await apiRequest('/api/video/video-status', {
      method: 'POST',
      body: JSON.stringify({ request_id }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error((data as { error?: string }).error || 'Status check failed');
    return data as { status?: string; output?: string[]; [k: string]: unknown };
  },
};

// Image API (backend text2img – z-image-turbo via ModelsLab)
export const imageAPI = {
  text2img: async (params: {
    prompt: string;
    model_id?: string;
    width?: number;
    height?: number;
    negative_prompt?: string;
  }) => {
      const response = await apiRequest('/image/text2img', {
      method: 'POST',
      body: JSON.stringify({
        prompt: params.prompt,
        model_id: params.model_id ?? 'z-image-turbo',
        width: params.width ?? 1024,
        height: params.height ?? 1024,
        negative_prompt: params.negative_prompt ?? '',
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error((data as { error?: string }).error || 'Image generation failed');
    return data as { status?: string; output?: string[]; proxy_links?: string[]; image_url?: string; [k: string]: unknown };
  },
};

// Audio API (TTS - ModelsLab)
export interface VoiceItem {
  voice_id: string;
  gender?: string;
  language?: string;
  emotion?: boolean;
  sound_clip?: string;
}

export const audioAPI = {
  /** GET /api/audio/voices - List all available TTS voices */
  getVoices: async (params?: { language?: string; refresh?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.language) qs.set("language", params.language);
    if (params?.refresh) qs.set("refresh", "true");
    const query = qs.toString();
    const response = await apiRequest(`/api/audio/voices${query ? `?${query}` : ""}`, {
      method: "GET",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error((data as { message?: string }).message || "Failed to fetch voices");
    return data as VoiceItem[] | { voices?: VoiceItem[] };
  },

  /** POST /api/audio/text-to-speech - Convert text to speech */
  textToSpeech: async (body: {
    prompt: string;
    voice_id: string;
    language?: string;
    speed?: number;
    emotion?: boolean;
  }) => {
    const response = await apiRequest("/api/audio/text-to-speech", {
      method: "POST",
      body: JSON.stringify({
        prompt: body.prompt,
        voice_id: body.voice_id,
        language: body.language ?? "american english",
        speed: body.speed ?? 1,
        emotion: body.emotion ?? false,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = data as { message?: string; error?: string };
      const msg = err.message || err.error || "TTS generation failed";
      if (response.status === 400) {
        throw new Error(msg.includes("credit") || msg.includes("insufficient") ? "Insufficient credits for audio generation" : msg);
      }
      throw new Error(msg);
    }
    const d = data as { url?: string; audio_url?: string; output?: string; data?: { url?: string } };
    return { url: d.url ?? d.audio_url ?? d.output ?? d.data?.url };
  },
};

// Custom Agent API - uses /api/custom-agent proxy (rewrites to VITE_API_URL/custom-agent)
const CUSTOM_AGENT_BASE = "/api/custom-agent";

const customAgentRequest = async (path: string, options: RequestInit = {}): Promise<Response> => {
  const url = path.startsWith("/") ? `${CUSTOM_AGENT_BASE}${path}` : `${CUSTOM_AGENT_BASE}/${path}`;
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const doFetch = (token: string | null) => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return fetch(`${base}${url}`, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  let token = typeof window !== "undefined" ? getAuthToken() : null;
  let res = await doFetch(token);

  if (res.status === 401) {
    const errData = await res.json().catch(() => ({})) as { message?: string };
    const errMsg = errData.message ?? "";
    const isSessionError = /token does not belong|session.*not belong|Session invalid/i.test(errMsg);
    try {
      await authAPI.refresh();
      token = getAuthToken();
      if (token) res = await doFetch(token);
    } catch {
      if (isSessionError) {
        forceLogoutAndRedirect();
      }
      throw new Error(errMsg || "Session expired. Please sign in again to continue.");
    }
    if (res.status === 401 && isSessionError) {
      forceLogoutAndRedirect();
      throw new Error("Session expired. Please sign in again to continue.");
    }
  }

  return res;
};

export interface CustomAgent {
  _id: string;
  name: string;
  systemPrompt?: string;
  brandDetails?: string;
  welcomeMessage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const customAgentAPI = {
  /** POST /custom-agent - Create a new custom agent */
  create: async (body: {
    name: string;
    systemPrompt?: string;
    brandDetails?: string;
    welcomeMessage?: string;
  }): Promise<CustomAgent> => {
    const response = await customAgentRequest("", {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({})) as { message?: string; error?: string };
      const msg = err.message || err.error || `Failed to create agent (${response.status})`;
      throw new Error(msg);
    }
    return response.json();
  },

  /** GET /custom-agent - List all agents owned by the current user */
  list: async (): Promise<CustomAgent[]> => {
    const response = await customAgentRequest("", { method: "GET" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to fetch agents");
    }
    const data = await response.json();
    return Array.isArray(data) ? data : data?.agents ?? data?.data ?? [];
  },

  /** GET /custom-agent/{agentId} - Get a specific agent */
  get: async (agentId: string): Promise<CustomAgent> => {
    const response = await customAgentRequest(`/${agentId}`, { method: "GET" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to fetch agent");
    }
    return response.json();
  },

  /** PATCH /custom-agent/{agentId} - Update agent */
  update: async (
    agentId: string,
    body: { name?: string; systemPrompt?: string; brandDetails?: string; welcomeMessage?: string }
  ): Promise<CustomAgent> => {
    const response = await customAgentRequest(`/${agentId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to update agent");
    }
    return response.json();
  },

  /** DELETE /custom-agent/{agentId} - Delete an agent */
  delete: async (agentId: string): Promise<void> => {
    // Some backends expect a non-empty JSON body even for DELETE.
    // Send the agentId for clarity while keeping the path as the primary identifier.
    const response = await customAgentRequest(`/${agentId}`, {
      method: "DELETE",
      body: JSON.stringify({ agentId }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to delete agent");
    }
  },

  /** POST /custom-agent/{agentId}/ingest/crawler - Crawl website and ingest into RAG */
  ingestCrawler: async (
    agentId: string,
    body: { url: string; max_depth?: number; mode?: "append" | "overwrite" }
  ): Promise<{ jobId?: string; [k: string]: unknown }> => {
    const response = await customAgentRequest(`/${agentId}/ingest/crawler`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Crawl ingest failed");
    }
    return response.json();
  },

  /** POST /custom-agent/{agentId}/ingest/files - Upload documents for RAG ingestion */
  ingestFiles: async (
    agentId: string,
    params: { files: File[]; mode?: "append" | "overwrite" }
  ): Promise<{ jobId?: string; [k: string]: unknown }> => {
    const formData = new FormData();
    params.files.forEach((f) => formData.append("files", f));
    if (params.mode) formData.append("mode", params.mode);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const base = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${base}/api/custom-agent/${agentId}/ingest/files`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "File ingestion failed");
    }
    return res.json();
  },

  /** POST /custom-agent/{agentId}/chat - Chat with agent (multipart/form-data) */
  chat: async (
    agentId: string,
    params: {
      query: string;
      session_id?: string;
      stream?: boolean;
      model_provider?: string;
      image_mode?: string;
      reranker_model_name?: string;
      files?: File[];
      images?: File[];
    }
  ): Promise<{ response?: string; answer?: string; [k: string]: unknown }> => {
    const formData = new FormData();
    formData.append("query", params.query);
    if (params.session_id) formData.append("session_id", params.session_id);
    if (params.stream !== undefined) formData.append("stream", String(params.stream));
    if (params.model_provider) formData.append("model_provider", params.model_provider);
    if (params.image_mode) formData.append("image_mode", params.image_mode);
    if (params.reranker_model_name) formData.append("reranker_model_name", params.reranker_model_name);
    (params.files || []).forEach((f) => formData.append("files", f));
    (params.images || []).forEach((f) => formData.append("images", f));

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const base = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${base}/api/custom-agent/${agentId}/chat`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || `Chat failed: ${res.status}`);
    }
    return res.json();
  },

  /** POST /custom-agent/{agentId}/chat - Chat with agent (streaming SSE or JSON) */
  chatStream: async (
    agentId: string,
    params: {
      query: string;
      session_id?: string;
      model_provider?: string;
      image_mode?: string;
      reranker_model_name?: string;
      files?: File[];
      images?: File[];
      /** If false, request/response use application/json; if true, request Accept is text/event-stream for SSE. */
      stream?: boolean;
      /** When true (e.g. chat opened in new tab as widget), 401 does not clear tokens so main window stays logged in. */
      widgetMode?: boolean;
      onChunk?: (text: string) => void;
      onJson?: (payload: Record<string, unknown>) => void;
      onDone?: () => void;
      onError?: (err: Error) => void;
    }
  ): Promise<void> => {
    const stream = params.stream !== false;
    const buildFormData = (includeSessionId = true) => {
      const fd = new FormData();
      fd.append("query", params.query);
      if (includeSessionId && params.session_id) fd.append("session_id", params.session_id);
      fd.append("stream", stream ? "true" : "false");
      if (params.model_provider) fd.append("model_provider", params.model_provider);
      if (params.image_mode) fd.append("image_mode", params.image_mode);
      if (params.reranker_model_name) fd.append("reranker_model_name", params.reranker_model_name);
      (params.files || []).forEach((f) => fd.append("files", f));
      (params.images || []).forEach((f) => fd.append("images", f));
      return fd;
    };

    const base = typeof window !== "undefined" ? window.location.origin : "";
    const doFetch = (token: string | null, includeSessionId = true) => {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      // For agent interact stream API: use event-stream when streaming, application/json when not
      headers["Accept"] = stream ? "text/event-stream" : "application/json";
      return fetch(`${base}/api/custom-agent/${agentId}/chat`, {
        method: "POST",
        headers,
        body: buildFormData(includeSessionId),
        credentials: "include",
      });
    };

    let token = typeof window !== "undefined" ? getAuthToken() : null;
    let res: Response;
    try {
      res = await doFetch(token, true);
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      params.onError?.(err);
      throw err;
    }

    if (res.status === 401) {
      const errData = await res.json().catch(() => ({})) as { message?: string };
      const errMsg = errData.message ?? "";
      const isSessionError = /token does not belong|session.*not belong|Session invalid/i.test(errMsg);
      const widgetMode = params.widgetMode === true;
      try {
        await authAPI.refresh();
        token = getAuthToken();
        if (token) {
          res = await doFetch(token, true);
        }
      } catch {
        if (isSessionError && !widgetMode) {
          forceLogoutAndRedirect();
        }
        const err = new Error(errMsg || "Session expired. Please sign in again to continue.");
        params.onError?.(err);
        throw err;
      }
      if (res.status === 401 && isSessionError && !widgetMode) {
        forceLogoutAndRedirect();
        const err = new Error("Session expired. Please sign in again to continue.");
        params.onError?.(err);
        throw err;
      }
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({})) as { message?: string };
      const errMsg = errData.message ?? "";
      const isSessionNotBelong = /session.*not belong|not belong.*session/i.test(errMsg);
      if (params.session_id && isSessionNotBelong && res.status !== 401) {
        try {
          res = await doFetch(token, false);
        } catch (e) {
          const err = e instanceof Error ? e : new Error(String(e));
          params.onError?.(err);
          throw err;
        }
      }
      if (!res.ok) {
        const finalErr = await res.json().catch(() => ({})) as { message?: string };
        const err = new Error(finalErr.message || errMsg || `Chat failed: ${res.status}`);
        params.onError?.(err);
        throw err;
      }
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      try {
        const data = (await res.json()) as Record<string, unknown>;
        params.onJson?.(data);
        const text =
          (data.response as string) ??
          (data.answer as string) ??
          (data.text as string) ??
          (data.content as string) ??
          (data.message as string) ??
          (data.output as string) ??
          (data.result as string) ??
          (typeof (data as { data?: unknown }).data === "string" ? (data as { data: string }).data : undefined) ??
          "";
        if (text) params.onChunk?.(text);
      } catch (e) {
        params.onError?.(e instanceof Error ? e : new Error(String(e)));
        throw e;
      }
      params.onDone?.();
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      const err = new Error("No response body");
      params.onError?.(err);
      throw err;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    function extractTextFromPayload(payload: string): string | null {
      const trimmed = payload.trim();
      if (!trimmed || trimmed === "[DONE]") return null;
      try {
        const parsed = JSON.parse(trimmed) as Record<string, unknown>;
        const text =
          (parsed.text as string) ??
          (parsed.delta as string) ??
          (parsed.content as string) ??
          ((parsed.choices as Array<{ delta?: { content?: string }; text?: string }>)?.[0]?.delta?.content) ??
          ((parsed.choices as Array<{ text?: string }>)?.[0]?.text) ??
          (parsed.answer as string) ??
          (parsed.response as string) ??
          (parsed.message as string) ??
          (parsed.output as string) ??
          "";
        return text || null;
      } catch {
        return trimmed || null;
      }
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (buffer.trim()) {
            const lines = buffer.split(/\r?\n/);
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const text = extractTextFromPayload(line.slice(6));
                if (text) params.onChunk?.(text);
              }
            }
          }
          params.onDone?.();
          break;
        }
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const text = extractTextFromPayload(line.slice(6));
            if (text) params.onChunk?.(text);
          } else if (line.trim() && !line.startsWith("event:") && !line.startsWith(":")) {
            const text = extractTextFromPayload(line) ?? line.trim();
            if (text) params.onChunk?.(text);
          }
        }
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      params.onError?.(err);
      throw err;
    }
  },

  /** POST /custom-agent/{agentId}/tts - Text-to-speech via external RAG server (ModelsLab TTS) */
  tts: async (agentId: string, body: { text: string }): Promise<{ url?: string; audio_url?: string }> => {
    const response = await customAgentRequest(`/${agentId}/tts`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "TTS failed");
    }
    const data = await response.json();
    const url =
      data?.url ??
      data?.audio_url ??
      (typeof data === "string" ? data : null) ??
      (data as { data?: { url?: string; audio_url?: string } })?.data?.url ??
      (data as { data?: { url?: string; audio_url?: string } })?.data?.audio_url;
    return { url: url ?? undefined, audio_url: url ?? undefined };
  },

  /** POST /custom-agent/{agentId}/transcribe - Audio transcription via external RAG server */
  transcribe: async (agentId: string, audioFile: File): Promise<{ text?: string; transcription?: string }> => {
    const formData = new FormData();
    formData.append("audio_file", audioFile);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const base = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${base}/api/custom-agent/${agentId}/transcribe`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Transcription failed");
    }
    const data = await res.json();
    const text = data?.text ?? data?.transcription ?? (data as { data?: { text?: string } })?.data?.text;
    return { text, transcription: text };
  },

  /** POST /custom-agent/{agentId}/feedback - Submit thumbs up/down feedback (RLHF) */
  feedback: async (
    agentId: string,
    body: {
      session_id: string;
      rating: "up" | "down";
      feedback_text?: string;
      metadata?: Record<string, unknown>;
    }
  ): Promise<{ ok?: boolean }> => {
    const response = await customAgentRequest(`/${agentId}/feedback`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Feedback failed");
    }
    return response.json();
  },

  /** GET /custom-agent/{agentId}/progress/{jobId} - Check ingestion or crawler job progress */
  getProgress: async (
    agentId: string,
    jobId: string
  ): Promise<{ status?: string; progress?: number; message?: string; [k: string]: unknown }> => {
    const response = await customAgentRequest(`/${agentId}/progress/${jobId}`, { method: "GET" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to fetch progress");
    }
    const raw = await response.json();
    const status = raw.status ?? (raw as { state?: string }).state;

    // Normalise progress: progress, progress_percent, or chunks_added / total_chunks
    let progress: number | undefined;
    if (typeof raw.progress === "number") {
      progress = raw.progress;
    } else if (typeof (raw as { progress_percent?: number }).progress_percent === "number") {
      progress = (raw as { progress_percent: number }).progress_percent;
    } else if (
      typeof (raw as { chunks_added?: number }).chunks_added === "number" &&
      typeof (raw as { total_chunks?: number }).total_chunks === "number" &&
      (raw as { total_chunks: number }).total_chunks > 0
    ) {
      const c = raw as { chunks_added: number; total_chunks: number };
      progress = (c.chunks_added / c.total_chunks) * 100;
    }

    // Prefer explicit message fields, then fall back to latest log entry
    let message =
      raw.message ??
      (raw as { detail?: string }).detail ??
      (raw as { description?: string }).description;
    if (!message && Array.isArray((raw as { logs?: unknown[] }).logs)) {
      const logs = (raw as { logs?: unknown[] }).logs ?? [];
      const last = logs[logs.length - 1];
      if (typeof last === "string") message = last;
    }

    return { ...raw, status, progress, message };
  },

  /** GET /custom-agent/{agentId}/analytics/progress/{jobId} - Check async analytics (Business Analyst) job status */
  getAnalyticsProgress: async (
    agentId: string,
    jobId: string
  ): Promise<{ status?: string; progress?: number; message?: string; [k: string]: unknown }> => {
    const response = await customAgentRequest(`/${agentId}/analytics/progress/${jobId}`, { method: "GET" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to fetch analytics progress");
    }
    const raw = await response.json();
    const status = raw.status ?? (raw as { state?: string }).state;

    let progress: number | undefined;
    if (typeof raw.progress === "number") {
      progress = raw.progress;
    } else if (typeof (raw as { progress_percent?: number }).progress_percent === "number") {
      progress = (raw as { progress_percent: number }).progress_percent;
    }

    const message =
      raw.message ??
      (raw as { detail?: string }).detail ??
      (raw as { description?: string }).description;

    return { ...raw, status, progress, message };
  },

  /** GET /custom-agent/{agentId}/ingest/status - Vector store stats (collection, total vectors, documents) for this agent/tenant */
  getIngestStatus: async (
    agentId: string
  ): Promise<{ collection?: string; totalVectors?: number; documents?: number; [k: string]: unknown }> => {
    const response = await customAgentRequest(`/${agentId}/ingest/status`, { method: "GET" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to fetch ingest status");
    }
    return response.json();
  },

  /** GET /custom-agent/{agentId}/metrics - System metrics from external RAG server */
  metrics: async (agentId: string): Promise<Record<string, unknown>> => {
    const response = await customAgentRequest(`/${agentId}/metrics`, { method: "GET" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to fetch metrics");
    }
    return response.json();
  },

  /** POST /custom-agent/{agentId}/bootstrap - Bootstrap persona on external RAG server */
  bootstrap: async (agentId: string, companyLogo?: File): Promise<{ ok?: boolean }> => {
    const formData = new FormData();
    if (companyLogo) formData.append("company_logo", companyLogo);

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const base = typeof window !== "undefined" ? window.location.origin : "";
    const res = await fetch(`${base}/api/custom-agent/${agentId}/bootstrap`, {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Bootstrap failed");
    }
    return res.json();
  },
};

// Crawl API - uses /api/crawl/website rewrite (optional; backend may not have this endpoint)
export const crawlAPI = {
  crawlWebsite: async (url: string): Promise<{ success: boolean; data?: { url?: string; title?: string; description?: string; favicon?: string | null; logo?: string | null }; message?: string }> => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const base = typeof window !== "undefined" ? window.location.origin : "";
      const response = await fetch(`${base}/api/crawl/website`, {
        method: "POST",
        headers,
        body: JSON.stringify({ url }),
        credentials: "include",
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || `Server error: ${response.status}`);
      }
      return response.json();
    } catch (error: unknown) {
      // Crawl is optional - return failure so UI can continue without auto-fill
      const msg = error instanceof Error ? error.message : "Crawl unavailable";
      return { success: false, message: msg };
    }
  },
};

const readErrorMessage = async (response: Response): Promise<string> => {
  const text = await response.text().catch(() => "");
  if (!text) return `Server error: ${response.status}`;

  try {
    const parsed = JSON.parse(text) as {
      message?: string | string[];
      error?: string;
      details?: string;
    };
    if (Array.isArray(parsed.message)) return parsed.message.join(", ");
    return parsed.message || parsed.error || parsed.details || text;
  } catch {
    return text;
  }
};

const parseJsonOrText = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json().catch(() => ({}));
  }
  return response.text();
};

const fetchApimodule = async (
  endpoint: string,
  init: RequestInit,
  preferAuth = false
): Promise<Response> => {
  const headers: HeadersInit = { ...(init.headers || {}) };
  if (preferAuth) {
    const token = getAuthToken();
    if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  // Resolve backend base URL (direct call avoids Next.js rewrite proxy timeout / ECONNRESET)
  const apiBase =
    (typeof window !== "undefined" && (process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL)) ||
    "https://api.akobot.ai";
  const directUrl = `${apiBase.replace(/\/$/, "")}/apimodule${endpoint}`;
  const proxyUrl = `/api/proxy/apimodule${endpoint}`;

  const doFetch = (reqHeaders: HeadersInit, url: string, credentials: RequestCredentials = "omit") =>
    fetch(url, {
      ...init,
      headers: reqHeaders,
      mode: "cors",
      credentials,
    });

  let response: Response;
  try {
    response = await doFetch(headers, directUrl);
  } catch {
    // CORS / network error on direct fetch — fall back to same-origin proxy
    response = await doFetch(headers, proxyUrl, "include");
  }

  if (response.status === 401 && preferAuth) {
    try {
      await authAPI.refresh();
      const newToken = getAuthToken();
      if (newToken) {
        const retryHeaders: HeadersInit = { ...(init.headers || {}), Authorization: `Bearer ${newToken}` };
        try {
          response = await doFetch(retryHeaders, directUrl);
        } catch {
          response = await doFetch(retryHeaders, proxyUrl, "include");
        }
      }
    } catch {
      // Refresh failed, return original 401
    }
  } else if (response.status === 401 && !preferAuth) {
    const token = getAuthToken();
    if (token) {
      const retryHeaders: HeadersInit = { ...headers, Authorization: `Bearer ${token}` };
      try {
        response = await doFetch(retryHeaders, directUrl);
      } catch {
        response = await doFetch(retryHeaders, proxyUrl, "include");
      }
    }
  }

  return response;
};

const extractSseContent = (payload: unknown): string => {
  const json = payload as {
    choices?: Array<{
      delta?: { content?: string };
      message?: { content?: string };
      text?: string;
      content?: string;
    }>;
    delta?: { content?: string };
    message?: { content?: string };
    content?: string;
    text?: string;
  };

  return (
    json?.choices?.[0]?.delta?.content ||
    json?.choices?.[0]?.message?.content ||
    json?.choices?.[0]?.text ||
    json?.choices?.[0]?.content ||
    json?.delta?.content ||
    json?.message?.content ||
    json?.content ||
    json?.text ||
    ""
  );
};

// Module API - implementation for apimodule endpoints
export const moduleAPI = {
  /**
   * Chat Completions (non-streaming)
   * POST /apimodule/v1/chat/completions
   * Returns plain text body in non-stream mode.
   */
  chatCompletions: async (data: {
    prompt: string;
    model: string;
    stream?: boolean;
  }) => {
    try {
      const response = await fetchApimodule(
        "/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({
            prompt: data.prompt,
            model: data.model,
            stream: data.stream ?? false,
          }),
        },
        true // preferAuth: send token when available (backend may require auth)
      );

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      return parseJsonOrText(response);
    } catch (error: any) {
      if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
        throw new Error("Cannot connect to backend. Make sure the backend server is running.");
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  /**
   * Chat Completions (streaming via SSE)
   * POST /apimodule/v1/chat/completions
   */
  chatCompletionsStream: async (
    data: {
      prompt: string;
      model: string;
    },
    onChunk: (chunk: string) => void
  ) => {
    try {
      const response = await fetchApimodule(
        "/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream, application/json, text/plain, */*",
          },
          body: JSON.stringify({
            prompt: data.prompt,
            model: data.model,
            stream: true,
          }),
        },
        true // preferAuth
      );

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
      if (!response.body) {
        throw new Error("Streaming response body is missing.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("data:")) {
            const payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") return;
            try {
              const parsed = JSON.parse(payload);
              const content = typeof parsed === "string" ? parsed : extractSseContent(parsed);
              if (content) onChunk(content);
            } catch {
              onChunk(payload);
            }
            continue;
          }

          onChunk(trimmed);
        }
      }

      const remaining = buffer.trim();
      if (!remaining || remaining === "data: [DONE]") return;

      if (remaining.startsWith("data:")) {
        const payload = remaining.slice(5).trim();
        if (payload && payload !== "[DONE]") {
          try {
            const parsed = JSON.parse(payload);
            const content = typeof parsed === "string" ? parsed : extractSseContent(parsed);
            if (content) onChunk(content);
          } catch {
            onChunk(payload);
          }
        }
      } else {
        onChunk(remaining);
      }
    } catch (error: any) {
      if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
        throw new Error("Cannot connect to backend. Make sure the backend server is running.");
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  /**
   * Image Generation (returns base64, no polling)
   * POST /apimodule/v1/image-gen
   * Falls back to imageAPI.text2img if apimodule returns 500.
   */
  imageGen: async (data: {
    prompt: string;
    model_id: string;
    width?: number;
    height?: number;
  }) => {
    const body = {
      prompt: data.prompt,
      model_id: data.model_id,
      width: data.width ?? 512,
      height: data.height ?? 512,
    };
    try {
      const response = await fetchApimodule(
        "/v1/image-gen",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        },
        true
      );

      if (!response.ok) {
        if (response.status === 500) {
          try {
            return await imageAPI.text2img({
              prompt: data.prompt,
              model_id: data.model_id,
              width: data.width ?? 512,
              height: data.height ?? 512,
            });
          } catch {
            const msg = await readErrorMessage(response);
            throw new Error(`Image generation failed: ${msg}`);
          }
        }
        const msg = await readErrorMessage(response);
        throw new Error(msg);
      }

      return response.json().catch(() => ({}));
    } catch (error: any) {
      if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
        throw new Error("Cannot connect to backend. Make sure the backend server is running.");
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  /**
   * Image to Image transformation
   * POST /apimodule/v1/image-to-image (multipart/form-data)
   * Always sends init_image as a base64 data URL for maximum compatibility.
   * Also sends the file field when available (preferred by some backends).
   * Handles 401 "token does not belong to this device" with refresh + retry.
   */
  imageToImage: async (data: {
    prompt: string;
    model_id?: string;
    init_image?: string;
    strength?: number;
    file?: File;
  }) => {
    try {
      // Helper: convert File to base64 data URL
      const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      // Always resolve init_image as a full data URL
      let initImageDataUrl: string | undefined = undefined;
      if (data.file) {
        initImageDataUrl = await fileToBase64(data.file);
      } else if (data.init_image) {
        initImageDataUrl = data.init_image.startsWith("data:")
          ? data.init_image
          : `data:image/png;base64,${data.init_image}`;
      }

      const buildFormData = () => {
        const fd = new FormData();
        // Backend requires prompt as a non-empty string
        const promptVal =
          (typeof data.prompt === "string" && data.prompt.trim()) || "Transform image";
        fd.append("prompt", promptVal);
        if (data.model_id) fd.append("model_id", String(data.model_id));
        if (data.strength !== undefined) fd.append("strength", String(data.strength));
        // Always send init_image as data URL (reliable across CORS/proxy)
        if (initImageDataUrl) {
          fd.append("init_image", initImageDataUrl);
        }
        // Also send file field when available (some backends prefer it)
        if (data.file) fd.append("file", data.file);
        return fd;
      };
      const apiBase =
        (typeof window !== "undefined" && (process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL)) ||
        "https://api.akobot.ai";
      const directUrl = `${apiBase.replace(/\/$/, "")}/apimodule/v1/image-to-image`;
      const proxyUrl = "/api/proxy/apimodule/v1/image-to-image";
      const doRequest = (token: string | null, useProxy = false) => {
        const headers: HeadersInit = {};
        if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`;
        const url = useProxy ? proxyUrl : directUrl;
        return fetch(url, {
          method: "POST",
          headers,
          body: buildFormData(),
          credentials: useProxy ? "include" : "omit",
        });
      };

      let token = getAuthToken();
      let response: Response;
      try {
        response = await doRequest(token);
      } catch (e) {
        // CORS/network error on direct fetch; fall back to same-origin proxy
        response = await doRequest(token, true);
      }

      if (response.status === 401) {
        let errMsg = "";
        try {
          const err = await response.json().catch(() => ({})) as { message?: string };
          errMsg = err?.message ?? "";
        } catch { /* ignore */ }

        const isDeviceError = /token does not belong|Session invalid/i.test(errMsg);

        try {
          await authAPI.refresh();
          token = getAuthToken();
          if (token) {
            try {
              response = await doRequest(token);
            } catch {
              response = await doRequest(token, true);
            }
          }
        } catch {
          if (isDeviceError) {
            forceLogoutAndRedirect();
            throw new Error("Session expired. Please sign in again to continue.");
          }
          throw new Error(errMsg || "Unauthorized. Please sign in again.");
        }

        if (response.status === 401 && isDeviceError) {
          forceLogoutAndRedirect();
          throw new Error("Session expired. Please sign in again to continue.");
        }
      }

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      return response.json().catch(() => ({}));
    } catch (error: any) {
      if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
        throw new Error("Cannot connect to backend. Make sure the backend server is running.");
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  /**
   * Text to Video Generation
   * POST /apimodule/v1/text-to-video
   */
  textToVideo: async (data: {
    prompt: string;
    model_id?: string;
    num_frames?: number;
    width?: number;
    height?: number;
    num_inference_steps?: number;
    guidance_scale?: number;
    fps?: number;
  }) => {
    try {
      const body = {
        prompt: data.prompt,
        model_id: data.model_id ?? "cogvideox",
        num_frames: data.num_frames ?? 25,
        width: data.width ?? 512,
        height: data.height ?? 512,
        num_inference_steps: data.num_inference_steps ?? 20,
        guidance_scale: data.guidance_scale ?? 7,
        fps: data.fps ?? 16,
      };
      const response = await fetchApimodule(
        "/v1/text-to-video",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(body),
        },
        true
      );

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      return response.json().catch(() => ({}));
    } catch (error: any) {
      if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
        throw new Error("Cannot connect to backend. Make sure the backend server is running.");
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  /**
   * Fetch image result by ID
   * GET /apimodule/v1/fetch-image-result/{id}
   */
  fetchImageResult: async (id: string) => {
    try {
      const response = await fetchApimodule(`/v1/fetch-image-result/${id}`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      return response.json().catch(() => ({}));
    } catch (error: any) {
      if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
        throw new Error("Cannot connect to backend. Make sure the backend server is running.");
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  },

  /**
   * Backward-compatible alias for old callers.
   */
  fetchResult: async (id: string) => moduleAPI.fetchImageResult(id),

  /**
   * Background Removal
   * POST /apimodule/v1/background-removal
   */
  backgroundRemoval: async (data: {
    file?: File;
    init_image?: string;
  }) => {
    try {
      const formData = new FormData();
      if (data.file) formData.append("file", data.file);
      if (data.init_image) {
        const base64String = data.init_image.includes(",")
          ? data.init_image.split(",")[1]
          : data.init_image;
        formData.append("init_image", base64String);
      }

      const response = await fetchApimodule(
        "/v1/background-removal",
        {
          method: "POST",
          body: formData,
        },
        true
      );

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      return response.json().catch(() => ({}));
    } catch (error: any) {
      if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
        throw new Error("Cannot connect to backend. Make sure the backend server is running.");
      }
      throw error instanceof Error ? error : new Error(String(error));
    }
  },
};

// Profile API
export const profileAPI = {
  /**
   * Get my profile
   * GET /api/profile/me
   * @returns Promise with user profile data
   */
  getProfile: async () => {
    try {
      const response = await apiRequest('/api/profile/me', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Change my password
   * POST /api/profile/change-password
   * @param currentPassword - Current password
   * @param newPassword - New password (must be ≥ 6 characters)
   * @returns Promise with success message
   */
  changePassword: async (currentPassword: string, newPassword: string) => {
    try {
      const response = await apiRequest('/api/profile/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Get my wallet balance
   * GET /api/profile/wallet/balance
   * @returns Promise with wallet balance
   */
  getWalletBalance: async () => {
    try {
      const response = await apiRequest('/api/profile/wallet/balance', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Get my wallet transaction history
   * GET /api/profile/wallet/history
   * @param params - Query parameters (page, limit, type, fromDate, toDate, sortOrder)
   * @returns Promise with transaction history
   */
  getWalletHistory: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    fromDate?: string;
    toDate?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params?.toDate) queryParams.append('toDate', params.toDate);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const queryString = queryParams.toString();
      const endpoint = `/api/profile/wallet/history${queryString ? `?${queryString}` : ''}`;

      const response = await apiRequest(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },
};

// Admin API
export const adminAPI = {
  /**
   * Admin login
   * POST /admin/auth/login
   * @param identifier - Admin identifier (username or email - backend accepts both)
   * @param password - Admin password
   * @returns Promise with accessToken, refreshToken, and admin data
   */
  login: async (identifier: string, password: string) => {
    try {
      const response = await fetch(`${API_ADMIN}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          Array.isArray(errorData.message) 
            ? errorData.message.join(', ') 
            : errorData.message || errorData.error || `Server error: ${response.status}`
        );
      }

      const data = await response.json();
      
      // Store admin tokens
      if (data.accessToken) {
        localStorage.setItem('adminAccessToken', data.accessToken);
        // Also set as regular accessToken for user session compatibility
        localStorage.setItem('accessToken', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('adminRefreshToken', data.refreshToken);
        // Also set as regular refreshToken for user session compatibility
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.admin) {
        localStorage.setItem('admin', JSON.stringify(data.admin));
        // Also store admin as user for compatibility
        localStorage.setItem('user', JSON.stringify(data.admin));
      }
      // If backend returns user data separately, store it
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      
      return data;
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Get all configurations (Admin)
   * GET /api/configs
   * @returns Promise with all configurations
   */
  getConfigs: async () => {
    try {
      const response = await adminApiRequest('/api/configs', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Get a config value by key (any authenticated user)
   * GET /api/configs/{key}
   * @param key - Config key
   * @returns Promise with config value
   */
  getConfig: async (key: string) => {
    try {
      const response = await adminApiRequest(`/api/configs/${key}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Create a configuration (Admin)
   * POST /api/configs
   * @param key - Config key
   * @param value - Config value
   * @returns Promise with created config
   */
  createConfig: async (key: string, value: any) => {
    try {
      const response = await adminApiRequest('/api/configs', {
        method: 'POST',
        body: JSON.stringify({ key, value }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Update a configuration (Admin)
   * PATCH /api/configs/{key}
   * @param key - Config key
   * @param value - New config value
   * @returns Promise with updated config
   */
  updateConfig: async (key: string, value: any) => {
    try {
      const response = await adminApiRequest(`/api/configs/${key}`, {
        method: 'PATCH',
        body: JSON.stringify({ value }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Delete a configuration (Admin)
   * DELETE /api/configs/{key}
   * @param key - Config key
   * @returns Promise with success message
   */
  deleteConfig: async (key: string) => {
    try {
      const response = await adminApiRequest(`/api/configs/${key}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Credit or Debit user wallet (Admin)
   * POST /api/wallet/admin/action
   * @param userId - User ID
   * @param amount - Amount to credit/debit
   * @param action - 'credit' or 'debit'
   * @param remark - Transaction remark
   * @param metadata - Optional metadata object
   * @returns Promise with transaction result
   */
  walletAction: async (data: {
    userId: string;
    amount: number;
    action: 'credit' | 'debit';
    remark: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      const response = await adminApiRequest('/api/wallet/admin/action', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      throw error;
    }
  },

  /**
   * Get wallet history for any user (Admin)
   * GET /api/wallet/admin/history/{userId}
   * @param userId - User ID
   * @param params - Query parameters (page, limit, type, fromDate, toDate, sortOrder)
   * @returns Promise with transaction history
   */
  getWalletHistory: async (userId: string, params?: {
    page?: number;
    limit?: number;
    type?: string;
    fromDate?: string;
    toDate?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.type) queryParams.append('type', params.type);
      if (params?.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params?.toDate) queryParams.append('toDate', params.toDate);
      if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const queryString = queryParams.toString();
      const endpoint = `/api/wallet/admin/history/${userId}${queryString ? `?${queryString}` : ''}`;

      const response = await adminApiRequest(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Get wallet balance for any user (Admin)
   * GET /api/wallet/admin/balance/{userId}
   * @param userId - User ID
   * @returns Promise with wallet balance
   */
  getWalletBalance: async (userId: string) => {
    try {
      const response = await adminApiRequest(`/api/wallet/admin/balance/${userId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Create a package (Admin)
   * POST /api/packages
   * @param data - Package data
   * @returns Promise with created package
   */
  createPackage: async (data: {
    name: string;
    description?: string;
    includedCredits: number;
    actualPrice?: number;
    currentPrice: number;
    offer?: string | null;
    isActive?: boolean;
    sortOrder?: number;
  }) => {
    try {
      // Ensure includedCredits is an integer
      const packageData = {
        ...data,
        includedCredits: Math.floor(data.includedCredits),
        actualPrice: data.actualPrice !== undefined ? Number(data.actualPrice) : undefined,
        currentPrice: Number(data.currentPrice),
        sortOrder: data.sortOrder !== undefined ? Number(data.sortOrder) : undefined,
      };
      
      const response = await adminApiRequest('/api/packages', {
        method: 'POST',
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Update a package (Admin)
   * PATCH /api/packages/{id}
   * @param id - Package ID
   * @param data - Updated package data
   * @returns Promise with updated package
   */
  updatePackage: async (id: string, data: Partial<{
    name: string;
    description: string;
    includedCredits: number;
    actualPrice: number;
    currentPrice: number;
    offer: string | null;
    isActive: boolean;
    sortOrder: number;
  }>) => {
    try {
      // Ensure includedCredits is an integer if provided
      const packageData: any = { ...data };
      if (packageData.includedCredits !== undefined) {
        packageData.includedCredits = Math.floor(packageData.includedCredits);
      }
      if (packageData.actualPrice !== undefined) {
        packageData.actualPrice = Number(packageData.actualPrice);
      }
      if (packageData.currentPrice !== undefined) {
        packageData.currentPrice = Number(packageData.currentPrice);
      }
      if (packageData.sortOrder !== undefined) {
        packageData.sortOrder = Number(packageData.sortOrder);
      }
      
      const response = await adminApiRequest(`/api/packages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(packageData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Delete a package (Admin)
   * DELETE /api/packages/{id}
   * @param id - Package ID
   * @returns Promise with success message
   */
  deletePackage: async (id: string) => {
    try {
      const response = await adminApiRequest(`/api/packages/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * List ALL packages including inactive (Admin)
   * GET /api/packages/admin/all
   * @returns Promise with all packages
   */
  getAllPackages: async () => {
    try {
      const response = await adminApiRequest('/api/packages/admin/all', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },
};

// Package API (Public)
export const packageAPI = {
  /**
   * List all active packages (Public)
   * GET /api/packages
   * @returns Promise with array of active packages
   */
  getAll: async () => {
    try {
      const response = await fetch(`${API_PACKAGES}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Get a package by ID (Public)
   * GET /api/packages/{id}
   * @param id - Package ID
   * @returns Promise with package data
   */
  getById: async (id: string) => {
    try {
      const response = await fetch(`${API_PACKAGES}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*',
        },
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },
};

// Admin Users API
export const adminUsersAPI = {
  /**
   * Search user by email (Admin)
   * GET /api/admin/users/search
   * @param email - Email to search
   * @returns Promise with user data
   */
  search: async (email: string) => {
    try {
      const response = await adminApiRequest(`/api/admin/users/search?email=${encodeURIComponent(email)}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Get all users (Admin)
   * GET /api/admin/users
   * @param params - Query parameters (page, limit, search)
   * @returns Promise with users list
   */
  getAll: async (params?: {
    page?: number;
    limit?: number;
    username?: string;
    email?: string;
    isActive?: boolean;
    isBanned?: boolean;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      if (params?.username) queryParams.append('username', params.username);
      if (params?.email) queryParams.append('email', params.email);
      if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params?.isBanned !== undefined) queryParams.append('isBanned', params.isBanned.toString());

      const queryString = queryParams.toString();
      const endpoint = `/api/admin/users${queryString ? `?${queryString}` : ''}`;

      const response = await adminApiRequest(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Create a new user (Admin)
   * POST /api/admin/users
   * @param data - User data
   * @returns Promise with created user
   */
  create: async (data: {
    email: string;
    username: string;
    password: string;
    role?: string;
  }) => {
    try {
      const response = await adminApiRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Get user by ID (Admin)
   * GET /api/admin/users/{id}
   * @param id - User ID
   * @returns Promise with user data
   */
  getById: async (id: string) => {
    try {
      const response = await adminApiRequest(`/api/admin/users/${id}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Delete a user (Admin)
   * DELETE /api/admin/users/{id}
   * @param id - User ID
   * @returns Promise with success message
   */
  delete: async (id: string) => {
    try {
      const response = await adminApiRequest(`/api/admin/users/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Partially update a user (Admin)
   * PATCH /api/admin/users/{id}
   * @param id - User ID
   * @param data - Updated user data
   * @returns Promise with updated user
   */
  update: async (id: string, data: Partial<{
    email: string;
    username: string;
    role: string;
    isBanned: boolean;
  }>) => {
    try {
      const response = await adminApiRequest(`/api/admin/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Ban a user (Admin)
   * PUT /api/admin/users/{id}/ban
   * @param id - User ID
   * @returns Promise with success message
   */
  ban: async (id: string) => {
    try {
      const response = await adminApiRequest(`/api/admin/users/${id}/ban`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Unban a user (Admin)
   * PUT /api/admin/users/{id}/unban
   * @param id - User ID
   * @returns Promise with success message
   */
  unban: async (id: string) => {
    try {
      const response = await adminApiRequest(`/api/admin/users/${id}/unban`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Force-reset a user's password (Admin)
   * PATCH /api/admin/users/{id}/password
   * @param id - User ID
   * @param newPassword - New password
   * @returns Promise with success message
   */
  resetPassword: async (id: string, newPassword: string) => {
    try {
      const response = await adminApiRequest(`/api/admin/users/${id}/password`, {
        method: 'PATCH',
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Make user an admin (Admin)
   * POST /api/admin/users/{userId}/make-admin
   * @param userId - User ID
   * @returns Promise with success message
   */
  makeAdmin: async (userId: string) => {
    try {
      const response = await adminApiRequest(`/api/admin/users/${userId}/make-admin`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },
};

// Admin Tokens API
export const adminTokensAPI = {
  /**
   * Get all active tokens (Admin Only)
   * GET /api/admin/tokens
   * @returns Promise with all active tokens
   */
  getAll: async () => {
    try {
      const response = await adminApiRequest('/api/admin/tokens', {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Revoke a specific token (Admin Only)
   * DELETE /api/admin/tokens/{tokenId}
   * @param tokenId - Token ID
   * @returns Promise with success message
   */
  revoke: async (tokenId: string) => {
    try {
      const response = await adminApiRequest(`/api/admin/tokens/${tokenId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },
};

// Payment API
export interface PaymentGateway {
  name: string;
  displayName: string;
  description: string;
  isActive: boolean;
  supportedCurrencies: string[];
}

export const paymentAPI = {
  /**
   * List available payment gateways
   * GET /api/payment/gateways
   * @returns Promise with array of gateways (name, displayName, description, isActive, supportedCurrencies)
   */
  getGateways: async (): Promise<PaymentGateway[]> => {
    try {
      const response = await paymentApiRequest("/gateways", { method: "GET" });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message || `Failed to fetch gateways: ${response.status}`);
      }
      return response.json();
    } catch (error: any) {
      if (error?.name === "TypeError" && error?.message?.includes("fetch")) {
        throw new Error("Cannot connect to backend. Make sure the backend server is running.");
      }
      if (error instanceof Error) throw error;
      throw new Error(String(error));
    }
  },

  /**
   * Create a payment order for a package
   * POST /api/payment/create-order
   * @param packageId - Package ID
   * @param gateway - "razorpay" | "stripe" (default: razorpay, or NEXT_PUBLIC_PAYMENT_GATEWAY)
   * @returns Promise with order details (Razorpay or Stripe)
   */
  createOrder: async (packageId: string, gateway?: string) => {
    try {
      console.log("🔄 Creating payment order for package:", packageId);
      
      if (!packageId || typeof packageId !== 'string' || packageId.trim() === '') {
        throw new Error('Invalid package ID');
      }

      const gatewayValue = gateway ?? (process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || "razorpay");
      const requestBody = { packageId: packageId.trim(), gateway: gatewayValue };
      console.log("📤 Request body:", requestBody);
      
      const response = await paymentApiRequest('/create-order', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      console.log("📥 Response status:", response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Payment order creation failed:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          requestBody: requestBody,
          url: `${API_PAYMENT}/create-order`,
        });
        
        // Provide more specific error messages based on status code
        let errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`;
        if (Array.isArray(errorMessage)) {
          errorMessage = errorMessage.join(', ');
        }
        
        // Add helpful context based on error
        if (isPaymentBackendMisconfigured()) {
          errorMessage =
            'Payment cannot be processed: the app is pointing to the wrong server. Set NEXT_PUBLIC_API_URL in .env to your main backend URL (e.g. http://localhost:5000 or your deployed backend), not to demo.liquidata.dev. Then restart the app.';
        } else if (response.status === 400) {
          if (errorMessage.includes('package') || errorMessage.includes('Package')) {
            errorMessage = `Package error: ${errorMessage}. Please check if the package exists and is active.`;
          } else if (errorMessage.includes('payment') || errorMessage.includes('gateway')) {
            errorMessage = `Payment gateway error: ${errorMessage}. Please contact support.`;
          } else {
            errorMessage = `Invalid request: ${errorMessage}. Please try again or contact support.`;
          }
        } else if (response.status === 404) {
          errorMessage = "Package not found. Please select a different package.";
        } else if (response.status === 401) {
          errorMessage = "Please sign in to purchase a package.";
        }
        
        throw new Error(errorMessage);
      }

      const orderData = await response.json();
      console.log("✅ Payment order created successfully:", {
        orderId: orderData.orderId,
        amount: orderData.amount,
        currency: orderData.currency,
        hasKeyId: !!orderData.keyId,
      });
      
      // Validate response has required fields
      if (!orderData.orderId) {
        console.error("❌ Response missing orderId:", orderData);
        throw new Error("Invalid response from server: missing orderId");
      }
      if (!orderData.keyId && !orderData.key) {
        console.warn("⚠️ Response missing keyId, using fallback Razorpay key");
      }
      
      return orderData;
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Verify payment after Razorpay popup completes
   * POST /api/payment/verify
   * @param data - Payment verification data
   * @returns Promise with verification result
   */
  verify: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      // Convert to camelCase for backend
      const requestData = {
        razorpayOrderId: data.razorpay_order_id,
        razorpayPaymentId: data.razorpay_payment_id,
        razorpaySignature: data.razorpay_signature,
      };
      const response = await paymentApiRequest('/verify', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Get my payment history
   * GET /api/payment/history
   * @param params - Query parameters (page, limit)
   * @returns Promise with payment history
   */
  getHistory: async (params?: {
    page?: number;
    limit?: number;
  }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const endpoint = `/history${queryString ? `?${queryString}` : ''}`;

      const response = await paymentApiRequest(endpoint, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Create a custom payment order (slider / custom dollar amount)
   * POST /api/payment/create-custom-order
   * @param amount - Dollar amount (integer >= 1)
   * @param gateway - "razorpay" | "stripe" (optional)
   * @returns Promise with order details
   */
  createCustomOrder: async (amount: number, gateway?: string) => {
    try {
      if (!Number.isInteger(amount) || amount < 1) {
        throw new Error('Minimum payment amount is $1');
      }

      const requestBody: { amount: number; gateway?: string } = { amount };
      if (gateway) requestBody.gateway = gateway;

      const response = await paymentApiRequest('/create-custom-order', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMessage = errorData.message || errorData.error || `Server error: ${response.status}`;
        if (Array.isArray(errorMessage)) errorMessage = errorMessage.join(', ');
        throw new Error(errorMessage);
      }

      const orderData = await response.json();
      if (!orderData.orderId) {
        throw new Error('Invalid response from server: missing orderId');
      }
      return orderData;
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) throw error;
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Gateway-agnostic verify payment (works for both Razorpay and Stripe, package and custom orders)
   * POST /api/payment/verify
   * @param data - { gatewayOrderId, gatewayPaymentId, razorpaySignature? }
   */
  verifyGatewayPayment: async (data: {
    gatewayOrderId: string;
    gatewayPaymentId: string;
    razorpaySignature?: string;
  }) => {
    try {
      const response = await paymentApiRequest('/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) throw error;
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },
};

// Model Registry API
export interface RegistryModel {
  modelId: string;
  displayName: string;
  costPerRequest?: number;
  [key: string]: unknown;
}

export interface ModelRegistryResponse {
  llm?: RegistryModel[];
  image?: RegistryModel[];
  video?: RegistryModel[];
  image_to_image?: RegistryModel[];
  audio?: RegistryModel[];
  music?: RegistryModel[];
}

export const modelRegistryAPI = {
  /**
   * List all available AI models (grouped by category)
   * GET /api/model-registry/models
   */
  getModels: async (): Promise<ModelRegistryResponse> => {
    const response = await mainApiRequest("/api/model-registry/models", { method: "GET" });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to fetch models");
    }
    return response.json();
  },
};

// Gallery API
export type GalleryContentType = "image" | "video" | "image_to_image" | "llm" | "audio";

export interface GalleryItem {
  _id: string;
  userId?: string;
  contentType: GalleryContentType;
  prompt?: string;
  url?: string;
  outputUrl?: string;
  thumbnailUrl?: string;
  modelId?: string;
  modelName?: string;
  rating?: number;
  isPrivate?: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
  username?: string;
  userAvatar?: string;
}

export interface GalleryPaginatedResponse {
  items: GalleryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GalleryStats {
  byContentType?: Record<string, number>;
  totalItems?: number;
  averageRating?: number;
}

export const galleryAPI = {
  /**
   * Get my gallery (authenticated user)
   * GET /api/gallery/me
   */
  getMyGallery: async (params?: {
    contentType?: GalleryContentType;
    minRating?: number;
    modelId?: string;
    isPrivate?: boolean;
    fromDate?: string;
    toDate?: string;
    sortBy?: "createdAt" | "rating";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<GalleryPaginatedResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.contentType) searchParams.set("contentType", params.contentType);
    if (params?.minRating !== undefined) searchParams.set("minRating", String(params.minRating));
    if (params?.modelId) searchParams.set("modelId", params.modelId);
    if (params?.isPrivate !== undefined) searchParams.set("isPrivate", String(params.isPrivate));
    if (params?.fromDate) searchParams.set("fromDate", params.fromDate);
    if (params?.toDate) searchParams.set("toDate", params.toDate);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params?.page !== undefined) searchParams.set("page", String(params.page));
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    const endpoint = `/api/gallery/me${query ? `?${query}` : ""}`;
    const response = await mainApiRequest(endpoint, { method: "GET" });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      const msg = (err as { message?: string }).message || `Failed to fetch gallery: ${response.status}`;
      if (response.status === 401) {
        throw new Error("Please sign in to view your gallery");
      }
      throw new Error(msg);
    }
    return response.json();
  },

  /**
   * Get my gallery statistics
   * GET /api/gallery/me/stats
   */
  getMyStats: async (): Promise<GalleryStats> => {
    const response = await mainApiRequest("/api/gallery/me/stats", { method: "GET" });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || `Failed to fetch stats: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Browse public gallery (no auth needed)
   * GET /api/gallery/public
   */
  getPublicGallery: async (params?: {
    contentType?: GalleryContentType;
    minRating?: number;
    modelId?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: "createdAt" | "rating";
    sortOrder?: "asc" | "desc";
    page?: number;
    limit?: number;
  }): Promise<GalleryPaginatedResponse> => {
    const searchParams = new URLSearchParams();
    if (params?.contentType) searchParams.set("contentType", params.contentType);
    if (params?.minRating !== undefined) searchParams.set("minRating", String(params.minRating));
    if (params?.modelId) searchParams.set("modelId", params.modelId);
    if (params?.fromDate) searchParams.set("fromDate", params.fromDate);
    if (params?.toDate) searchParams.set("toDate", params.toDate);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params?.page !== undefined) searchParams.set("page", String(params.page));
    if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

    const query = searchParams.toString();
    const endpoint = `/api/gallery/public${query ? `?${query}` : ""}`;
    const response = await mainApiRequest(endpoint, { method: "GET" });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || `Failed to fetch public gallery: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Get a single gallery item by ID
   * GET /api/gallery/{id}
   */
  getById: async (id: string): Promise<GalleryItem> => {
    const response = await mainApiRequest(`/api/gallery/${id}`, { method: "GET" });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || `Failed to fetch item: ${response.status}`);
    }
    return response.json();
  },

  /**
   * Create a gallery item (after upload to S3)
   * POST /api/gallery
   */
  createGalleryItem: async (body: {
    contentType: GalleryContentType;
    url: string;
    thumbnailUrl?: string;
    storageKey?: string;
    prompt?: string;
    modelId?: string;
    isPrivate?: boolean;
    fileSize?: number;
    mimeType?: string;
    metadata?: Record<string, unknown>;
  }): Promise<GalleryItem> => {
    const response = await mainApiRequest("/api/gallery", {
      method: "POST",
      body: JSON.stringify({
        contentType: body.contentType,
        url: body.url,
        thumbnailUrl: body.thumbnailUrl ?? body.url,
        storageKey: body.storageKey ?? body.url.replace(/^https?:\/\/[^/]+\//, ""),
        prompt: body.prompt,
        modelId: body.modelId,
        isPrivate: body.isPrivate ?? false,
        fileSize: body.fileSize,
        mimeType: body.mimeType ?? (body.contentType === "video" ? "video/mp4" : "image/png"),
        metadata: body.metadata ?? {},
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to create gallery item");
    }
    return response.json();
  },

  /**
   * Update a gallery item (e.g. toggle isPrivate)
   * PATCH /api/gallery/{id}
   */
  updateGalleryItem: async (id: string, data: { isPrivate?: boolean; prompt?: string }): Promise<GalleryItem> => {
    const response = await mainApiRequest(`/api/gallery/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message || "Failed to update gallery item");
    }
    return response.json();
  },
};

// Provider API Base URL - Using Liquidata demo server
// Provider API - For model listing and chat completions
export const providerAPI = {
  /**
   * Get all available models on cloud
   * GET /v1/provider/list
   * @returns Promise with list of available models
   */
  getModels: async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      };

      let response = await fetch(`${API_PROVIDER}/v1/provider/list`, {
        method: 'GET',
        headers,
        mode: 'cors',
        credentials: 'omit',
      });

      // If 401, try with authentication
      if (response.status === 401) {
        const token = getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          response = await fetch(`${API_PROVIDER}/v1/provider/list`, {
            method: 'GET',
            headers,
            mode: 'cors',
            credentials: 'omit',
          });
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          Array.isArray(errorData.message) 
            ? errorData.message.join(', ') 
            : errorData.message || errorData.error || `Server error: ${response.status}`
        );
      }

      return response.json();
    } catch (error: any) {
      if (error?.name === 'TypeError' && (error?.message?.includes('fetch') || error?.message?.includes('CORS'))) {
        throw new Error('CORS error: Cannot connect to API. The API server may not allow cross-origin requests from this domain.');
      }
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },

  /**
   * Get chat completion from a model
   * POST /v1/provider/chatcompletion
   * @param data - Request payload with prompt and model
   * @returns Promise with chat completion response
   */
  chatCompletion: async (data: {
    prompt: string;
    model: string;
  }) => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
      };

      let response = await fetch(`${API_PROVIDER}/v1/provider/chatcompletion`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt: data.prompt,
          model: data.model,
        }),
        mode: 'cors',
        credentials: 'omit',
      });

      // If 401, try with authentication
      if (response.status === 401) {
        const token = getAuthToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          response = await fetch(`${API_PROVIDER}/v1/provider/chatcompletion`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              prompt: data.prompt,
              model: data.model,
            }),
            mode: 'cors',
            credentials: 'omit',
          });
        }
      }

      // Accept both 200 and 201 status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          Array.isArray(errorData.message) 
            ? errorData.message.join(', ') 
            : errorData.message || errorData.error || `Server error: ${response.status}`
        );
      }

      // Check content type - API might return text/plain or JSON
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        return response.json();
      } else {
        // Plain text response - return as string
        const text = await response.text();
        return text;
      }
    } catch (error: any) {
      if (error?.name === 'TypeError' && (error?.message?.includes('fetch') || error?.message?.includes('CORS'))) {
        throw new Error('CORS error: Cannot connect to API. The API server may not allow cross-origin requests from this domain.');
      }
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        throw new Error('Cannot connect to backend. Make sure the backend server is running.');
      }
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(error?.message || error?.toString() || 'An unexpected error occurred');
    }
  },
};

/** Payment API request - ALWAYS targets /api/payment (no /api/main prefix) */
const paymentApiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_PAYMENT}${path}`; // e.g. /api/payment/create-custom-order
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? (typeof options.body === "string" ? options.body : JSON.stringify(options.body)) : undefined;
  let data: unknown = undefined;
  if (body?.trim()) {
    try {
      data = JSON.parse(body);
    } catch {
      data = body;
    }
  }
  try {
    const res = await apiClient.request({
      url,
      method: method as "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
      data,
    });
    return toResponse(res.data, res.status, res.statusText);
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status: number; statusText: string; data: unknown } };
    if (axiosErr?.response) {
      return toResponse(axiosErr.response.data, axiosErr.response.status, axiosErr.response.statusText);
    }
    throw err;
  }
};