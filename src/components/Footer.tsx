import Link from "next/link";

const Footer = () => {
  const videoTools = [
    "AI Video Generator",
    "Text to Video AI",
    "Image to Video AI",
    "Reference to Video",
    "Photo to Video Avatar",
    "AI Music Video Generator",
    "AI Video Editor",
    "AI Shorts",
    "Mimic Motion",
    "Canvas",
    "Video to Video AI",
    "AI Video Enhancer",
    "AI Video Extender",
  ];

  const videoModels = [
    "Pollo 2.5",
    "Veo 3",
    "Sora 2",
    "Kling AI",
    "Hailuo AI",
    "PixVerse AI",
    "Runway",
    "Vidu AI",
    "Luma AI",
    "Seedance",
    "Wan AI",
    "Hunyuan",
    "Midjourney",
  ];

  const imageModels = [
    "Nano Banana",
    "Midjourney",
    "Recraft",
    "Ideogram",
    "Stable Diffusion",
    "Flux AI",
    "Seedream",
    "Dall-E",
    "Imagen",
    "GPT-4o",
    "Flux Kontext",
    "Qwen Image",
    "Wan AI",
  ];

  const imageTools = [
    "AI Image Generator",
    "Image to Image AI",
    "Chat to Image",
    "AI Art Generator",
    "Remove BG",
    "Object Remover",
    "Image Enhancer",
    "Ghibli AI Generator",
    "Anime Upscaler",
    "Image Generators",
    "LoRAs",
  ];

  const companyLinks = [
    { name: "About Us", path: "/about" },
    { name: "Contact Us", path: "/contact" },
    { name: "Pricing", path: "/pricing" },
    { name: "API", path: "/api" },
    { name: "What's New", path: "/whats-new" },
    { name: "MCP Server", path: "/mcp-server" },
    { name: "Download App", path: "/download" },
    { name: "Community", path: "/community" },
    { name: "Resources", path: "/resources" },
    { name: "Creative Partners", path: "/partners" },
    { name: "Affiliate Program", path: "/affiliate" },
    { name: "Refund Policy", path: "/refund" },
    { name: "Privacy Policy", path: "/privacy" },
    { name: "Terms and Conditions", path: "/terms" },
  ];

  return (
    <footer className="bg-white dark:bg-transparent border-t border-border/50">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Video Tools */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              Video Tools
            </h3>
            <ul className="space-y-3">
              {videoTools.map((tool) => (
                <li key={tool}>
                  <Link
                    href="/dashboard/tools/video"
                    className="text-sm text-foreground/80 hover:text-primary transition-colors"
                  >
                    {tool}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/dashboard/tools/video"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors"
                >
                  More Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Video Models */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              Video Models
            </h3>
            <ul className="space-y-3">
              {videoModels.map((model) => (
                <li key={model}>
                  <Link
                    href="/dashboard/tools/video"
                    className="text-sm text-foreground/80 hover:text-primary transition-colors"
                  >
                    {model}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/dashboard/tools/video"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors"
                >
                  More Models
                </Link>
              </li>
            </ul>
          </div>

          {/* Image Models */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              Image Models
            </h3>
            <ul className="space-y-3">
              {imageModels.map((model) => (
                <li key={model}>
                  <Link
                    href="/dashboard/tools/image"
                    className="text-sm text-foreground/80 hover:text-primary transition-colors"
                  >
                    {model}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/dashboard/tools/image"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors"
                >
                  More Models
                </Link>
              </li>
            </ul>
          </div>

          {/* Image Tools */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              Image Tools
            </h3>
            <ul className="space-y-3">
              {imageTools.map((tool) => (
                <li key={tool}>
                  <Link
                    href="/dashboard/tools/image"
                    className="text-sm text-foreground/80 hover:text-primary transition-colors"
                  >
                    {tool}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/dashboard/tools/image"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors"
                >
                  More Tools
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.path}
                    className="text-sm text-foreground/80 hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AEKO. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
