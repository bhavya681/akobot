"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, Shield, Zap, HeadphonesIcon, Loader2, CreditCard, IndianRupee, Coins, ArrowRightLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { packageAPI, paymentAPI, authAPI, isPaymentBackendMisconfigured, type PaymentGateway } from "@/lib/api";
import { PaymentGatewayDialog } from "@/components/PaymentGatewayDialog";
import { toast } from "sonner";
import { useCallback } from "react";

interface Package {
  _id: string;
  name: string;
  description?: string;
  includedCredits: number;
  actualPrice?: number;
  currentPrice: number;
  offer?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const freeFeatures = [
  "1 Basic AI Agent with image tool integration",
  "20 Prompts per day",
  "3 Images per day",
  "Watermarked outputs",
  "Standard support",
  "Cloud storage",
];

const enterpriseFeatures = [
  "Unlimited AI Agents",
  "Unlimited integrations",
  "Custom API access",
  "Multi-user team management",
  "Dedicated support",
  "SLA uptime",
  "Dedicated S3 storage",
];

const CREDITS_PER_DOLLAR = 1_000_000;
const INR_PER_USD = 83;
const CUSTOM_MIN_AMOUNT = 100;   // ₹100
const CUSTOM_MAX_AMOUNT = 10000; // ₹10,000
const CUSTOM_PRESETS = [500, 1000, 2500, 5000, 10000];

/**
 * PricingPage Component
 * 
 * IMPORTANT: This component ONLY displays packages fetched from the backend API.
 * NO static packages or hardcoded pricing plans are used.
 * 
 * Data Flow:
 * 1. Fetches packages from GET /api/packages (public endpoint)
 * 2. Filters for isActive = true packages
 * 3. Sorts by sortOrder (ascending)
 * 4. Displays packages with offer badges, prices, and credits
 * 5. Handles Razorpay payment flow when user clicks "Buy Now"
 */
const PricingPage = () => {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [processing, setProcessing] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const [customAmount, setCustomAmount] = useState(500); // INR
  const [customGateways, setCustomGateways] = useState<PaymentGateway[]>([]);
  const [selectedCustomGateway, setSelectedCustomGateway] = useState("");
  const [customGatewaysLoading, setCustomGatewaysLoading] = useState(false);
  const [customProcessing, setCustomProcessing] = useState(false);
  const [customPaymentSuccess, setCustomPaymentSuccess] = useState<{ credits: number; amount: number } | null>(null);

  // Load Razorpay script
  useEffect(() => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    
    script.onload = () => {
      console.log("Razorpay script loaded successfully");
      setRazorpayLoaded(true);
    };
    
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      toast.error("Failed to load payment gateway. Please refresh the page.");
    };
    
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);


  // Fetch packages from backend
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching packages from backend API...");
      
      // Fetch packages from backend API - ONLY dynamic backend data, NO static packages
      const data = await packageAPI.getAll();
      console.log("✅ Packages API response:", data);
      
      // Handle response - API should return array of packages
      let packagesList: Package[] = [];
      if (Array.isArray(data)) {
        packagesList = data;
      } else if (data && typeof data === 'object') {
        packagesList = (data as any).packages || (data as any).data || (data as any).items || [];
        if (!Array.isArray(packagesList) && (data as any)._id) {
          packagesList = [data as Package];
        }
      }
      
      // Filter and validate packages from backend (only show isActive = true)
      const validPackages = packagesList
        .filter((pkg: any) => {
          return pkg && 
                 pkg._id && 
                 pkg.name && 
                 typeof pkg.currentPrice === 'number' && pkg.currentPrice >= 0 &&
                 typeof pkg.includedCredits === 'number' && pkg.includedCredits >= 1 &&
                 (pkg.isActive === undefined || pkg.isActive === true);
        })
        .sort((a: Package, b: Package) => {
          // Sort by sortOrder (ascending) as per API spec, then by price
          if (a.sortOrder !== undefined && b.sortOrder !== undefined) {
            return a.sortOrder - b.sortOrder;
          }
          if (a.sortOrder !== undefined) return -1;
          if (b.sortOrder !== undefined) return 1;
          return (a.currentPrice || 0) - (b.currentPrice || 0);
        });
      
      console.log(`✅ Valid packages after filtering: ${validPackages.length}`);
      setPackages(validPackages);
    } catch (error: any) {
      console.error("❌ Error fetching packages:", error);
      toast.error(`Failed to load packages: ${error.message || 'Unknown error'}`);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setCustomGatewaysLoading(true);
        const data = await paymentAPI.getGateways();
        const active = data.filter((g) => g.isActive);
        setCustomGateways(active);
        const stripe = active.find((g) => g.name === "stripe");
        setSelectedCustomGateway(stripe ? "stripe" : active[0]?.name ?? "");
      } catch {
        toast.error("Failed to load payment gateways");
      } finally {
        setCustomGatewaysLoading(false);
      }
    })();
  }, []);

  const verifyCustomPayment = useCallback(
    async (payload: {
      gatewayOrderId: string;
      gatewayPaymentId: string;
      razorpaySignature?: string;
    }) => {
      try {
        const result = await paymentAPI.verifyGatewayPayment(payload);
        if (result.status === "paid") {
          setCustomPaymentSuccess({ credits: result.credits, amount: customAmount });
          toast.success("Payment successful! Credits added to your wallet.");
        } else {
          toast.error(result.message || "Payment verification failed");
        }
      } catch (err: unknown) {
        toast.error((err as { message?: string })?.message || "Payment verification failed");
      }
    },
    [customAmount],
  );

  const openCustomRazorpay = useCallback(
    (data: { keyId: string; amount: number; currency: string; orderId: string; amountInUsd: number; credits?: number }) => {
      if (!window.Razorpay) {
        toast.error("Payment gateway not loaded. Please refresh the page.");
        setCustomProcessing(false);
        return;
      }
      const currentUser = authAPI.getCurrentUser();
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "AEKO.AI",
        description: `Custom Top-up — $${data.amountInUsd} (${(data.credits ?? 0).toLocaleString()} credits)`,
        prefill: {
          name: currentUser?.username || currentUser?.name || "",
          email: currentUser?.email || "",
        },
        theme: { color: "#7c3aed" },
        handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          await verifyCustomPayment({
            gatewayOrderId: response.razorpay_order_id,
            gatewayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          setCustomProcessing(false);
        },
        modal: { ondismiss: () => setCustomProcessing(false) },
      });
      rzp.on("payment.failed", (resp: { error?: { description?: string } }) => {
        toast.error(resp.error?.description || "Payment failed");
        setCustomProcessing(false);
      });
      rzp.open();
    },
    [verifyCustomPayment],
  );

  const openCustomStripe = useCallback(
    async (data: { checkoutUrl?: string; clientSecret?: string }) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      if (data.clientSecret) {
        const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
        if (!stripeKey) {
          toast.error("Stripe is not configured. Please contact support.");
          setCustomProcessing(false);
          return;
        }
        try {
          const stripe = (window as unknown as { Stripe?: (key: string) => unknown }).Stripe?.(stripeKey);
          if (!stripe) {
            toast.error("Stripe.js failed to load. Please refresh.");
            setCustomProcessing(false);
            return;
          }
          const { error, paymentIntent } = await (stripe as { confirmPayment: (opts: unknown) => Promise<{ error?: { message?: string }; paymentIntent?: { id: string; status: string } }> }).confirmPayment({
            clientSecret: data.clientSecret,
            confirmParams: { return_url: `${typeof window !== "undefined" ? window.location.origin : ""}/pricing?success=true` },
            redirect: "if_required",
          });
          if (error) {
            toast.error(error.message || "Payment failed");
            setCustomProcessing(false);
            return;
          }
          if (paymentIntent?.status === "succeeded") {
            await verifyCustomPayment({
              gatewayOrderId: paymentIntent.id,
              gatewayPaymentId: paymentIntent.id,
            });
          }
        } catch (err: unknown) {
          toast.error((err as { message?: string })?.message || "Stripe payment failed");
        } finally {
          setCustomProcessing(false);
        }
        return;
      }
      toast.error("Stripe checkout is not available. Please try Razorpay.");
      setCustomProcessing(false);
    },
    [verifyCustomPayment],
  );

  const handleCustomPay = async () => {
    if (!authAPI.isAuthenticated()) {
      toast.error("Please sign in first");
      router.push(`/auth/sign-in?returnTo=${encodeURIComponent("/pricing")}`);
      return;
    }
    if (customAmount < CUSTOM_MIN_AMOUNT || customAmount > CUSTOM_MAX_AMOUNT) {
      toast.error(`Amount must be between ₹${CUSTOM_MIN_AMOUNT.toLocaleString("en-IN")} and ₹${CUSTOM_MAX_AMOUNT.toLocaleString("en-IN")}`);
      return;
    }
    const amountUsd = Math.max(1, Math.round(customAmount / INR_PER_USD));
    setCustomProcessing(true);
    try {
      const data = await paymentAPI.createCustomOrder(amountUsd, selectedCustomGateway || undefined) as Record<string, unknown>;
      if (selectedCustomGateway === "razorpay") {
        openCustomRazorpay(data as { keyId: string; amount: number; currency: string; orderId: string; amountInUsd: number; credits?: number });
      } else {
        await openCustomStripe(data as { checkoutUrl?: string; clientSecret?: string });
      }
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Failed to create order. Please try again.");
      setCustomProcessing(false);
    }
  };

  const proceedWithPayment = async (pkg: Package, gateway: PaymentGateway) => {
    if (!pkg?._id || !gateway?.name) return;
    try {
      setProcessing(pkg._id);
      console.log("🔄 Creating order for package:", pkg._id, "gateway:", gateway.name);
      console.log("📦 Package details:", {
        _id: pkg._id,
        name: pkg.name,
        currentPrice: pkg.currentPrice,
        includedCredits: pkg.includedCredits,
      });
      
      // Validate package before creating order
      if (!pkg._id || typeof pkg._id !== 'string' || pkg._id.trim() === '') {
        toast.error("Invalid package. Please try again.");
        setProcessing(null);
        return;
      }
      
      const orderData = await paymentAPI.createOrder(pkg._id, gateway.name);
      console.log("✅ Order data received:", orderData);

      // Validate order response
      if (!orderData || !orderData.orderId) {
        console.error("❌ Invalid order data:", orderData);
        toast.error("Invalid order data received from server. Missing orderId.");
        setProcessing(null);
        return;
      }

      if (gateway.name === "stripe" && (orderData as any).checkoutUrl) {
        window.location.href = (orderData as any).checkoutUrl;
        return;
      }

      if (gateway.name !== "razorpay") {
        toast.error("This payment gateway is not yet supported.");
        setProcessing(null);
        return;
      }
      
      // Warn if keyId is missing (will use fallback)
      if (!orderData.keyId) {
        console.warn("⚠️ Response missing keyId, using fallback Razorpay key");
      }

      // Check if Razorpay is loaded
      if (!window.Razorpay || !razorpayLoaded) {
        toast.error("Payment gateway is still loading. Please wait a moment and try again.");
        setProcessing(null);
        return;
      }

      // Use Razorpay key from backend response, with fallback
      // The fallback key should match your Razorpay account
      const razorpayKey = orderData.keyId || orderData.key || "rzp_live_SHVupFMQeg2X3E=4glMkH0SBzhBi3u0VsvcxB5K";
      
      if (!razorpayKey) {
        toast.error("Payment gateway key not configured. Please contact support.");
        setProcessing(null);
        return;
      }
      
      console.log("Using Razorpay key:", razorpayKey.substring(0, 10) + "...");
      
      // Get current user info for prefill
      const currentUser = authAPI.getCurrentUser();
      
      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        order_id: orderData.orderId,
        name: "AEKO.AI",
        description: `Purchase ${pkg.name}`,
        image: "/logo.webp",
        handler: async (response: any) => {
          try {
            console.log("Payment response:", response);
            await paymentAPI.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful! Credits have been added to your wallet.");
            setProcessing(null);
            // Navigate to dashboard after successful payment
            setTimeout(() => {
              router.push("/dashboard");
            }, 1500);
          } catch (error: any) {
            console.error("Payment verification error:", error);
            toast.error(error.message || "Payment verification failed");
            setProcessing(null);
          }
        },
        prefill: {
          name: currentUser?.username || currentUser?.name || "",
          email: currentUser?.email || "",
          contact: currentUser?.phone || "",
        },
        notes: {
          packageId: pkg._id,
          packageName: pkg.name,
        },
        theme: {
          color: "#7c3aed",
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal dismissed");
            setProcessing(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response);
        toast.error(response.error?.description || "Payment failed");
        setProcessing(null);
      });
      rzp.open();
    } catch (error: any) {
      console.error("❌ Payment initiation error:", error);
      console.error("Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
      });
      
      // Use server/API message when it explains the fix (e.g. VITE_API_URL misconfiguration)
      let errorMessage = "Failed to initiate payment. Please try again.";
      if (error.message?.includes("VITE_API_URL") || error.message?.includes("wrong server")) {
        errorMessage = error.message;
      } else if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        errorMessage = "Please sign in to purchase a package";
        router.push(`/auth/sign-in?returnTo=${encodeURIComponent("/pricing")}`);
      } else if (error.message?.includes("404")) {
        errorMessage = "Package not found. Please try another package.";
      } else if (error.message?.includes("400") || error.message?.includes("Bad Request")) {
        errorMessage = error.message || "Invalid package or payment configuration. Please contact support.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setProcessing(null);
    }
  };

  const handleBuyPackage = (pkg: Package) => {
    if (!pkg || !pkg._id) {
      toast.error("Package not available");
      return;
    }
    if (!authAPI.isAuthenticated()) {
      toast.error("Please sign in to purchase a package");
      router.push(`/auth/sign-in?returnTo=${encodeURIComponent("/pricing")}`);
      return;
    }
    setSelectedPackage(pkg);
    setGatewayDialogOpen(true);
  };

  const handleGatewaySelect = (gateway: PaymentGateway) => {
    if (selectedPackage) {
      const pkg = selectedPackage;
      setSelectedPackage(null);
      setGatewayDialogOpen(false);
      proceedWithPayment(pkg, gateway);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen overflow-x-hidden w-full relative bg-background">
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 dark:bg-none" />
        <div className="fixed inset-0 pointer-events-none z-0 hidden dark:block" style={{
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 30%, #2d1b4e 55%, #3b2a5c 75%, #4c2d5e 90%, #5c3a5a 100%)",
        }} />
        <div className="relative z-10 flex flex-col min-h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading packages...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden w-full relative bg-background">
      {/* Light mode: soft gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 dark:bg-none" />
      {/* Dark mode: deep indigo → violet → soft rose */}
      <div
        className="fixed inset-0 pointer-events-none z-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 30%, #2d1b4e 55%, #3b2a5c 75%, #4c2d5e 90%, #5c3a5a 100%)",
        }}
      />
      {/* Subtle grid overlay - light mode */}
      <div
        className="fixed inset-0 pointer-events-none z-0 dark:hidden opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />
      {/* Subtle grid overlay - dark mode */}
      <div
        className="fixed inset-0 pointer-events-none z-0 hidden dark:block opacity-[0.07]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {isPaymentBackendMisconfigured() && (
          <div className="bg-amber-500/20 border border-amber-400/50 text-amber-900 dark:text-amber-100 px-4 py-3 text-center text-sm">
            Payment needs your main backend. Set <code className="bg-amber-500/20 dark:bg-black/30 px-1 rounded">VITE_MAIN_API_URL</code> in <code className="bg-amber-500/20 dark:bg-black/30 px-1 rounded">.env</code> to your backend URL (e.g. <code className="bg-amber-500/20 dark:bg-black/30 px-1 rounded">http://localhost:5000</code>). Keep <code className="bg-amber-500/20 dark:bg-black/30 px-1 rounded">VITE_API_URL</code> for chat if needed. Restart the app after changing.
          </div>
        )}

        <section className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-5xl">
            {/* Heading + Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground dark:text-white mb-2 tracking-tight">
                Plans & Pricing
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mb-5 max-w-md mx-auto">
                Choose the right plan for your team. Upgrade or downgrade anytime.
              </p>
              <div className="inline-flex items-center rounded-full bg-muted/80 dark:bg-white/10 backdrop-blur-sm border border-border dark:border-violet-400/20 p-0.5 mb-4">
                <button
                  type="button"
                  onClick={() => setBillingPeriod("monthly")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    billingPeriod === "monthly"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground dark:text-violet-200/80 hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod("yearly")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    billingPeriod === "yearly"
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground dark:text-violet-200/80 hover:text-foreground dark:hover:text-white"
                  }`}
                >
                  Yearly
                </button>
              </div>
            </motion.div>

            {/* Custom Top-Up selector – placed after heading for better alignment */}
            <div id="custom-topup" className="mb-10 sm:mb-12">
              {customGatewaysLoading ? (
                <div className="max-w-lg mx-auto rounded-2xl p-8 bg-card dark:bg-black border border-border dark:border-violet-400/20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">Loading payment options…</p>
                </div>
              ) : customPaymentSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-md mx-auto rounded-2xl p-8 bg-card dark:bg-black border border-border dark:border-violet-400/20 shadow-xl text-center"
                >
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground dark:text-white mb-2">Payment Successful!</h2>
                  <p className="text-muted-foreground text-sm mb-6">
                    <span className="font-semibold text-foreground dark:text-violet-200">
                      {customPaymentSuccess.credits.toLocaleString()}
                    </span>{" "}
                    credits have been added to your wallet.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCustomPaymentSuccess(null);
                      setCustomAmount(500);
                    }}
                    className="w-full"
                  >
                    Top Up Again
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-3xl mx-auto rounded-2xl p-6 sm:p-8 bg-card dark:bg-black border border-border dark:border-violet-400/20 shadow-xl"
                >
                  <div className="flex items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
                        <Coins className="w-6 h-6 text-violet-400" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground dark:text-white">Custom Top-Up</h2>
                        <p className="text-sm text-muted-foreground">Choose any amount and pay in ₹ (INR)</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-extrabold text-foreground dark:text-white tabular-nums">
                        ₹{customAmount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        ≈{" "}
                        <span className="font-semibold text-foreground dark:text-violet-200">
                          {Math.round((customAmount / INR_PER_USD) * CREDITS_PER_DOLLAR).toLocaleString("en-IN")}
                        </span>{" "}
                        credits
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 px-1">
                    <div className="relative pt-6">
                      <div className="pointer-events-none absolute -top-1 left-0 w-full" aria-hidden>
                        <div
                          className="absolute -translate-x-1/2 -top-6 select-none rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-rose-500"
                          style={{ left: `${((customAmount - CUSTOM_MIN_AMOUNT) / (CUSTOM_MAX_AMOUNT - CUSTOM_MIN_AMOUNT)) * 100}%` }}
                        >
                          {Math.round((customAmount / INR_PER_USD) * CREDITS_PER_DOLLAR).toLocaleString("en-IN")} credits
                        </div>
                      </div>
                      <Slider
                        min={CUSTOM_MIN_AMOUNT}
                        max={CUSTOM_MAX_AMOUNT}
                        step={100}
                        value={[customAmount]}
                        onValueChange={([v]) => setCustomAmount(v)}
                        className="w-full"
                      />
                    </div>
                    <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                      <span>₹{CUSTOM_MIN_AMOUNT.toLocaleString("en-IN")}</span>
                      <span>₹{CUSTOM_MAX_AMOUNT.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {CUSTOM_PRESETS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setCustomAmount(p)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                          customAmount === p
                            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                            : "bg-muted/60 dark:bg-white/5 text-muted-foreground dark:text-violet-200/80 border-border dark:border-violet-400/20 hover:bg-muted dark:hover:bg-white/10"
                        }`}
                      >
                        ₹{p >= 1000 ? (p % 1000 === 0 ? p / 1000 + "K" : (p / 1000).toFixed(1) + "K") : p}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customGateways.length > 1 && (
                      <div>
                        <label className="block text-sm font-medium text-foreground dark:text-violet-100 mb-2">Payment Method</label>
                        <div className="grid grid-cols-2 gap-3">
                          {customGateways.map((gw) => (
                            <button
                              key={gw.name}
                              type="button"
                              onClick={() => setSelectedCustomGateway(gw.name)}
                              className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all text-sm ${
                                selectedCustomGateway === gw.name
                                  ? "border-primary dark:border-violet-400 bg-primary/10 dark:bg-violet-500/15 text-foreground dark:text-white ring-2 ring-primary/30 dark:ring-violet-400/30"
                                  : "border-border dark:border-violet-400/15 bg-card dark:bg-white/5 text-muted-foreground hover:bg-muted dark:hover:bg-white/10"
                              }`}
                            >
                              <CreditCard className="w-5 h-5" />
                              <span className="font-medium">{gw.displayName}</span>
                              {gw.supportedCurrencies?.length > 0 && (
                                <span className="text-xs text-muted-foreground">{gw.supportedCurrencies.join(", ")}</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-muted/50 dark:bg-white/5 border border-border dark:border-violet-400/10 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <IndianRupee className="w-4 h-4" /> Amount
                        </span>
                        <span className="font-semibold text-foreground dark:text-white">₹{customAmount.toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Coins className="w-4 h-4" /> Credits (est.)
                        </span>
                        <span className="font-semibold text-foreground dark:text-white">
                          {Math.round((customAmount / INR_PER_USD) * CREDITS_PER_DOLLAR).toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <ArrowRightLeft className="w-4 h-4" /> Gateway
                        </span>
                        <span className="font-medium text-foreground dark:text-white capitalize">
                          {customGateways.find((g) => g.name === selectedCustomGateway)?.displayName || selectedCustomGateway}
                        </span>
                      </div>
                    </div>
                  </div>

                  {customGateways.length === 0 && !customGatewaysLoading && (
                    <div className="mt-5 flex items-start gap-2 rounded-xl border border-amber-400/50 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>No payment gateways available right now. Please try again later or contact support.</span>
                    </div>
                  )}

                  <div className="mt-6">
                    <Button
                      onClick={handleCustomPay}
                      disabled={customProcessing || customGateways.length === 0 || !selectedCustomGateway || customGatewaysLoading}
                      className="w-full h-12 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-600 text-white font-semibold hover:opacity-95 shadow-lg shadow-violet-500/25 text-base disabled:opacity-50"
                    >
                      {customProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing…
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Buy Now — ₹{customAmount.toLocaleString("en-IN")}
                        </>
                      )}
                    </Button>
                    <p className="mt-4 text-xs text-center text-muted-foreground">
                      {selectedCustomGateway === "razorpay"
                        ? "You will be charged in INR. Secured by Razorpay."
                        : "Amount will be converted to USD at current rate. Secured by Stripe."}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* List packages: Free + each package (Buy → Razorpay) + Enterprise */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch">
              {/* Left: Free Plan */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="relative rounded-2xl p-5 sm:p-6 flex flex-col bg-card dark:bg-black border border-border dark:border-violet-400/15 hover:border-primary/30 dark:hover:border-violet-400/25 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-violet-500/10 transition-all"
              >
                <h2 className="text-lg font-bold text-foreground dark:text-white mb-1">Free</h2>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-foreground dark:text-white">₹0</span>
                  <span className="text-sm text-muted-foreground">/ month</span>
                </div>
                <Button
                  onClick={() => router.push("/auth/sign-in")}
                  variant="secondary"
                  className="w-full rounded-xl h-10 bg-primary/10 dark:bg-violet-500/20 hover:bg-primary/20 dark:hover:bg-violet-500/30 text-foreground dark:text-violet-100 border border-border dark:border-violet-400/25 mb-4 text-sm font-medium"
                >
                  Try Now
                </Button>
                <ul className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground dark:text-violet-100/90">
                      <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Dynamic packages: click Buy → open Razorpay */}
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl p-6 flex flex-col items-center justify-center bg-card dark:bg-black border border-border dark:border-violet-400/15 min-h-[280px]"
                >
                  <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                  <p className="text-muted-foreground text-sm">Loading packages...</p>
                </motion.div>
              ) : packages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-2xl p-6 flex flex-col items-center justify-center bg-card dark:bg-black border border-border dark:border-violet-400/15 min-h-[200px] col-span-1 sm:col-span-2"
                >
                  <p className="text-muted-foreground text-sm mb-1">No packages available</p>
                  <p className="text-muted-foreground/70 text-xs">Check back later or contact support</p>
                </motion.div>
              ) : (
                packages.map((pkg, index) => (
                  <motion.div
                    key={pkg._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.05 + index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative rounded-2xl p-5 sm:p-6 flex flex-col bg-card dark:bg-black border-2 border-primary/20 dark:border-violet-400/30 hover:border-primary/40 dark:hover:border-violet-400/50 shadow-lg shadow-primary/10 dark:shadow-violet-500/10 transition-all"
                  >
                    {pkg.offer && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
                          <Sparkles className="w-3 h-3" />
                          {pkg.offer}
                        </span>
                      </div>
                    )}
                    <h2 className="text-lg font-bold text-foreground dark:text-white mb-1">{pkg.name}</h2>
                    <div className="flex items-baseline gap-2 flex-wrap mb-2">
                      {pkg.actualPrice != null && pkg.actualPrice > pkg.currentPrice && (
                        <span className="text-base font-medium text-muted-foreground line-through">
                          ₹{pkg.actualPrice.toLocaleString("en-IN")}
                        </span>
                      )}
                      <span className="text-2xl font-bold text-foreground dark:text-white">
                        ₹{pkg.currentPrice.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm text-muted-foreground">one-time</span>
                    </div>
                    {pkg.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{pkg.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mb-4">
                      <span className="font-semibold">{pkg.includedCredits.toLocaleString("en-IN")}</span> credits
                    </p>
                    <Button
                      onClick={() => handleBuyPackage(pkg)}
                      disabled={processing === pkg._id || !razorpayLoaded}
                      className="w-full rounded-xl h-10 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-600 text-white font-semibold hover:opacity-95 shadow-lg shadow-violet-500/25 text-sm disabled:opacity-50 mt-auto"
                    >
                      {processing === pkg._id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Opening Razorpay...
                        </>
                      ) : !razorpayLoaded ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Buy Now"
                      )}
                    </Button>
                  </motion.div>
                ))
              )}

              {/* Custom Top-Up (form is at top of page) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative rounded-2xl p-5 sm:p-6 flex flex-col bg-card dark:bg-black border border-dashed border-primary/30 dark:border-violet-400/25 hover:border-primary/50 dark:hover:border-violet-400/40 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-violet-500/10 transition-all"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-5 h-5 text-primary dark:text-violet-400" />
                  <h2 className="text-lg font-bold text-foreground dark:text-white">Custom Top-Up</h2>
                </div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-2xl font-bold text-foreground dark:text-white">₹100</span>
                  <span className="text-sm text-muted-foreground">– ₹10,000</span>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  Pick any amount in ₹ (INR). Pay via Razorpay or Stripe.
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  <span className="font-semibold">~12,000</span> credits per ₹1
                </p>
                <p className="text-xs text-muted-foreground mt-auto">
                  Set your amount in the section above ↑
                </p>
              </motion.div>

              {/* Right: Enterprise */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.15 }}
                whileHover={{ scale: 1.02 }}
                className="relative rounded-2xl p-5 sm:p-6 flex flex-col bg-card dark:bg-black border border-border dark:border-violet-400/15 hover:border-primary/30 dark:hover:border-violet-400/25 hover:shadow-xl hover:shadow-primary/10 dark:hover:shadow-violet-500/10 transition-all"
              >
                <h2 className="text-lg font-bold text-foreground dark:text-white mb-1">Enterprise</h2>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-2xl font-bold text-foreground dark:text-white">Custom</span>
                </div>
                <Button
                  onClick={() => router.push("/auth/sign-in")}
                  variant="outline"
                  className="w-full rounded-xl h-10 bg-primary/10 dark:bg-violet-500/15 hover:bg-primary/20 dark:hover:bg-violet-500/25 text-foreground dark:text-violet-100 border border-border dark:border-violet-400/25 mb-4 text-sm font-medium"
                >
                  Contact Sales
                </Button>
                <ul className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-1">
                  {enterpriseFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground dark:text-violet-100/90">
                      <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>


        {/* Pricing page footer - benefits & trust */}
        <footer className="relative z-10 border-t border-border dark:border-violet-400/15 bg-muted/30 dark:bg-black/20 backdrop-blur-sm">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left"
            >
              <div className="flex flex-col items-center sm:items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-violet-500/20 border border-primary/20 dark:border-violet-400/20">
                  <Shield className="w-5 h-5 text-primary dark:text-violet-300" />
                </div>
                <h3 className="text-sm font-semibold text-foreground dark:text-white">Secure & reliable</h3>
                <p className="text-sm text-muted-foreground">
                  Enterprise-grade security. Your data stays yours.
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-violet-500/20 border border-primary/20 dark:border-violet-400/20">
                  <Zap className="w-5 h-5 text-primary dark:text-violet-300" />
                </div>
                <h3 className="text-sm font-semibold text-foreground dark:text-white">Cancel anytime</h3>
                <p className="text-sm text-muted-foreground">
                  No long-term lock-in. Upgrade or downgrade as you grow.
                </p>
              </div>
              <div className="flex flex-col items-center sm:items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-violet-500/20 border border-primary/20 dark:border-violet-400/20">
                  <HeadphonesIcon className="w-5 h-5 text-primary dark:text-violet-300" />
                </div>
                <h3 className="text-sm font-semibold text-foreground dark:text-white">Support when you need it</h3>
                <p className="text-sm text-muted-foreground">
                  Documentation, chat, and dedicated support on higher plans.
                </p>
              </div>
            </motion.div>
            <div className="mt-10 pt-8 border-t border-border dark:border-violet-400/10 text-center">
              <p className="text-sm text-muted-foreground">
                Questions? <Link href="/dashboard/support" className="text-primary hover:underline underline-offset-2">Contact support</Link> or{" "}
                <Link href="/auth/sign-in" className="text-primary hover:underline underline-offset-2">sign in</Link> to get started.
              </p>
            </div>
          </div>
          {/* Sub-footer */}
          <div className="border-t border-border dark:border-violet-400/10 bg-muted/20 dark:bg-black/30">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} AEKO.AI. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
                <Link href="/pricing" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </div>
            </div>
          </div>
        </footer>

        <Footer />

        <PaymentGatewayDialog
          open={gatewayDialogOpen}
          onOpenChange={setGatewayDialogOpen}
          onSelect={handleGatewaySelect}
        />
      </div>
    </main>
  );
};

export default PricingPage;
