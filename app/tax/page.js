"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/header";
import Menu from "../components/menu";
import Pagination from "../components/pagination";

import { Search, SquarePen, Trash2, Plus } from "lucide-react";

import { fetchAllTaxes, deleteTax } from "../services/taxService";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function TaxList() {
    const [taxes, setTaxes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Delete dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const getId = (item) => item._id || item.id;

    // Fetch taxes
    const fetchTaxes = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const res = await fetchAllTaxes();

            if (res?.success && Array.isArray(res.data)) {
                setTaxes(res.data);

                const count = Number(res.count || 0);
                setTotalCount(count);
                setTotalPages(Math.max(1, Math.ceil(count / limit)));
                setPage(pageNumber);
            }
        } catch (error) {
            console.error("❌ Failed to fetch taxes:", error);
            toast.error("Error fetching tax records");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTaxes(page);
    }, []);

    // Delete Tax
    const handleDelete = async () => {
        if (!deletingId) return;

        setDeleting(true);
        try {
            const res = await deleteTax(deletingId);

            if (res?.success) {
                toast.success("Tax deleted successfully");
                fetchTaxes(page);
            } else {
                toast.error("Failed to delete tax");
            }
        } catch (err) {
            console.error("❌ Delete failed:", err);
            toast.error("Error deleting tax");
        } finally {
            setDeleting(false);
            setDialogOpen(false);
            setDeletingId(null);
        }
    };

    // Search filter
    const filteredTaxes = taxes.filter(
        (t) =>
            t.country?.toLowerCase().includes(search.toLowerCase()) ||
            t.state?.toLowerCase().includes(search.toLowerCase()) ||
            String(t.country_tax)?.includes(search) ||
            String(t.state_tax)?.includes(search)
    );

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

                {/* Header Row */}
                <div className="flex justify-between items-center p-5">
                    <h1 className="p-6 text-2xl text-green-800 font-semibold">
                        Tax List
                    </h1>
                    <Link href="/tax/create">
                        <button className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                            <Plus className="w-5 h-5" />
                            Create Tax
                        </button>
                    </Link>
                </div>

                {/* Search + Filters */}
                <div className="bg-white m-4 p-5 rounded-md shadow-sm">
                    <div className="flex justify-between items-center gap-4 ml-8">
                        <div className="bg-green-100 px-5 py-2 rounded-md">
                            <button className="px-3 py-1 rounded-md bg-white text-black">
                                All Taxes ({totalCount})
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full max-w-md mx-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search taxes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-full bg-gray-200 pl-10 pr-4 py-2 text-gray-700 placeholder-gray-500
                                        outline-none focus:ring-2 focus:ring-green-600"
                            />
                        </div>
                    </div>

                    {/* Tax Table */}
                    <div className="mt-8 mx-auto overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">
                                Loading taxes...
                            </div>
                        ) : filteredTaxes.length > 0 ? (
                            <table className="min-w-full text-sm text-gray-700">
                                <thead className="bg-green-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Country
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            State
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Country Tax (%)
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            State Tax (%)
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-200">
                                    {filteredTaxes.map((item) => {
                                        const tid = getId(item);

                                        return (
                                            <tr key={tid} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{item.country}</td>
                                                <td className="px-4 py-3">{item.state}</td>
                                                <td className="px-4 py-3">{item.country_tax}%</td>
                                                <td className="px-4 py-3">{item.state_tax}%</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <Link href={`/tax?edit=${tid}`}>
                                                            <SquarePen className="w-5 h-5 text-gray-500 hover:text-blue-600 cursor-pointer" />
                                                        </Link>

                                                        <Trash2
                                                            onClick={() => {
                                                                setDeletingId(tid);
                                                                setDialogOpen(true);
                                                            }}
                                                            className="w-5 h-5 text-red-600 cursor-pointer hover:text-red-800"
                                                        />
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                No tax records found.
                            </div>
                        )}
                    </div>

                    {/* Pagination */}

                </div>
            </main>

            {/* Delete Confirmation */}
            {dialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-80 text-center shadow-lg">
                        <h2 className="text-lg font-semibold mb-3">
                            Confirm Delete
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this tax record?
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className={`px-4 py-2 text-white rounded ${deleting
                                    ? "bg-gray-400"
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
