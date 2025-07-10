"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

export function RegisterScreen({
  onBackToLogin,
}: {
  onBackToLogin: () => void;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    createOrganization: false,
    organizationName: "",
    organizationDescription: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    if (formData.createOrganization && !formData.organizationName.trim()) {
      setError("Organization name is required when creating an organization");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.createOrganization,
        formData.organizationName,
        formData.organizationDescription
      );
      // Registration successful
      const successMessage = formData.createOrganization
        ? "Account and organization created successfully! You're now the admin. Redirecting to login..."
        : "Account created successfully! Redirecting to login...";
      setSuccess(successMessage);
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-accent">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-lg bg-background p-8 shadow-md"
      >
        <h2 className="mb-6 text-2xl font-bold text-center">Create Account</h2>
        <p className="mb-6 text-sm text-gray-600 text-center">
          Join Sales CRM to manage your sales pipeline
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-100 px-4 py-2 text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded bg-green-100 px-4 py-2 text-green-700">
            {success}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="firstName"
            >
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="lastName"
            >
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary"
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 8 characters long
          </p>
        </div>

        <div className="mb-6">
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="confirmPassword"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary"
          />
        </div>

        <div className="mb-4 p-4 border rounded bg-gray-50">
          <div className="flex items-center mb-3">
            <input
              id="createOrganization"
              name="createOrganization"
              type="checkbox"
              checked={formData.createOrganization}
              onChange={handleChange}
              className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label className="text-sm font-medium" htmlFor="createOrganization">
              Create a new organization
            </label>
          </div>
          <p className="text-xs text-gray-600 mb-3">
            Check this if you're setting up Sales CRM for your company. You'll
            become the admin and can invite team members later.
          </p>

          {formData.createOrganization && (
            <div className="space-y-3">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="organizationName"
                >
                  Organization Name *
                </label>
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  required={formData.createOrganization}
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="e.g., Acme Corp"
                  className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  htmlFor="organizationDescription"
                >
                  Organization Description (Optional)
                </label>
                <textarea
                  id="organizationDescription"
                  name="organizationDescription"
                  value={formData.organizationDescription}
                  onChange={handleChange}
                  placeholder="Brief description of your organization"
                  rows={2}
                  className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring focus:ring-primary resize-none"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded bg-primary px-4 py-2 font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring focus:ring-primary mb-4"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-sm text-primary hover:text-primary-dark"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
    </div>
  );
}
