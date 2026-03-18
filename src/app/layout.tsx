import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AKOBOT.ai - Create Images & Videos with AI",
  description: "AKO brings the world's most powerful AI models together to generate, transform, and animate visuals in one place.",
  icons: {
    icon: "./icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=localStorage.getItem("theme");var r=document.documentElement;if(s==="dark"){r.classList.add("dark")}else{r.classList.remove("dark");if(!s)localStorage.setItem("theme","light")}})();`,
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
