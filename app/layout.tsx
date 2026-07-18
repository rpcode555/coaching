import type { Metadata } from "next";
import { Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-sans-bengali",
  subsets: ["bengali"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "সাফল্য Coaching Center | শিক্ষা • দীক্ষা • সাফল্য",
  description:
    "সাফল্য Coaching Center — Your path to academic excellence. Expert faculty, proven results, and personalized mentoring for Madhyamik, Higher Secondary, JEE, NEET, and WBJEE preparation.",
  keywords:
    "coaching center, tuition, Madhyamik preparation, Higher Secondary, JEE, NEET, WBJEE, সাফল্য, coaching, Kolkata",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${inter.variable} ${notoSansBengali.variable} antialiased`}
    >
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
