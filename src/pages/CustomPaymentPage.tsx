"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Loader2,
  ArrowLeft,
  CreditCard,
  DollarSign,
  Coins,
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { paymentAPI, authAPI, type PaymentGateway } from "@/lib/api";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
    Stripe?: (key: string) => any;
  }
}

const CREDITS_PER_DOLLAR = 1_000_000;
const MIN_AMOUNT = 1;
const MAX_AMOUNT = 100;

// Quick-pick presets
const PRESETS = [5, 10, 25, 50, 100];

const CustomPaymentPage = () => {
  const router = useRouter();
  const [amount, setAmount] = useState(5);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<{
    credits: number;
    amount: number;
  } | null>(null);

  const creditsPreview = amount * CREDITS_PER_DOLLAR;
  const percent = ((amount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100;

  // Load Razorpay script
  useEffect(() => {
    if (document.querySelector('script[src*="razorpay"]')) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  // Fetch available gateways
  useEffect(() => {
    (async () => {
      try {
        const data = await paymentAPI.getGateways();
        const active = data.filter((g) => g.isActive);
        setGateways(active);
        // Default to stripe if available, else first active
        const stripe = active.find((g) => g.name === "stripe");
        setSelectedGateway(stripe ? "stripe" : active[0]?.name ?? "");
      } catch {
        toast.error("Failed to load payment gateways");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── Verify helper (shared by both gateways) ──────────────────────────
  const verifyPayment = useCallback(
    async (payload: {
      gatewayOrderId: string;
      gatewayPaymentId: string;
      razorpaySignature?: string;
    }) => {
      try {
        const result = await paymentAPI.verifyGatewayPayment(payload);
        if (result.status === "paid") {
          setPaymentSuccess({
            credits: result.credits,
            amount,
          });
          toast.success("Payment successful! Credits added to your wallet.");
        } else {
          toast.error(result.message || "Payment verification failed");
        }
      } catch (err: any) {
        toast.error(err.message || "Payment verification failed");
      }
    },
    [amount],
  );

  // ── Razorpay flow ────────────────────────────────────────────────────
  const openRazorpay = useCallback(
    (data: any) => {
      if (!window.Razorpay) {
        toast.error("Payment gateway not loaded. Please refresh the page.");
        setProcessing(false);
        return;
      }

      const currentUser = authAPI.getCurrentUser();

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: "AKOBOT.AI",
        description: `Custom Top-up — $${data.amountInUsd} (${(data.credits ?? 0).toLocaleString()} credits)`,
        prefill: {
          name: currentUser?.username || currentUser?.name || "",
          email: currentUser?.email || "",
        },
        theme: { color: "#7c3aed" },
        handler: async (response: any) => {
          await verifyPayment({
            gatewayOrderId: response.razorpay_order_id,
            gatewayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          setProcessing(false);
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      });
      rzp.on("payment.failed", (resp: any) => {
        toast.error(resp.error?.description || "Payment failed");
        setProcessing(false);
      });
      rzp.open();
    },
    [verifyPayment],
  );

  // ── Stripe flow (redirect-based via checkout URL or clientSecret) ───
  const openStripe = useCallback(
    async (data: any) => {
      // If backend returns a checkout URL, redirect directly
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      // If backend returns clientSecret, use Stripe.js confirmPayment
      if (data.clientSecret) {
        const stripeKey =
          process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
        if (!stripeKey) {
          toast.error("Stripe is not configured. Please contact support.");
          setProcessing(false);
          return;
        }

        try {
          const stripe = window.Stripe?.(stripeKey);
          if (!stripe) {
            toast.error("Stripe.js failed to load. Please refresh.");
            setProcessing(false);
            return;
          }

          const { error, paymentIntent } = await stripe.confirmPayment({
            clientSecret: data.clientSecret,
            confirmParams: {
              return_url: `${window.location.origin}/payment/custom?success=true`,
            },
            redirect: "if_required",
          });

          if (error) {
            toast.error(error.message || "Payment failed");
            setProcessing(false);
            return;
          }

          if (paymentIntent?.status === "succeeded") {
            await verifyPayment({
              gatewayOrderId: paymentIntent.id,
              gatewayPaymentId: paymentIntent.id,
            });
          }
        } catch (err: any) {
          toast.error(err.message || "Stripe payment failed");
        } finally {
          setProcessing(false);
        }
        return;
      }

      toast.error("Stripe checkout is not available. Please try Razorpay.");
      setProcessing(false);
    },
    [verifyPayment],
  );

  // ── Main pay handler ────────────────────────────────────────────────
  const handlePay = async () => {
    if (!authAPI.isAuthenticated()) {
      toast.error("Please sign in first");
      router.push(
        `/auth/sign-in?returnTo=${encodeURIComponent("/payment/custom")}`,
      );
      return;
    }

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      toast.error(`Amount must be between $${MIN_AMOUNT} and $${MAX_AMOUNT}`);
      return;
    }

    setProcessing(true);
    try {
      const data = await paymentAPI.createCustomOrder(
        amount,
        selectedGateway || undefined,
      );

      if (selectedGateway === "razorpay") {
        openRazorpay(data);
      } else {
        await openStripe(data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create order. Please try again.");
      setProcessing(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <main className="min-h-screen overflow-x-hidden w-full relative bg-background">
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 dark:bg-none" />
        <div className="fixed inset-0 pointer-events-none z-0 hidden dark:block" style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 30%, #2d1b4e 55%, #3b2a5c 75%, #4c2d5e 90%, #5c3a5a 100%)" }} />
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <section className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full rounded-2xl p-8 bg-card dark:bg-black border border-border dark:border-violet-400/20 shadow-2xl text-center"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">
                Payment Successful!
              </h2>
              <p className="text-muted-foreground mb-6">
                <span className="font-semibold text-foreground dark:text-violet-200">
                  {paymentSuccess.credits.toLocaleString()}
                </span>{" "}
                credits have been added to your wallet.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={() => router.push("/dashboard")}
                  className="w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-600 text-white font-semibold hover:opacity-95 shadow-lg shadow-violet-500/25"
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPaymentSuccess(null);
                    setAmount(5);
                  }}
                >
                  Top Up Again
                </Button>
              </div>
            </motion.div>
          </section>
          <Footer />
        </div>
      </main>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen overflow-x-hidden w-full relative bg-background">
        <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 dark:bg-none" />
        <div className="fixed inset-0 pointer-events-none z-0 hidden dark:block" style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 30%, #2d1b4e 55%, #3b2a5c 75%, #4c2d5e 90%, #5c3a5a 100%)" }} />
        <div className="relative z-10 flex flex-col min-h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading payment options...</p>
        </div>
      </main>
    );
  }

  // ── Main UI ─────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen overflow-x-hidden w-full relative bg-background">
      {/* Light gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 dark:bg-none" />
      {/* Dark gradient */}
      <div className="fixed inset-0 pointer-events-none z-0 hidden dark:block" style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 30%, #2d1b4e 55%, #3b2a5c 75%, #4c2d5e 90%, #5c3a5a 100%)" }} />
      {/* Grid overlays */}
      <div className="fixed inset-0 pointer-events-none z-0 dark:hidden opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="fixed inset-0 pointer-events-none z-0 hidden dark:block opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <section className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-lg">
            {/* Back */}
            <Button
              variant="ghost"
              onClick={() => router.push("/pricing")}
              className="mb-6 text-muted-foreground hover:text-foreground dark:text-violet-200 dark:hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pricing
            </Button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 sm:p-8 bg-card dark:bg-black border border-border dark:border-violet-400/20 shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
                  <Coins className="w-6 h-6 text-violet-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground dark:text-white">
                    Top Up Credits
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Choose any amount and pay instantly
                  </p>
                </div>
              </div>

              {/* ── Amount display ─────────────────────────────────── */}
              <div className="text-center mb-6">
                <div className="inline-flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold text-foreground dark:text-white tabular-nums">
                    ${amount}
                  </span>
                  <span className="text-lg text-muted-foreground">.00</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  ≈{" "}
                  <span className="font-semibold text-foreground dark:text-violet-200">
                    {creditsPreview.toLocaleString()}
                  </span>{" "}
                  credits
                </p>
                <p className="mt-1 text-xs text-muted-foreground">One-time top-up (not a subscription)</p>
              </div>

              {/* ── Slider ────────────────────────────────────────── */}
              <div className="mb-8 px-1">
                <div className="relative pt-6">
                  {/* Floating bubble over the thumb */}
                  <div
                    className="pointer-events-none absolute -top-1 left-0 w-full"
                    aria-hidden
                  >
                    <div
                      className="absolute -translate-x-1/2 -top-6 select-none rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-md after:absolute after:left-1/2 after:top-full after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-rose-500"
                      style={{ left: `${percent}%` }}
                    >
                      {creditsPreview.toLocaleString()} credits
                    </div>
                  </div>

                  <Slider
                    min={MIN_AMOUNT}
                    max={MAX_AMOUNT}
                    step={1}
                    value={[amount]}
                    onValueChange={([v]) => setAmount(v)}
                    className="w-full"
                    trackClassName="bg-white/10 dark:bg-white/10"
                    rangeClassName="bg-gradient-to-r from-fuchsia-500 to-violet-600"
                    thumbClassName="h-5 w-5 border-0 bg-white shadow-[0_0_0_4px_rgba(139,92,246,0.35)] dark:bg-white"
                  />
                </div>
                <div className="flex justify-between mt-3 text-xs text-muted-foreground">
                  <span>${MIN_AMOUNT}</span>
                  <span>${MAX_AMOUNT}</span>
                </div>
              </div>

              {/* ── Quick presets ──────────────────────────────────── */}
              <div className="flex flex-wrap gap-2 justify-center mb-8">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                      amount === p
                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30"
                        : "bg-muted/60 dark:bg-white/5 text-muted-foreground dark:text-violet-200/80 border-border dark:border-violet-400/20 hover:bg-muted dark:hover:bg-white/10"
                    }`}
                  >
                    ${p}
                  </button>
                ))}
              </div>

              {/* ── Gateway selector ──────────────────────────────── */}
              {gateways.length > 1 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-foreground dark:text-violet-100 mb-2">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {gateways.map((gw) => (
                      <button
                        key={gw.name}
                        type="button"
                        onClick={() => setSelectedGateway(gw.name)}
                        className={`flex flex-col items-center gap-1 rounded-xl border p-3 transition-all text-sm ${
                          selectedGateway === gw.name
                            ? "border-primary dark:border-violet-400 bg-primary/10 dark:bg-violet-500/15 text-foreground dark:text-white ring-2 ring-primary/30 dark:ring-violet-400/30"
                            : "border-border dark:border-violet-400/15 bg-card dark:bg-white/5 text-muted-foreground hover:bg-muted dark:hover:bg-white/10"
                        }`}
                      >
                        <CreditCard className="w-5 h-5" />
                        <span className="font-medium">{gw.displayName}</span>
                        {gw.supportedCurrencies?.length > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {gw.supportedCurrencies.join(", ")}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Summary ───────────────────────────────────────── */}
              <div className="mb-6 p-4 rounded-xl bg-muted/50 dark:bg-white/5 border border-border dark:border-violet-400/10 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4" /> Amount
                  </span>
                  <span className="font-semibold text-foreground dark:text-white">
                    ${amount}.00
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Coins className="w-4 h-4" /> Credits (est.)
                  </span>
                  <span className="font-semibold text-foreground dark:text-white">
                    {creditsPreview.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <ArrowRightLeft className="w-4 h-4" /> Gateway
                  </span>
                  <span className="font-medium text-foreground dark:text-white capitalize">
                    {gateways.find((g) => g.name === selectedGateway)?.displayName || selectedGateway}
                  </span>
                </div>
              </div>

              {/* ── No gateways warning ───────────────────────────── */}
              {gateways.length === 0 && (
                <div className="mb-6 flex items-start gap-2 rounded-xl border border-amber-400/50 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    No payment gateways available right now. Please try again later or contact support.
                  </span>
                </div>
              )}

              {/* ── Pay button ────────────────────────────────────── */}
              <Button
                onClick={handlePay}
                disabled={processing || gateways.length === 0 || !selectedGateway}
                className="w-full h-12 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-600 text-white font-semibold hover:opacity-95 shadow-lg shadow-violet-500/25 text-base disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing…
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Buy Now — ${amount}.00
                  </>
                )}
              </Button>

              {/* ── Fine print ────────────────────────────────────── */}
              <p className="mt-4 text-xs text-center text-muted-foreground">
                {selectedGateway === "razorpay"
                  ? "You will be charged in INR at the current exchange rate. Secured by Razorpay."
                  : "You will be charged in USD. Secured by Stripe."}
              </p>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  );
};

export default CustomPaymentPage;
