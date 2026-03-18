import { Suspense } from "react";
import PaymentPage from "@/pages/PaymentPage";

export default function PaymentPageRoute() {
  return (
    <Suspense fallback={null}>
      <PaymentPage />
    </Suspense>
  );
}
