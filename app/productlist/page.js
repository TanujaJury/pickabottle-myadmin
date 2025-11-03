"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "../components/header";
import Menu from "../components/menu";
import Pagination from "../components/pagination";
import { Search, SquarePen, Trash2, Plus } from "lucide-react";
import { getAdminProducts, deleteProduct } from "../services/productService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProductList() {
    const [products, setProducts] = useState([]);
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

    // Helper: pick correct ID
    const getId = (item) => item._id || item.id;

    // ✅ Fetch paginated products
    const fetchProducts = async (pageNumber = 1) => {
        setLoading(true);
        try {
            const res = await getAdminProducts(pageNumber, limit);
            if (res?.success && Array.isArray(res.data)) {
                setProducts(res.data);
                const count = Number(res.count || 0);
                setTotalCount(count);
                setTotalPages(Math.max(1, Math.ceil(count / Number(limit))));
                setPage(pageNumber);
            } else {
                toast.error("Unexpected API response");
            }
        } catch (err) {
            console.error("❌ Failed to fetch products:", err);
            toast.error("Error fetching products");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts(page);
    }, []);

    // ✅ Delete product
    const handleDelete = async () => {
        if (!deletingId) {
            toast.warn("No product selected to delete!");
            return;
        }
        setDeleting(true);
        try {
            const res = await deleteProduct(deletingId);
            if (res?.success) {
                toast.success("🗑️ Product deleted successfully!");
                await fetchProducts(page); // Refresh list
            } else {
                toast.error(res?.message || "Failed to delete product");
            }
        } catch (err) {
            console.error("❌ Error deleting product:", err);
            toast.error("Error deleting product");
        } finally {
            setDeleting(false);
            setDialogOpen(false);
            setDeletingId(null);
        }
    };

    // ✅ Filter search
    const filteredProducts = products.filter(
        (p) =>
            p.product_name?.toLowerCase().includes(search.toLowerCase()) ||
            p.product_description?.toLowerCase().includes(search.toLowerCase())
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
                        Product List
                    </h1>
                    <Link href="/product">
                        <button className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                            <Plus className="w-5 h-5" />
                            Add Product
                        </button>
                    </Link>
                </div>

                {/* Search + Filter */}
                <div className="bg-white m-4 p-5 rounded-md shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 ml-8">
                        <div className="bg-green-100 px-5 py-2 rounded-md">
                            <ul className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-700">
                                <li>
                                    <button className="px-3 py-1 rounded-md bg-white text-black">
                                        All Products ({totalCount})
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Search Input */}
                        <div className="relative w-full max-w-md mx-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-full bg-gray-200 pl-10 pr-4 py-2 text-gray-700 placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-600"
                            />
                        </div>
                    </div>

                    {/* Product Table */}
                    <div className="mt-8 mx-auto overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">
                                Loading products...
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <table className="min-w-full text-sm text-gray-700">
                                <thead className="bg-green-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Product Name
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Description
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Created Date
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Amount
                                        </th>
                                        <th className="px-4 py-3 text-left font-semibold">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredProducts.map((item) => {
                                        const pid = getId(item);
                                        return (
                                            <tr key={pid} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{item.product_name}</td>
                                                <td className="px-4 py-3">{item.product_description}</td>
                                                <td className="px-4 py-3">
                                                    {item.createdAt
                                                        ? new Date(item.createdAt).toLocaleDateString()
                                                        : "-"}
                                                </td>
                                                <td className="px-4 py-3">
                                                    ${item.productselling_price ||
                                                        item.product_price ||
                                                        "0"}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        {/* EDIT BUTTON */}
                                                        <Link href={`/product?edit=${pid}`}>
                                                            <button
                                                                aria-label="Edit"
                                                                className="p-2 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-gray-600"
                                                            >
                                                                <SquarePen className="w-5 h-5 text-gray-400" />
                                                            </button>
                                                        </Link>

                                                        {/* DELETE BUTTON */}
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setDeletingId(pid);
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
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-10 text-gray-500">
                                No products found.
                            </div>
                        )}
                    </div>

                    {/* ✅ Pagination */}
                    <div className="mt-10">
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={(newPage) => fetchProducts(newPage)}
                        />

                        <div className="text-sm text-gray-600 text-center mt-3">
                            Showing {(page - 1) * limit + 1}–
                            {Math.min(page * limit, totalCount)} of {totalCount}
                        </div>
                    </div>
                </div>
            </main>

            {/* 🗑️ Delete Confirmation Dialog */}
            {dialogOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Confirm Deletion
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this product?
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
