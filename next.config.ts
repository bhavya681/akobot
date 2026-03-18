import type { NextConfig } from "next";

// Use VITE_API_URL or NEXT_PUBLIC_API_URL for all backend API calls
const API = process.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://api.akobot.ai";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: API,
    NEXT_PUBLIC_PAYMENT_GATEWAY: process.env.NEXT_PUBLIC_PAYMENT_GATEWAY || "razorpay",
  },
  async rewrites() {
    return [
      { source: "/uploads/:path*", destination: `${API}/uploads/:path*` },
      { source: "/api/auth/:path*", destination: `${API}/auth/:path*` },
      { source: "/api/admin/:path*", destination: `${API}/api/admin/:path*` },
      { source: "/api/gallery/:path*", destination: `${API}/api/gallery/:path*` },
      // Custom agent API - POST/GET /custom-agent, /custom-agent/:id/chat, etc.
      { source: "/api/custom-agent/:path*", destination: `${API}/custom-agent/:path*` },
      { source: "/api/custom-agent", destination: `${API}/custom-agent` },
      // Main API proxy
      { source: "/api/main/:path*", destination: `${API}/:path*` },
      { source: "/api/packages", destination: `${API}/api/packages` },
      { source: "/api/packages/:path*", destination: `${API}/api/packages/:path*` },
      { source: "/api/payment/:path*", destination: `${API}/api/payment/:path*` },
      { source: "/api/apimodule/v1/:path*", destination: `${API}/apimodule/v1/:path*` },
      { source: "/api/apimodule/:path*", destination: `${API}/apimodule/:path*` },
      { source: "/api/provider/:path*", destination: `${API}/:path*` },
    ];
  },
};

export default nextConfig;
