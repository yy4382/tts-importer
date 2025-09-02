import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/utils/providers";
import { AppSidebar } from "@/components/modules/app-sidebar";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const metadata: Metadata = {
  metadataBase: new URL("https://tts.yfi.moe"),
  title: "TTS Importer",
  description: "Import TTS to novel reading apps.",
  icons: { icon: "/favicon.svg", apple: "/favicon.png" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    title: "TTS Importer",
    description: "Import TTS to novel reading apps.",
    images: [{ url: "/og-image.png", alt: "TTS Importer" }],
  },
  twitter: {
    title: "TTS Importer",
    description: "Import TTS to novel reading apps.",
    images: "/og-image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* <script src="https://unpkg.com/react-scan/dist/auto.global.js" async /> */}
      </head>
      <body>
        <NextThemesProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="hidden" style={{ fontSize: "3rem" }}>
            如果看到这段话，说明你的 CSS
            文件没有正确加载。尝试强制刷新页面或更换网络环境。
          </div>
          <Providers>
            <AppSidebar />

            {children}
          </Providers>
        </NextThemesProvider>
      </body>
    </html>
  );
}
