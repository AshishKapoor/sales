"use client";

import type React from "react";
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";
import { LoginScreen } from "@/components/login-screen";
import { isLoggedIn } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

// export const metadata: Metadata = {
//   title: "Sales CRM",
//   description:
//     "A comprehensive CRM application for managing products, quotes, and opportunities",
//   generator: "v0.dev",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [auth, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    setAuth(isLoggedIn());
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {auth === null ? null : auth ? (
            <div className="flex h-screen bg-muted shadow-lg">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6">{children}</main>
                <Toaster />
              </div>
            </div>
          ) : (
            <LoginScreen />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
