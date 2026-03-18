"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X, Sparkles, Zap, Crown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { paymentAPI, packageAPI, authAPI, type PaymentGateway } from "@/lib/api";
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
  includedCredits: number;
  actualPrice?: number;
  currentPrice: number;
  offer?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

/**
 * PricingSection Component
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
const PricingSection = () => {
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [gatewayDialogOpen, setGatewayDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{ packageId: string; planName: string } | null>(null);

  // Load Razorpay script
  useEffect(() => {
    // Check if Razorpay is already loaded
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
      
      // Fetch packages from backend API - ONLY dynamic backend data, NO static packages
      console.log("🔄 Fetching packages from backend API...");
      const data = await packageAPI.getAll();
      console.log("✅ Packages API response:", data);
      
      // Handle response - API should return array of packages (GET /api/packages)
      let packagesList: Package[] = [];
      if (Array.isArray(data)) {
        packagesList = data;
        console.log(`📦 Received ${packagesList.length} packages from API`);
      } else if (data && typeof data === 'object') {
        // Handle wrapped responses (if backend wraps in object)
        packagesList = (data as any).packages || (data as any).data || (data as any).items || [];
        // Single package object
        if (!Array.isArray(packagesList) && (data as any)._id) {
          packagesList = [data as Package];
        }
        console.log(`📦 Extracted ${packagesList.length} packages from wrapped response`);
      } else {
        console.warn("⚠️ Unexpected response format from API:", typeof data);
      }
      
      // Filter and validate packages from backend (only show isActive = true)
      const validPackages = packagesList
        .filter((pkg: any) => {
          const isValid = pkg && 
                 pkg._id && 
                 pkg.name && 
                 typeof pkg.currentPrice === 'number' && pkg.currentPrice >= 0 &&
                 typeof pkg.includedCredits === 'number' && pkg.includedCredits >= 1 &&
                 (pkg.isActive === undefined || pkg.isActive === true);
          
          if (!isValid) {
            console.warn("❌ Filtered out invalid package:", {
              _id: pkg?._id,
              name: pkg?.name,
              isActive: pkg?.isActive,
              currentPrice: pkg?.currentPrice,
              includedCredits: pkg?.includedCredits,
            });
          }
          return isValid;
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
      
      // Map backend packages to display format - NO static fallback
      if (validPackages.length > 0) {
        const mappedPlans = validPackages.map((pkg, index) => {
          const creditsFormatted = pkg.includedCredits.toLocaleString('en-IN');
          
          // Choose icon based on index
          let icon = Zap;
          if (index === 1 || pkg.name.toLowerCase().includes('standard') || pkg.name.toLowerCase().includes('pro')) {
            icon = Sparkles;
          }
          if (index === 2 || pkg.name.toLowerCase().includes('pro') || pkg.name.toLowerCase().includes('premium')) {
            icon = Crown;
          }
          
          return {
            name: pkg.name,
            icon: icon,
            price: `₹${pkg.currentPrice.toLocaleString('en-IN')}`,
            actualPrice: pkg.actualPrice,
            currentPrice: pkg.currentPrice,
            period: "/one-time",
            description: pkg.description || `Get ${creditsFormatted} credits for your AI needs`,
            credits: creditsFormatted,
            offer: pkg.offer, // Show offer badge if offer field exists
            features: [
              { name: `${creditsFormatted} Credits`, included: true },
              { name: "Instant Credit Addition", included: true },
              { name: "No Expiry", included: true },
              { name: "24/7 Support", included: true },
            ],
            cta: "Buy Now",
            highlighted: index === Math.floor(validPackages.length / 2),
            packageId: pkg._id, // Required for payment
          };
        });
        
        console.log(`✅ Mapped ${mappedPlans.length} plans for display`);
        setPlans(mappedPlans);
      } else {
        console.warn("⚠️ No valid packages to display");
        setPlans([]);
        if (packagesList.length > 0) {
          toast.error("Packages found but none are valid. Please check package configuration.");
        } else {
          console.log("ℹ️ No packages returned from API. Make sure packages exist in backend with isActive = true");
        }
      }
    } catch (error: any) {
      console.error("❌ Error fetching packages:", error);
      setPlans([]);
      toast.error(`Failed to load packages: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const proceedWithPayment = async (packageId: string, planName: string, gateway: PaymentGateway) => {
    try {
      setProcessing(packageId);
      console.log("Creating order for package:", packageId, "gateway:", gateway.name);
      const orderData = await paymentAPI.createOrder(packageId, gateway.name);
      console.log("Order data received:", orderData);

      if (!orderData || !orderData.orderId) {
        toast.error("Invalid order data received from server");
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

      // Check if Razorpay is loaded
      if (!window.Razorpay || !razorpayLoaded) {
        toast.error("Payment gateway is still loading. Please wait a moment and try again.");
        setProcessing(null);
        return;
      }

      // Use Razorpay key from backend response, with fallback
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
        description: `Purchase ${planName}`,
        image: "/logo.png", // Optional: Add your logo
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
          packageId: packageId,
          packageName: planName,
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
      console.error("Payment initiation error:", error);
      toast.error(error.message || "Failed to initiate payment. Please try again.");
      setProcessing(null);
    }
  };

  const handlePayment = (packageId: string | null, planName: string) => {
    if (!packageId) {
      router.push("/pricing");
      return;
    }
    if (!authAPI.isAuthenticated()) {
      toast.error("Please sign in to purchase a package");
      router.push(`/auth/sign-in?returnTo=${encodeURIComponent(`/payment?packageId=${packageId}`)}`);
      return;
    }
    setSelectedPayment({ packageId, planName });
    setGatewayDialogOpen(true);
  };

  const handleGatewaySelect = (gateway: PaymentGateway) => {
    if (selectedPayment) {
      const { packageId, planName } = selectedPayment;
      setSelectedPayment(null);
      setGatewayDialogOpen(false);
      proceedWithPayment(packageId, planName, gateway);
    }
  };

  return (
    <section id="pricing" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }} ></div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your creative needs
          </p>
        </motion.div>

        {/* Pricing Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Loading packages...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-2">
              No packages available at the moment.
            </p>
            <p className="text-sm text-muted-foreground">
              Please check back later or contact support.
            </p>
            {packages.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Note: {packages.length} package(s) found but filtered out due to validation.
              </p>
            )}
          </div>
        ) : (
          <div className={`grid gap-6 lg:gap-8 max-w-6xl mx-auto ${
            plans.length === 1 ? 'grid-cols-1 max-w-md' :
            plans.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
            'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
            {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.packageId || `plan-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-2xl p-6 lg:p-8 ${
                  plan.highlighted
                    ? "glass-card border-primary/50 ring-1 ring-primary/30 scale-105"
                    : "glass-card"
                }`}
              >
                {/* Highlighted badge */}
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.highlighted 
                      ? "bg-gradient-to-br from-primary to-accent" 
                      : "bg-secondary/50"
                  }`}>
                    <Icon className={`w-5 h-5 ${plan.highlighted ? "text-white" : "text-primary"}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground">
                    {plan.name}
                  </h3>
                </div>

                {/* Offer Badge */}
                {plan.offer && (
                  <div className="mb-3">
                    <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full">
                      <Sparkles className="w-3 h-3" />
                      {plan.offer}
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    {plan.actualPrice && plan.actualPrice > plan.currentPrice && (
                      <span className="text-xl font-medium text-muted-foreground line-through">
                        ₹{plan.actualPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  {plan.credits && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-foreground">{plan.credits}</span> Credits Included
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-6">
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: { name: string; included: boolean }) => (
                    <li key={feature.name} className="flex items-center gap-3">
                      {feature.included ? (
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                          <X className="w-3 h-3 text-destructive" />
                        </div>
                      )}
                      <span className="text-sm text-foreground">{feature.name}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  variant={plan.highlighted ? "hero" : "outline"}
                  className="w-full"
                  size="lg"
                  onClick={() => {
                    if (plan.packageId) {
                      handlePayment(plan.packageId, plan.name);
                    } else {
                      toast.error("Package not available");
                    }
                  }}
                  disabled={processing === plan.packageId || loading || !razorpayLoaded}
                  title={!razorpayLoaded ? "Payment gateway is loading..." : ""}
                >
                  {processing === plan.packageId ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : !razorpayLoaded ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </motion.div>
            );
          })}
          </div>
        )}

        <PaymentGatewayDialog
          open={gatewayDialogOpen}
          onOpenChange={setGatewayDialogOpen}
          onSelect={handleGatewaySelect}
        />

        {/* Bottom note */}
        {plans.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            Credits never expire. Secure payment via Razorpay.
          </motion.p>
        )}
      </div>
    </section>
  );
};

export default PricingSection;
