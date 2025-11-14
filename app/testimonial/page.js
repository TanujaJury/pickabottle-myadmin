"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Plus, SquarePen, Trash2 } from "lucide-react";

import Header from "../components/header";
import Menu from "../components/menu";
import {
    fetchTestimonials,
    deleteTestimonial,
} from "../services/testimonialService";

export default function TestimonialListPage() {
    const [testimonialList, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const loadTestimonials = async () => {
        try {
            setLoading(true);
            const res = await fetchTestimonials();
            setTestimonials(res?.data || []);
        } catch (error) {
            console.error("❌ Error loading testimonials:", error);
            toast.error("Failed to load testimonials");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTestimonials();
    }, []);

    const handleDelete = async () => {
        if (!deletingId) return;

        setDeleting(true);
        try {
            const res = await deleteTestimonial(deletingId);
            if (res?.success) {
                toast.success(res?.message || "Testimonial deleted");
                await loadTestimonials();
            } else {
                toast.error(res?.message || "Failed to delete testimonial");
            }
        } catch (error) {
            console.error("❌ Error deleting testimonial:", error);
            toast.error("Error deleting testimonial");
        } finally {
            setDeleting(false);
            setDialogOpen(false);
            setDeletingId(null);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ToastContainer position="top-right" autoClose={2200} />

            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm">
                <Menu />
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <Header />

                {/* Top Bar */}
                <div className="flex items-center justify-between px-8 mt-8">
                    <h1 className="text-2xl font-semibold text-green-700">
                        Testimonial List
                    </h1>

                    <Link href="/testimonial/create">
                        <button className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700">
                            <Plus className="w-4 h-4" />
                            Add Testimonial
                        </button>
                    </Link>
                </div>

                {/* Table */}
                <div className="mt-6 mx-8 overflow-x-auto">
                    {loading ? (
                        <div className="text-center py-10 text-gray-500">
                            Loading testimonials...
                        </div>
                    ) : testimonialList.length > 0 ? (
                        <table className="min-w-full text-sm text-gray-700">
                            <thead className="bg-green-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold">Profile</th>
                                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                                    <th className="px-4 py-3 text-left font-semibold">
                                        Description
                                    </th>
                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {testimonialList.map((t) => (
                                    <tr key={t.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${t.profile_url}`}
                                                alt={t.name}
                                                className="w-10 h-10 rounded-full object-cover border"
                                            />
                                        </td>

                                        <td className="px-4 py-3 font-medium text-gray-800">
                                            {t.name}
                                        </td>

                                        <td className="px-4 py-3 max-w-md">
                                            <p className="truncate text-gray-600">
                                                {t.description || t.message || "—"}
                                            </p>
                                        </td>

                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {/* EDIT */}
                                                <Link
                                                    href={{
                                                        pathname: "/testimonial/create",
                                                        query: { edit: t.id },
                                                    }}
                                                >
                                                    <button
                                                        aria-label="Edit"
                                                        className="p-2 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-gray-600"
                                                    >
                                                        <SquarePen className="w-5 h-5 text-gray-500" />
                                                    </button>
                                                </Link>

                                                {/* DELETE */}
                                                <button
                                                    onClick={() => {
                                                        setDeletingId(t.id);
                                                        setDialogOpen(true);
                                                    }}
                                                    aria-label="Delete"
                                                    className="p-2 rounded-md hover:bg-red-50 text-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            No testimonials found.
                        </div>
                    )}
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {dialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this testimonial?
                        </p>

                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className={`px-4 py-2 rounded text-white ${deleting
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-red-600 hover:bg-red-700"
                                    }`}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
