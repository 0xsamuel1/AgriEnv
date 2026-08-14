import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import AppNotifications from "@/frontend/components/ui/AppNotifications";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: "AgriSim — Agricultural Engineering, Brought to Life",
    template: "%s · AgriSim",
  },
  description:
    "Interactive simulations, AI-powered past question analysis, real-time quiz battles, and more for Agricultural & Environmental Engineering students.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/agrisim-mark.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AgriSim",
  },
};

export const viewport: Viewport = {
  themeColor: "#173d28",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
        <AppNotifications />
      </body>
    </html>
  );
}
