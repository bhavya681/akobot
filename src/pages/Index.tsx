"use client";

import Navbar from "@/components/Navbar";
import CreateAgentSection from "@/components/CreateAgentSection";
import AllModelsSection from "@/components/AllModelsSection";
import ImageToolsFeaturesSection from "@/components/ImageToolsFeaturesSection";
import VideoToolsFeaturesSection from "@/components/VideoToolsFeaturesSection";
import AgentToolCaseSection from "@/components/AgentToolCaseSection";
import ShowcaseSection from "@/components/ShowcaseSection";
import DevelopersSection from "@/components/DevelopersSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-white dark:bg-black text-foreground overflow-x-hidden w-full relative">
      {/* Light mode: subtle dark grid on white */}
      <div
        className="fixed inset-0 pointer-events-none z-0 dark:hidden opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      {/* Dark mode: black boxes grid - slightly lighter base so grid is more visible */}
      <div
        className="fixed inset-0 pointer-events-none z-0 hidden dark:block bg-[#0f0f0f]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 0, 0, 1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 0, 0, 1) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
      
      <div className="relative z-10">
        <Navbar />
        <CreateAgentSection />
        <AllModelsSection />
        <AgentToolCaseSection />
        <ImageToolsFeaturesSection />
        <VideoToolsFeaturesSection />
        <ShowcaseSection />
        <DevelopersSection />
        {/* <CTASection /> */}
        <Footer />
      </div>
    </main>
  );
};

export default Index;
