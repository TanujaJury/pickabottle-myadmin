"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "../components/header";
import Menu from "../components/menu";
import { Search, Plus, X } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchPOS } from "../services/orderService";

/** --- helpers --- **/

// Normalize product lines regardless of backend key name
const getDetailLines = (order) => {
    if (!order) return [];
    // Common keys we saw: pos_order_details (new), products (older), order_details (fallback)
    return (
        order.pos_order_details ||
        order.products ||
        order.order_details ||
        []
    );
};

// Normalize a readable variant label (API had "quntity" typo)
const variantLabel = (v) => {
    if (!v) return "-";
    return v.quntity || v.quantity || v.varient_name || v.variant_name || `#${v.id}`;
};

// Make sure numbers are numbers
const toNum = (v, d = 0) => (Number.isFinite(Number(v)) ? Number(v) : d);

// Build derived line figures
const calcLine = (d) => {
    const qty = toNum(d?.quantity, 0);
    const unit = toNum(d?.price, 0);     // unit selling price from payload
    const tax = toNum(d?.tax, 0);       // tax for that line from payload
    const sub = +(qty * unit).toFixed(2);
    const total = +(sub + tax).toFixed(2);
    return { qty, unit, tax, sub, total };
};

// Format date for India locale
const formatDate = (iso) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function POSList() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const limit = 10;
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const getPOS = async (pageNumber = 1, searchValue = "") => {
        setLoading(true);
        try {
            const res = await fetchPOS({
                page: pageNumber,
                limit,
                search: searchValue,
            });

            // Expecting: { success, data: { total, data: [...] } }
            if (res?.success && Array.isArray(res?.data?.data)) {
                const list = res.data.data;
                const count = toNum(res.data.total, list.length);
                setOrders(list);
                setTotalCount(count);
                setTotalPages(Math.max(1, Math.ceil(count / limit)));
                setPage(pageNumber);
            } else {
                toast.error(res?.message || "Unexpected API response");
            }
        } catch (err) {
            console.error("❌ Error fetching POS:", err);
            toast.error("Error fetching POS data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getPOS(page, search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        // reset to page 1 on new search
        getPOS(1, val);
    };

    // Pre-compute detail lines for the selected order (robust to missing arrays)
    const detailLines = useMemo(() => getDetailLines(selectedOrder), [selectedOrder]);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ToastContainer position="top-right" autoClose={2000} />

            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm">
                <Menu />
            </aside>

            {/* Main */}
            <main className="flex-1">
                <Header />

                {/* Header Row */}
                <div className="flex justify-between items-center p-5">
                    <h1 className="text-2xl text-green-800 font-semibold">POS Orders</h1>
                    <Link href="/create_order">
                        <button className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                            <Plus className="w-5 h-5" />
                            Create Order
                        </button>
                    </Link>
                </div>

                {/* Search + Count */}
                <div className="bg-white m-4 p-5 rounded-md shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4 ml-8">
                        <div className="bg-green-100 px-5 py-2 rounded-md">
                            <ul className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-700">
                                <li>
                                    <button className="px-3 py-1 rounded-md bg-white text-black">
                                        All Orders ({totalCount})
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Search */}
                        <div className="relative w-full max-w-md mx-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by name, email..."
                                value={search}
                                onChange={handleSearch}
                                className="w-full rounded-full bg-gray-200 pl-10 pr-4 py-2 text-gray-700 placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-600"
                            />
                        </div>
                    </div>

                    {/* Orders Table (Name, Total Price, Status, Created At) */}
                    <div className="mt-8 mx-auto overflow-x-auto">
                        {loading ? (
                            <div className="text-center py-10 text-gray-500">
                                Loading POS orders...
                            </div>
                        ) : orders.length > 0 ? (
                            <table className="min-w-full text-sm text-gray-700 border">
                                <thead className="bg-green-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold">Name</th>
                                        <th className="px-4 py-3 text-left font-semibold">Email</th>
                                        <th className="px-4 py-3 text-left font-semibold">phoneNumber</th>
                                        <th className="px-4 py-3 text-left font-semibold">Tax</th>
                                        <th className="px-4 py-3 text-left font-semibold">Price</th>
                                        <th className="px-4 py-3 text-left font-semibold">Total Price ($)</th>
                                        <th className="px-4 py-3 text-left font-semibold">Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((o) => (
                                        <tr
                                            key={o.id}
                                            onClick={() => setSelectedOrder(o)}
                                            className="border-b hover:bg-gray-50 cursor-pointer"
                                        >
                                            <td className="px-4 py-2">{o.fullName}</td>

                                            <td className="px-4 py-2">{o.email}</td>
                                            <td className="px-4 py-2">{o.phoneNumber}</td>
                                            <td className="px-4 py-2">{o.tax}</td>
                                            <td className="px-4 py-2">{o.price}</td>
                                            <td className="px-4 py-2 font-semibold text-green-700">
                                                $ {toNum(o.totalPrice).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-2 text-gray-600">{formatDate(o.createdAt)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center py-10 text-gray-500">No orders found.</div>
                        )}
                    </div>

                    {/* Pagination (10 per page) */}
                    <div className="flex flex-col items-center mt-10 gap-2">
                        <div className="flex justify-center items-center space-x-2">
                            <button
                                onClick={() => {
                                    const newPage = Math.max(1, page - 1);
                                    setPage(newPage);
                                    getPOS(newPage, search);
                                }}
                                disabled={page === 1}
                                className={`border rounded-md px-4 py-2 text-sm font-medium transition ${page === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                                    }`}
                            >
                                ← Previous
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                                .map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => {
                                            setPage(num);
                                            getPOS(num, search);
                                        }}
                                        className={`w-8 h-8 border rounded-md text-sm font-medium ${page === num
                                            ? "bg-green-100 text-green-700 border-green-400"
                                            : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}

                            <button
                                onClick={() => {
                                    const newPage = Math.min(totalPages, page + 1);
                                    setPage(newPage);
                                    getPOS(newPage, search);
                                }}
                                disabled={page === totalPages}
                                className={`border rounded-md px-4 py-2 text-sm font-medium transition ${page === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
                                    }`}
                            >
                                Next →
                            </button>
                        </div>

                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-medium text-gray-700">{(page - 1) * limit + 1}</span>–
                            <span className="font-medium text-gray-700">
                                {Math.min(page * limit, totalCount)}
                            </span>{" "}
                            of {totalCount}
                        </p>
                    </div>
                </div>
            </main>

            {/* Modal with product details (robust to missing arrays/keys) */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative">
                        <button
                            onClick={() => setSelectedOrder(null)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-black"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <h2 className="text-xl font-semibold text-green-700 mb-2">
                            Order Details — #{selectedOrder.id}
                        </h2>

                        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                            <p><strong>Name:</strong> {selectedOrder.fullName}</p>
                            <p><strong>Status:</strong> {selectedOrder.status}</p>
                            <p>
                                <strong>Total Price:</strong>$ {toNum(selectedOrder.totalPrice).toFixed(2)}
                            </p>
                            <p><strong>Created:</strong> {formatDate(selectedOrder.createdAt)}</p>
                        </div>

                        {detailLines.length > 0 ? (
                            <table className="w-full text-sm border mt-3">
                                <thead className="bg-green-100">
                                    <tr>
                                        <th className="p-2 text-left">Product</th>
                                        <th className="p-2 text-left">Variant</th>
                                        <th className="p-2 text-right">Qty</th>
                                        <th className="p-2 text-right">Unit Price</th>
                                        <th className="p-2 text-right">Subtotal</th>
                                        <th className="p-2 text-right">Tax</th>
                                        <th className="p-2 text-right">Line Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailLines.map((d) => {
                                        const { qty, unit, tax, sub, total } = calcLine(d);
                                        const productName = d?.product?.product_name || `#${d?.product_id ?? "-"}`;
                                        return (
                                            <tr key={d.id ?? `${d.product_id}-${d.product_variant_id ?? "na"}`}>
                                                <td className="p-2">{productName}</td>
                                                <td className="p-2">{variantLabel(d?.product_varient)}</td>
                                                <td className="p-2 text-right">{qty}</td>
                                                <td className="p-2 text-right">$ {unit.toFixed(2)}</td>
                                                <td className="p-2 text-right">$ {sub.toFixed(2)}</td>
                                                <td className="p-2 text-right">$ {tax.toFixed(2)}</td>
                                                <td className="p-2 text-right font-semibold text-green-700">
                                                    $ {total.toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-gray-500 text-sm">No product details.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
