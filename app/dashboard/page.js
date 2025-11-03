"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/header";
import Menu from "../components/menu";
import { fetchDashboardData } from "../services/orderService";

export default function Dashboard() {
    const [stats, setStats] = useState({
        product_count: 0,
        order_count: 0,
        total_deliverd: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const data = await fetchDashboardData();
                setStats(data);
            } catch (err) {
                console.error("Dashboard API Error:", err);
                setError(err.message || "Failed to load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 bg-white shadow-sm">
                <Menu />
            </aside>

            <main className="flex-1">
                <Header />

                <div className="p-6">
                    <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                        Dashboard Overview
                    </h1>

                    {loading ? (
                        <div className="text-center text-gray-500 py-10">
                            Loading dashboard data...
                        </div>
                    ) : error ? (
                        <div className="text-center text-red-500 py-10">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* 🟢 Total Products */}
                            <Card
                                title="Total Products"
                                value={stats.product_count}
                                color="green"
                            />

                            {/* 🔵 Total Orders */}
                            <Card title="Total Orders" value={stats.order_count} color="blue" />

                            {/* 🟡 Total Delivered */}
                            <Card
                                title="Total Delivered"
                                value={stats.total_deliverd}
                                color="yellow"
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

/* ✅ Reusable Card Component */
const Card = ({ title, value, color }) => {
    const colorClasses = {
        green: "border-green-500",
        blue: "border-blue-500",
        yellow: "border-yellow-500",
    };

    return (
        <div
            className={`bg-white p-5 rounded-lg shadow-md border-l-4 ${colorClasses[color]}`}
        >
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <div className="mt-2 flex justify-between items-center">
                <span className="text-3xl font-bold text-gray-900">{value}</span>
            </div>
            <p className="mt-2 text-gray-500">Updated just now</p>
        </div>
    );
};
