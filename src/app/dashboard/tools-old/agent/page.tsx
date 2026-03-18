import { Suspense } from "react";
import AgentLLMPage from "@/pages/dashboard/AgentLLMPage";

export default function AgentLLMPageRoute() {
  return (
    <Suspense fallback={null}>
      <AgentLLMPage />
    </Suspense>
  );
}
