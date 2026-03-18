"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { paymentAPI, type PaymentGateway } from "@/lib/api";
import { CreditCard, Loader2 } from "lucide-react";

interface PaymentGatewayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (gateway: PaymentGateway) => void;
  packageName?: string;
}

export function PaymentGatewayDialog({
  open,
  onOpenChange,
  onSelect,
  packageName,
}: PaymentGatewayDialogProps) {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setError(null);
      paymentAPI
        .getGateways()
        .then((data) => {
          const active = data.filter((g) => g.isActive);
          setGateways(active);
        })
        .catch((e) => setError(e.message || "Failed to load payment options"))
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSelect = (gateway: PaymentGateway) => {
    onSelect(gateway);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Select payment method
          </DialogTitle>
          <DialogDescription>
            {packageName ? `Choose how you'd like to pay for ${packageName}` : "Choose your preferred payment gateway"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive py-4">{error}</p>
        ) : gateways.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No payment gateways available.</p>
        ) : (
          <div className="grid gap-2 py-2">
            {gateways.map((gateway) => (
              <button
                key={gateway.name}
                type="button"
                onClick={() => handleSelect(gateway)}
                className="flex flex-col items-start gap-1 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <span className="font-medium">{gateway.displayName}</span>
                {gateway.description && (
                  <span className="text-sm text-muted-foreground">{gateway.description}</span>
                )}
                {gateway.supportedCurrencies?.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Currencies: {gateway.supportedCurrencies.join(", ")}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
