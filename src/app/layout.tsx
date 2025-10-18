import type { Metadata } from "next";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";

export const metadata: Metadata = {
  title: "Omori",
  description: "A minimalistic article editor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-black text-white min-h-screen antialiased">
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
