import { NextRequest, NextResponse } from "next/server";

// Use VITE_API_URL as API base for custom-agent (same as rest of app)
const BASE = process.env.VITE_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://api.akobot.ai";

async function proxy(method: string, req: NextRequest, pathSegments: string[]) {
  const pathStr = pathSegments.length ? pathSegments.join("/") : "";
  const url = `${BASE.replace(/\/$/, "")}/custom-agent${pathStr ? `/${pathStr}` : ""}${req.nextUrl.search}`;

  const headers: Record<string, string> = {};
  ["authorization", "content-type", "accept", "cookie"].forEach((k) => {
    const v = req.headers.get(k);
    if (v) headers[k] = v;
  });
  // Optional: API key for custom-agent (if backend expects X-API-Key instead of Bearer)
  const apiKey = process.env.CUSTOM_AGENT_API_KEY;
  if (apiKey) headers["X-API-Key"] = apiKey;
  // Forward client identity so backend device/session validation sees the same device as login
  headers["x-forwarded-for"] = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
  const ua = req.headers.get("user-agent");
  if (ua) headers["user-agent"] = ua;
  const origin = req.headers.get("origin");
  if (origin) headers["origin"] = origin;
  const host = req.headers.get("host");
  if (host) headers["x-forwarded-host"] = host;
  headers["x-forwarded-proto"] = req.nextUrl.protocol.replace(":", "") || "https";

  let body: ArrayBuffer | undefined;
  if (method !== "GET" && method !== "HEAD") {
    const b = await req.arrayBuffer();
    if (b.byteLength > 0) {
      body = b;
      headers["content-length"] = String(b.byteLength);
    }
  }

  const res = await fetch(url, {
    method,
    headers: Object.keys(headers).length ? headers : undefined,
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(60_000),
  });

  const contentType = res.headers.get("content-type") || "";

  // Parse backend error for better UX (must read body for non-ok)
  if (!res.ok) {
    const resBody = await res.arrayBuffer();
    let errMsg = res.statusText;
    try {
      if (contentType.includes("application/json")) {
        const parsed = JSON.parse(new TextDecoder().decode(resBody)) as { message?: string; error?: string };
        errMsg = parsed.message || parsed.error || errMsg;
      }
    } catch {
      // ignore
    }
    if (res.status === 500) {
      errMsg = errMsg || "Backend returned 500. Check backend logs. Ensure VITE_API_URL in .env points to your API.";
    }
    return NextResponse.json(
      { statusCode: res.status, message: errMsg },
      { status: res.status }
    );
  }

  // Stream through for SSE so the client receives chunks as they arrive
  if (res.body && contentType.includes("text/event-stream")) {
    const out = new Headers();
    out.set("content-type", res.headers.get("content-type") || "text/event-stream");
    out.set("cache-control", "no-cache");
    out.set("connection", "keep-alive");
    return new NextResponse(res.body, { status: res.status, headers: out });
  }

  const resBody = await res.arrayBuffer();
  const out = new Headers();
  res.headers.forEach((v, k) => {
    if (["content-type", "content-length"].includes(k.toLowerCase())) out.set(k, v);
  });
  return new NextResponse(resBody, { status: res.status, headers: out });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return proxy("GET", req, path).catch((e) =>
    NextResponse.json(
      { statusCode: 502, message: "Backend unavailable", details: String(e) },
      { status: 502 }
    )
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return proxy("POST", req, path).catch((e) =>
    NextResponse.json(
      { statusCode: 502, message: "Backend unavailable", details: String(e) },
      { status: 502 }
    )
  );
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return proxy("PATCH", req, path).catch((e) =>
    NextResponse.json(
      { statusCode: 502, message: "Backend unavailable", details: String(e) },
      { status: 502 }
    )
  );
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return proxy("PUT", req, path).catch((e) =>
    NextResponse.json(
      { statusCode: 502, message: "Backend unavailable", details: String(e) },
      { status: 502 }
    )
  );
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await params;
  return proxy("DELETE", req, path).catch((e) =>
    NextResponse.json(
      { statusCode: 502, message: "Backend unavailable", details: String(e) },
      { status: 502 }
    )
  );
}
