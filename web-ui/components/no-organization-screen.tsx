"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { logout, createOrganization } from "@/lib/auth";

interface NoOrganizationScreenProps {
  user: User;
  onOrganizationCreated: () => void;
}

export function NoOrganizationScreen({
  user,
  onOrganizationCreated,
}: NoOrganizationScreenProps) {
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationDescription: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogout = async () => {
    await logout();
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.organizationName.trim()) {
      setError("Organization name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await createOrganization(
        formData.organizationName,
        formData.organizationDescription
      );
      // Organization created successfully, notify parent to refresh user data
      onOrganizationCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create organization");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        {!showCreateForm ? (
          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.866-.833-2.635 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Welcome, {user.first_name || user.username}!
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                You don't belong to any organization yet.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border-l-4 border-blue-400 bg-blue-50 p-4">
                <div className="text-left">
                  <h3 className="text-sm font-medium text-blue-800">
                    Contact Your Company Admin
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Ask your company's administrator to add you to your
                      organization in the Sales CRM system.
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">OR</div>

              <button
                onClick={() => setShowCreateForm(true)}
                className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Create New Organization
              </button>

              <button
                onClick={handleLogout}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="mb-4 text-sm text-gray-600 hover:text-gray-800"
              >
                ← Back
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Organization
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Set up your company's Sales CRM workspace
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div>
                <label
                  htmlFor="organizationName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Organization Name *
                </label>
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  required
                  value={formData.organizationName}
                  onChange={handleChange}
                  placeholder="e.g., Acme Corporation"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="organizationDescription"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description (Optional)
                </label>
                <textarea
                  id="organizationDescription"
                  name="organizationDescription"
                  value={formData.organizationDescription}
                  onChange={handleChange}
                  placeholder="Brief description of your organization"
                  rows={3}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Organization"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
