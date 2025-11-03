"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchOrderById, updateOrderStatus } from "../../services/orderService";
import Header from "../../components/header";
import Menu from "../../components/menu";


export const getImageUrl = (path) => {
    if (!path) return "/no-image.png";
    return `${"http://localhost:8000"}${path}`;
};

export default function OrderDetailsPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMessage, setDialogMessage] = useState("");

    useEffect(() => {
        const loadOrder = async () => {
            try {
                const one = await fetchOrderById(id);
                setOrder(one);
            } catch (err) {
                console.error("Error:", err);
                setError("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [id]);

    if (loading)
        return <div className="p-8 text-gray-600 text-center">Loading order...</div>;
    if (error || !order)
        return (
            <div className="p-8 text-red-500 text-center">
                {error || "Order not found"}
            </div>
        );

    const totalQty =
        order.order_Details?.reduce((sum, item) => sum + (item.quantity || 0), 0) ||
        0;

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm">
                <Menu />
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <Header />

                <div className="p-8 flex justify-center">
                    <div className="w-full max-w-5xl bg-white shadow rounded-xl p-8">
                        <h1 className="text-2xl font-semibold text-green-800 mb-6">
                            Order Details
                        </h1>

                        {/* Basic Info Section */}
                        <div className="grid md:grid-cols-3 gap-5 mb-6">
                            <Info title="Order ID" value={`#${String(order.id).padStart(6, "0")}`} />
                            <Info title="Customer ID" value={`#CUST${order.user_id}`} />
                            <Info title="Status" value={order.order_status} />
                            <Info title="Payment" value={order.payment_status} />
                            <Info title="Subtotal" value={`$${order.sub_total}`} />
                            <Info title="Tax" value={`$${order.tax}`} />
                            <Info title="Total" value={`$${order.total_price}`} />
                            <Info
                                title="Date"
                                value={new Date(order.createdAt).toLocaleString("en-IN")}
                            />
                        </div>

                        {/* Update Order Status */}
                        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8">
                            <h2 className="text-lg font-semibold text-gray-700 mb-3">
                                Update Order Status
                            </h2>
                            <div className="flex items-center gap-4">
                                <select
                                    value={order.order_status}
                                    onChange={(e) =>
                                        setOrder({ ...order, order_status: e.target.value })
                                    }
                                    className="border border-gray-300 rounded-md p-2 text-sm w-52"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                                <button
                                    onClick={async () => {
                                        try {
                                            await updateOrderStatus(order.id, order.order_status);
                                            setDialogMessage("✅ Order status updated successfully!");
                                            setDialogOpen(true);
                                        } catch (err) {
                                            setDialogMessage(err.message || "Failed to update order");
                                            setDialogOpen(true);
                                        }
                                    }}
                                    className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-md text-sm font-medium"
                                >
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Order Details Table */}
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                            Ordered Items
                        </h2>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="min-w-full text-sm text-gray-700">
                                <thead className="bg-gray-100 text-left text-gray-600 uppercase">
                                    <tr>
                                        <Th>Image</Th>
                                        <Th>Product</Th>
                                        <Th>Description</Th>
                                        <Th>MRP</Th>
                                        <Th>Selling</Th>
                                        <Th>Qty</Th>
                                        <Th>Total</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.order_Details?.map((item) => {
                                        const product = item.product || {};
                                        const image =
                                            product.product_images?.find((img) => img.file_url)?.file_url ||
                                            "/no-image.png";

                                        const variant =
                                            product.product_varients?.find?.(
                                                (v) => String(v.id) === String(item.product_varient_id)
                                            ) || null;

                                        const displayMrp =
                                            (variant && variant.Price) ?? item.mrp ?? product.product_price;
                                        const displaySelling =
                                            (variant && variant.selling_price) ??
                                            item.selling_price ??
                                            product.productselling_price;

                                        const variantLabel = item.product_varient_id
                                            ? `Variant #${item.product_varient_id}`
                                            : null;

                                        return (
                                            <tr key={item.id} className="border-t hover:bg-gray-50">
                                                <Td>
                                                    <img
                                                        src={getImageUrl(image)}
                                                        alt={product.product_name}
                                                        className="w-14 h-14 object-cover rounded-md border"
                                                    />
                                                </Td>

                                                <Td>
                                                    <div className="font-medium text-gray-800">
                                                        {product.product_name || `Product ${item.product_id}`}
                                                    </div>
                                                    {variantLabel && (
                                                        <span className="mt-1 inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-medium text-green-700 border border-green-100">
                                                            {variantLabel}
                                                        </span>
                                                    )}
                                                </Td>

                                                <Td className="text-gray-500">
                                                    {product.product_description || "—"}
                                                </Td>
                                                <Td>${Number(displayMrp)}</Td>
                                                <Td>${Number(displaySelling)}</Td>
                                                <Td>{item.quantity}</Td>
                                                <Td>${item.total_price}</Td>
                                            </tr>
                                        );
                                    })}

                                    <tr className="border-t font-semibold bg-gray-50">
                                        <Td colSpan={5}>Totals</Td>
                                        <Td>{totalQty}</Td>
                                        <Td>${order.total_price}</Td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ✅ Success Dialog */}
                {dialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                Order Update
                            </h2>
                            <p className="text-gray-600 mb-6">{dialogMessage}</p>
                            <button
                                onClick={() => setDialogOpen(false)}
                                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

const Info = ({ title, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="text-xs text-gray-500 uppercase">{title}</div>
        <div className="text-base font-semibold text-gray-800 mt-1">{value ?? "—"}</div>
    </div>
);

const Th = ({ children }) => (
    <th className="px-5 py-3 text-sm font-semibold">{children}</th>
);

const Td = ({ children, colSpan, className = "" }) => (
    <td className={`px-5 py-3 ${className}`} colSpan={colSpan}>
        {children}
    </td>
);
