import Providers from "@/app/providers";

import { Toaster } from "@/components/ui/toaster";

import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEBSITE_URL)
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main>
          <Providers>{children}</Providers>
        </main>
        <Toaster />
      </body>
    </html>
  );
}
