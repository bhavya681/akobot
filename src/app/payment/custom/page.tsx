import { Suspense } from "react";
import CustomPaymentPage from "@/pages/CustomPaymentPage";

export default function CustomPaymentPageRoute() {
  return (
    <Suspense fallback={null}>
      <CustomPaymentPage />
    </Suspense>
  );
}
