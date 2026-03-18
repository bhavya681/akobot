"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Check, X, ArrowLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { paymentAPI, authAPI, packageAPI, type PaymentGateway } from "@/lib/api";
import { PaymentGatewayDialog } from "@/components/PaymentGatewayDialog";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Package {
  _id: string;
  name: string;
  description?: string;
  price: number;
  credits: number;
  features?: string[];
  duration?: number;
}

const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [packageId, setPackageId] = useState<string | null>(null);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Get package ID from URL params
  useEffect(() => {
    const id = searchParams?.get("packageId");
    
    if (!id) {
      toast.error("No package selected");
      router.push("/pricing");
      return;
    }

    setPackageId(id);
    fetchPackage(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchPackage = async (id: string) => {
    try {
      setLoading(true);
      const data = await packageAPI.getById(id);
      setPackageData(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load package");
      router.push("/pricing");
    } finally {
      setLoading(false);
    }
  };

  const proceedWithPayment = async (gateway: PaymentGateway) => {
    if (!packageId) return;
    try {
      setProcessing(true);
      const orderData = await paymentAPI.createOrder(packageId, gateway.name);

      if (!orderData?.orderId) {
        toast.error("Invalid order data received from server");
        setProcessing(false);
        return;
      }

      if (gateway.name === "razorpay") {
        if (!window.Razorpay) {
          toast.error("Payment gateway not loaded. Please refresh the page.");
          setProcessing(false);
          return;
        }
        const razorpayKey = orderData.keyId || orderData.key;
        if (!razorpayKey) {
          toast.error("Payment gateway key not configured.");
          setProcessing(false);
          return;
        }

        const options = {
          key: razorpayKey,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          order_id: orderData.orderId,
          name: "AEKO.AI",
          description: `Purchase ${packageData?.name || "package"}`,
          handler: async (response: any) => {
            try {
              await paymentAPI.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              toast.success("Payment successful! Credits have been added to your wallet.");
              router.push("/dashboard");
            } catch (error: any) {
              toast.error(error.message || "Payment verification failed");
              setProcessing(false);
            }
          },
          prefill: {
            name: authAPI.getCurrentUser()?.username || "",
            email: authAPI.getCurrentUser()?.email || "",
          },
          theme: {
            color: "#7c3aed",
          },
          modal: {
            ondismiss: () => {
              setProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else if (gateway.name === "stripe" && (orderData as any).checkoutUrl) {
        window.location.href = (orderData as any).checkoutUrl;
      } else {
        toast.error("This payment gateway is not yet supported.");
        setProcessing(false);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create payment order");
      setProcessing(false);
    }
  };

  const handlePayment = () => {
    if (!packageId) return;
    if (!authAPI.isAuthenticated()) {
      toast.error("Please sign in to purchase a package");
      router.push(`/auth/sign-in?returnTo=${encodeURIComponent(`/payment?packageId=${packageId}`)}`);
      return;
    }
    setGatewayDialogOpen(true);
  };

  const handleGatewaySelect = (gateway: PaymentGateway) => {
    setGatewayDialogOpen(false);
    proceedWithPayment(gateway);
  };

  if (loading) {
    return (
      <main className="min-h-screen overflow-x-hidden w-full relative text-white">
        <div className="fixed inset-0 pointer-events-none z-0" style={{
          background: "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 30%, #2d1b4e 55%, #3b2a5c 75%, #4c2d5e 90%, #5c3a5a 100%)",
        }} />
        <div className="relative z-10 flex flex-col min-h-screen items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          <p className="mt-4 text-violet-200">Loading package details...</p>
        </div>
      </main>
    );
  }

  if (!packageData) {
    return null;
  }

  return (
    <main className="min-h-screen overflow-x-hidden w-full relative text-white">
      {/* Refined gradient: deep indigo → violet → soft rose */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "linear-gradient(135deg, #0f0f23 0%, #1a1a3e 30%, #2d1b4e 55%, #3b2a5c 75%, #4c2d5e 90%, #5c3a5a 100%)",
        }}
      />
      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-0 opacity-[0.07]"
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

        <section className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-2xl">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => router.push("/pricing")}
              className="mb-6 text-violet-200 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Pricing
            </Button>

            {/* Payment Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-6 sm:p-8 bg-black border border-violet-400/20 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-violet-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Complete Payment</h1>
                  <p className="text-sm text-violet-200/70">Secure payment via Razorpay</p>
                </div>
              </div>

              {/* Package Details */}
              <div className="mb-6 p-4 rounded-xl bg-violet-500/10 border border-violet-400/20">
                <h2 className="text-lg font-semibold text-white mb-2">{packageData.name}</h2>
                {packageData.description && (
                  <p className="text-sm text-violet-200/70 mb-3">{packageData.description}</p>
                )}
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-3xl font-bold text-white">₹{packageData.price}</span>
                  <span className="text-sm text-violet-200/70">
                    / {packageData.duration ? `${packageData.duration} days` : "month"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-violet-200/80">
                  <span className="font-medium">Credits:</span>
                  <span>{(packageData.credits || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Features */}
              {packageData.features && packageData.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white mb-3">Package Features:</h3>
                  <ul className="space-y-2">
                    {packageData.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-violet-100/90">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Payment Summary */}
              <div className="mb-6 p-4 rounded-xl bg-black/50 border border-violet-400/10">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-violet-200/70">Package Price</span>
                  <span className="text-lg font-semibold text-white">₹{packageData.price}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-violet-400/10">
                  <span className="text-base font-semibold text-white">Total Amount</span>
                  <span className="text-2xl font-bold text-violet-300">₹{packageData.price}</span>
                </div>
              </div>

              {/* Payment Button */}
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full h-12 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-violet-600 text-white font-semibold hover:opacity-95 shadow-lg shadow-violet-500/25 text-base"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    Proceed to Payment
                  </>
                )}
              </Button>

              {/* Security Note */}
              <p className="mt-4 text-xs text-center text-violet-300/60">
                Your payment is secured by Razorpay. We never store your card details.
              </p>
            </motion.div>
          </div>
        </section>

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

export default PaymentPage;

