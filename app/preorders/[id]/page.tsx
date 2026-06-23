"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type PreorderFormData = {
  name: string;
  products: number;
  preorderWhen: string;
  startsAt: string;
  endsAt: string;
  status: boolean;
};

export default function PreorderFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<PreorderFormData>({
    name: "",
    products: 1,
    preorderWhen: "regardless_of_stock",
    startsAt: "",
    endsAt: "",
    status: true,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof PreorderFormData, string>>
  >({});

  useEffect(() => {
    params.then((p) => {
      setId(p.id);
      const editMode = p.id !== "new";
      setIsEditMode(editMode);

      if (editMode) {
        fetchPreorder(p.id);
      } else {
        setLoading(false);
      }
    });
  }, []);

  const fetchPreorder = async (preorderId: string) => {
    try {
      const response = await fetch(`/api/preorders/${preorderId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch preorder");
      }

      const result = await response.json();
      const preorder = result.data;

      // Convert ISO dates to YYYY-MM-DDTHH:MM format for datetime-local input
      const formatDateForInput = (dateString: string | null) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        name: preorder.name,
        products: preorder.products,
        preorderWhen: preorder.preorderWhen,
        startsAt: formatDateForInput(preorder.startsAt),
        endsAt: formatDateForInput(preorder.endsAt),
        status: preorder.status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load preorder");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PreorderFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.products < 1) {
      newErrors.products = "Products must be at least 1";
    }

    if (!formData.startsAt) {
      newErrors.startsAt = "Start date is required";
    }

    if (formData.endsAt && formData.startsAt) {
      const start = new Date(formData.startsAt);
      const end = new Date(formData.endsAt);
      if (end <= start) {
        newErrors.endsAt = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const url = isEditMode
        ? `/api/preorders/${id}/update`
        : "/api/preorders/create";

      const method = "PUT" as const;

      // Convert datetime-local format back to ISO
      const payload = {
        ...formData,
        startsAt: formData.startsAt
          ? new Date(formData.startsAt).toISOString()
          : "",
        endsAt: formData.endsAt
          ? new Date(formData.endsAt).toISOString()
          : null,
      };

      const response = await fetch(url, {
        method: isEditMode ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save preorder");
      }

      // Redirect to list page on success
      router.push("/preorders");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preorder");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name as keyof PreorderFormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof PreorderFormData];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading preorder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/preorders"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Preorders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Preorder" : "Create New Preorder"}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode
              ? "Update the preorder details below"
              : "Fill in the details to create a new preorder"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., iPhone 16 Pro Max"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Products Field */}
            <div>
              <label
                htmlFor="products"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Number of Products <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                id="products"
                name="products"
                value={formData.products}
                onChange={handleChange}
                min="1"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.products ? "border-red-300" : "border-gray-300"
                }`}
                placeholder="e.g., 100"
              />
              {errors.products && (
                <p className="mt-1 text-sm text-red-600">{errors.products}</p>
              )}
            </div>

            {/* Preorder When Dropdown */}
            <div>
              <label
                htmlFor="preorderWhen"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Preorder When <span className="text-red-600">*</span>
              </label>
              <select
                id="preorderWhen"
                name="preorderWhen"
                value={formData.preorderWhen}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="regardless_of_stock">Regardless of Stock</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">
                Currently only "Regardless of Stock" is supported
              </p>
            </div>

            {/* Start Date Picker */}
            <div>
              <label
                htmlFor="startsAt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Start Date & Time <span className="text-red-600">*</span>
              </label>
              <input
                type="datetime-local"
                id="startsAt"
                name="startsAt"
                value={formData.startsAt}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.startsAt ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.startsAt && (
                <p className="mt-1 text-sm text-red-600">{errors.startsAt}</p>
              )}
            </div>

            {/* End Date Picker */}
            <div>
              <label
                htmlFor="endsAt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                End Date & Time{" "}
                <span className="text-gray-500 font-normal">(optional)</span>
              </label>
              <input
                type="datetime-local"
                id="endsAt"
                name="endsAt"
                value={formData.endsAt}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.endsAt ? "border-red-300" : "border-gray-300"
                }`}
              />
              {errors.endsAt && (
                <p className="mt-1 text-sm text-red-600">{errors.endsAt}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Leave empty for no end date
              </p>
            </div>

            {/* Status Toggle */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Active
                </span>
              </label>
              <p className="mt-1 text-sm text-gray-500">
                When active, this preorder will be visible to customers
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {isEditMode ? "Updating..." : "Creating..."}
                </span>
              ) : (
                <span>
                  {isEditMode ? "Update Preorder" : "Create Preorder"}
                </span>
              )}
            </button>
            <Link
              href="/preorders"
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors text-center"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
