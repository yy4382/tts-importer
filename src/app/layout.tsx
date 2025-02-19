import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/utils/providers";
import { AppSidebar } from "@/components/modules/app-sidebar";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const metadata: Metadata = {
  title: "TTS Importer",
  description: "Import TTS to novel reading apps.",
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
          <Providers>
            <AppSidebar />
            {children}
          </Providers>
        </NextThemesProvider>
      </body>
    </html>
  );
}
