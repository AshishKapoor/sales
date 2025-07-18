"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { RegisterScreen } from "./register-screen";

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  if (showRegister) {
    return <RegisterScreen onBackToLogin={() => setShowRegister(false)} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-background p-8 shadow-md"
      >
        <h2 className="mb-6 text-2xl font-bold text-center">SALES CRM</h2>
        {error && (
          <div className="mb-4 rounded bg-red-100 px-4 py-2 text-red-700">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g., john.doe@example.com"
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your secure password"
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring focus:ring-primary mb-4"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowRegister(true)}
            className="text-sm text-primary hover:text-primary-dark"
          >
            Don't have an account? Create one
          </button>
        </div>
      </form>
    </div>
  );
}
