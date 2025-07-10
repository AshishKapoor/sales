"use client";

import type React from "react";
// import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/theme-provider";
import { LoginScreen } from "@/components/login-screen";
import { NoOrganizationScreen } from "@/components/no-organization-screen";
import { isLoggedIn, getUser } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { User } from "@/types";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    try {
      if (isLoggedIn()) {
        const userData = await getUser();
        setUser(userData);
        setAuth(true);
      } else {
        setAuth(false);
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      setAuth(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleOrganizationCreated = () => {
    // Refresh user data after organization is created
    fetchUserData();
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="flex min-h-screen items-center justify-center bg-muted">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          </ThemeProvider>
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {!auth ? (
            <LoginScreen />
          ) : user && !user.organization ? (
            <NoOrganizationScreen
              user={user}
              onOrganizationCreated={handleOrganizationCreated}
            />
          ) : (
            <div className="flex h-screen bg-background shadow-lg">
              <Sidebar />
              <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6 rounded-2xl bg-secondary">
                  {children}
                </main>
                <Toaster />
              </div>
            </div>
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}
