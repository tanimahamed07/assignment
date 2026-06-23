"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Preorder = {
  id: number;
  name: string;
  products: number;
  preorderWhen: string;
  startsAt: string;
  endsAt: string | null;
  status: boolean;
  createdAt: string;
};

type FilterType = "all" | "active" | "inactive";
type SortByType = "name" | "products" | "startsAt";
type SortOrderType = "asc" | "desc";

export default function PreordersPage() {
  const [preorders, setPreorders] = useState<Preorder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and sorting
  const [filter, setFilter] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortByType>("name");
  const [sortOrder, setSortOrder] = useState<SortOrderType>("asc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [limit] = useState(10);

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Loading states for individual toggles
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set());

  // Delete state
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // Fetch preorders
  const fetchPreorders = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/preorders/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filter,
          sortBy,
          sortOrder,
          page: currentPage,
          limit,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch preorders");
      }

      const data = await response.json();
      setPreorders(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalCount(data.pagination.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreorders();
    setSelectedIds(new Set());
    setSelectAll(false);
  }, [filter, sortBy, sortOrder, currentPage]);

  // Toggle status
  const toggleStatus = async (id: number, currentStatus: boolean) => {
    // Add to toggling set to show loading state
    setTogglingIds((prev) => new Set(prev).add(id));

    try {
      const response = await fetch(`/api/preorders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: !currentStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      // Update local state immediately on success
      setPreorders((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: !currentStatus } : p)),
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      // Remove from toggling set
      setTogglingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Delete preorder
  const deletePreorder = async (id: number, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${name}"?\n\nThis action cannot be undone.`,
      )
    ) {
      return;
    }

    // Add to deleting set to show loading state
    setDeletingIds((prev) => new Set(prev).add(id));

    try {
      const response = await fetch(`/api/preorders/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete preorder");
      }

      // Remove from local state immediately on success
      setPreorders((prev) => prev.filter((p) => p.id !== id));

      // Update counts
      setTotalCount((prev) => prev - 1);

      // Show success toast
      showToast(`"${name}" successfully deleted`, "success");

      // If current page is now empty and it's not the first page, go to previous page
      if (preorders.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else if (preorders.length === 1) {
        // Refresh if it was the last item on the only page
        fetchPreorders();
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete preorder",
        "error",
      );
    } finally {
      // Remove from deleting set
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Show toast notification
  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000); // Auto-hide after 4 seconds
  };

  // Checkbox handlers
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(preorders.map((p) => p.id)));
    }
    setSelectAll(!selectAll);
  };

  const toggleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
    setSelectAll(newSelected.size === preorders.length && preorders.length > 0);
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No end date";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Preorder Management
          </h1>
          <p className="text-gray-600">
            Manage your preorder campaigns and inventory
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setFilter("all");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => {
                  setFilter("active");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === "active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => {
                  setFilter("inactive");
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  filter === "inactive"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Inactive
              </button>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2 items-center">
              <label className="text-sm font-medium text-gray-700">
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortByType);
                  setCurrentPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Name</option>
                <option value="products">Products</option>
                <option value="startsAt">Start Date</option>
              </select>
              <button
                onClick={() => {
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
                className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Selected Actions */}
          {selectedIds.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                {selectedIds.size} item(s) selected
              </p>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading preorders...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={fetchPreorders}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : preorders.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">No preorders found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={toggleSelectAll}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Preorder When
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Starts At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Ends At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preorders.map((preorder) => (
                      <tr
                        key={preorder.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedIds.has(preorder.id) ? "bg-blue-50" : ""
                        }`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(preorder.id)}
                            onChange={() => toggleSelectOne(preorder.id)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {preorder.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {preorder.products}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {preorder.preorderWhen.replace(/_/g, " ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(preorder.startsAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(preorder.endsAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="relative inline-flex items-center">
                            <button
                              onClick={() =>
                                toggleStatus(preorder.id, preorder.status)
                              }
                              disabled={togglingIds.has(preorder.id)}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                                preorder.status ? "bg-green-600" : "bg-gray-300"
                              }`}
                              title={preorder.status ? "Active" : "Inactive"}
                            >
                              {togglingIds.has(preorder.id) ? (
                                <span className="absolute inset-0 flex items-center justify-center">
                                  <svg
                                    className="animate-spin h-4 w-4 text-white"
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
                                </span>
                              ) : (
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    preorder.status
                                      ? "translate-x-6"
                                      : "translate-x-1"
                                  }`}
                                />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex gap-2 justify-end">
                            <Link
                              href={`/preorders/${preorder.id}/edit`}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Edit"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </Link>
                            <button
                              onClick={() =>
                                deletePreorder(preorder.id, preorder.name)
                              }
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete"
                            >
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Add New Button */}
        <div className="mt-6">
          <Link
            href="/preorders/new"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Preorder
          </Link>
        </div>
      </div>
    </div>
  );
}
