"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/header";
import Menu from "../components/menu";
import { fetchTransactions } from "../services/orderService";

export default function Transaction() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(5);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const loadTransactions = async () => {
            setLoading(true);
            setError("");
            try {
                const result = await fetchTransactions(page, limit);
                setTransactions(result.data);
                setTotal(result.total); // ✅ sets total from transaction_count
            } catch (err) {
                console.error("Transaction API Error:", err);
                setError(err.message || "Failed to load transactions");
            } finally {
                setLoading(false);
            }
        };

        loadTransactions();
    }, [page, limit]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm">
                <Menu />
            </aside>

            {/* Main Section */}
            <main className="flex-1">
                <Header />

                <div>
                    <h1 className="p-6 text-2xl text-green-800">Transaction</h1>

                    {/* Transaction Table */}
                    <div className="bg-white m-4 p-5 shadow rounded-lg">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">
                            Transaction List
                        </h2>

                        {loading ? (
                            <div className="text-center text-gray-500 py-10">Loading...</div>
                        ) : error ? (
                            <div className="text-center text-red-500 py-10">{error}</div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                No transactions found
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-gray-700">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <Th>Payment Order ID</Th>
                                                <Th>Payment ID</Th>
                                                <Th>Status</Th>
                                                <Th>Amount ($)</Th>
                                                <Th>Date &amp; Time</Th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-200">
                                            {transactions.map((t, i) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <Td>{t.payment_order_id || "—"}</Td>
                                                    <Td>{t.payment_id || "—"}</Td>
                                                    <Td>
                                                        <span
                                                            className={`inline-flex items-center rounded-full px-2 py-2.5 text-xs font-medium ${t.payment_status === "paid"
                                                                ? "bg-green-100 text-green-700 py-2.5"
                                                                : t.payment_status === "pending"
                                                                    ? "bg-yellow-100 text-yellow-700"
                                                                    : "bg-red-100 text-red-700"
                                                                }`}
                                                        >
                                                            {t.payment_status}
                                                        </span>
                                                    </Td>
                                                    <Td>${Number(t.payable_price).toFixed(2)}</Td>
                                                    <Td>
                                                        {new Date(t.createdAt).toLocaleString("en-IN", {
                                                            dateStyle: "medium",
                                                            timeStyle: "short",
                                                        })}
                                                    </Td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* ✅ Updated Pagination */}
                                <div className="flex flex-col items-center mt-6 gap-2">
                                    <div className="flex justify-center items-center space-x-2">
                                        <button
                                            onClick={() => setPage((p) => Math.max(p - 1, 1))}
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
                                            .slice(
                                                Math.max(0, page - 3),
                                                Math.min(totalPages, page + 2)
                                            )
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
                                            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                            disabled={page === totalPages}
                                            className={`border rounded-md px-4 py-2 text-sm font-medium transition ${page === totalPages
                                                ? "opacity-50 cursor-not-allowed"
                                                : "hover:bg-gray-100"
                                                }`}
                                        >
                                            Next →
                                        </button>
                                    </div>

                                    {/* Showing Count */}
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
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

/* Helper Components */
const Th = ({ children }) => (
    <th className="px-4 py-3 text-left font-semibold">{children}</th>
);

const Td = ({ children }) => (
    <td className="px-4 py-3 whitespace-nowrap">{children}</td>
);
