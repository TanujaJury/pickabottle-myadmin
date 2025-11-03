"use client";
import React, { useEffect, useState } from "react";
import { fetchOrders, fetchInvoice } from "../services/orderService";
import Header from "../components/header";
import Menu from "../components/menu";
import { useRouter } from "next/navigation";

export default function OrderList() {
    const router = useRouter();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [filter, setFilter] = useState("All");
    const [total, setTotal] = useState(0);
    const limit = 10;

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const status = filter === "All" ? "" : filter.toLowerCase();
                const data = await fetchOrders(page, limit, status);
                setOrders(data.orders || data.order); // Adjust if API returns differently
                setTotal(data.total || data.orderTotal || 0);
            } catch (err) {
                console.error("❌ Order Load Error:", err.message);
                setError("Error fetching orders");
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, [page, filter]);

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPage(1);
    };

    const handleViewOrder = (orderId) => {
        router.push(`/orders/${orderId}`);
    };

    if (loading)
        return <div className="p-10 text-gray-600 text-center">Loading orders...</div>;

    if (error)
        return <div className="p-10 text-red-500 text-center">{error}</div>;

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm">
                <Menu />
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <Header />

                <div className="p-8">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                        Order List
                    </h1>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white shadow rounded-xl p-5 border-l-4 border-green-500">
                            <h3 className="text-sm text-gray-500">Total Orders</h3>
                            <p className="text-2xl font-semibold text-gray-800">1,240</p>
                            <span className="text-xs text-green-500">↑ 1.4% Last 7 days</span>
                        </div>
                        <div className="bg-white shadow rounded-xl p-5 border-l-4 border-blue-500">
                            <h3 className="text-sm text-gray-500">New Orders</h3>
                            <p className="text-2xl font-semibold text-gray-800">240</p>
                            <span className="text-xs text-green-500">↑ 2.0% Last 7 days</span>
                        </div>
                        <div className="bg-white shadow rounded-xl p-5 border-l-4 border-green-600">
                            <h3 className="text-sm text-gray-500">Completed Orders</h3>
                            <p className="text-2xl font-semibold text-gray-800">960</p>
                            <span className="text-xs text-green-500">↑ 8.5% Last 7 days</span>
                        </div>
                        <div className="bg-white shadow rounded-xl p-5 border-l-4 border-red-500">
                            <h3 className="text-sm text-gray-500">Canceled Orders</h3>
                            <p className="text-2xl font-semibold text-gray-800">87</p>
                            <span className="text-xs text-red-500">↓ 5% Last 7 days</span>
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex space-x-4">
                            {["All", "Delivered", "Pending", "Cancelled"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => handleFilterChange(tab)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === tab
                                        ? "bg-green-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* <div>
                            <input
                                type="text"
                                placeholder="Search order or report"
                                className="border px-3 py-2 rounded-lg text-sm w-64 focus:ring-2 focus:ring-green-500 focus:outline-none"
                            />
                        </div> */}
                    </div>

                    {/* Order Table */}
                    <div className="bg-white shadow rounded-xl overflow-hidden">
                        <table className="min-w-full text-sm text-gray-700">
                            <thead className="bg-gray-100 text-gray-600 text-left">
                                <tr>
                                    <th className="px-5 py-5">Order ID</th>
                                    <th className="px-5 py-5">Customer ID</th>
                                    <th className="px-5 py-5">Product</th>
                                    <th className="px-5 py-5">Date & Time</th>
                                    <th className="px-5 py-5">Qty</th>
                                    <th className="px-5 py-5">Payment Status</th>
                                    <th className="px-5 py-5">Shipping</th>
                                    <th className="px-5 py-5">Action</th>
                                    <th className="px-5 py-5">Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-5 py-6 text-green-600 font-semibold">
                                            #{order.id.toString().padStart(6, "0")}
                                        </td>
                                        <td className="px-5 py-6">#CUST{order.user_id}</td>
                                        <td className="px-5 py-6">
                                            {order.order_Details?.[0]?.product_id
                                                ? `Product ${order.order_Details[0].product_id}`
                                                : "—"}
                                        </td>
                                        <td className="px-5 py-6">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-6">
                                            {order.order_Details?.reduce(
                                                (sum, item) => sum + (item.quantity || 0),
                                                0
                                            )}
                                        </td>
                                        <td className="px-5 py-6">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${order.payment_status === "paid"
                                                    ? "bg-green-100 text-green-700"
                                                    : order.payment_status === "unpaid"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {order.payment_status || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-6">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${order.order_status === "delivered"
                                                    ? "bg-green-100 text-green-700"
                                                    : order.order_status === "pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : order.order_status === "cancelled"
                                                            ? "bg-red-100 text-red-700"
                                                            : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                {order.order_status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-6 text-center">
                                            <button
                                                type="button"
                                                onClick={() => handleViewOrder(order.id)}
                                                className="text-gray-500 hover:text-green-600 transition"
                                            >
                                                👁️
                                            </button>
                                        </td>
                                        <td className="px-5 py-6 text-center">
                                            <a
                                                type="button"
                                                href={`/invoice/${order.id}`}
                                                target="_blank"
                                            >
                                                📄
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ✅ Updated Pagination (Matches Transaction Page) */}
                    <div className="flex flex-col items-center mt-10 gap-2">
                        <div className="flex justify-center items-center space-x-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className={`border rounded-md px-4 py-2 text-sm font-medium transition ${page === 1
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                ← Previous
                            </button>

                            {/* Page Numbers */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .slice(Math.max(0, page - 3), Math.min(totalPages, page + 2))
                                .map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setPage(num)}
                                        className={`w-8 h-8 border rounded-md text-sm font-medium ${page === num
                                            ? "bg-green-100 text-green-700 border-green-400"
                                            : "hover:bg-gray-100 text-gray-700"
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}

                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className={`border rounded-md px-4 py-2 text-sm font-medium transition ${page === totalPages
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                Next →
                            </button>
                        </div>

                        {/* Showing Range */}
                        <p className="text-sm text-gray-500">
                            Showing{" "}
                            <span className="font-medium text-gray-700">
                                {(page - 1) * limit + 1}
                            </span>
                            –
                            <span className="font-medium text-gray-700">
                                {Math.min(page * limit, total)}
                            </span>{" "}
                            of {total}
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
