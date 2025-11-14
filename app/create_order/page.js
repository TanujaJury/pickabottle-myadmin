"use client";

import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAdminProducts } from "../services/productService";
import { createPOS } from "../services/orderService";
import Header from "../components/header";
import Menu from "../components/menu";
import { PlusCircle, Trash2 } from "lucide-react";

export default function CreateOrder() {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
    });

    const DEFAULT_TAX_RATE = 0.18;

    useEffect(() => {
        (async () => {
            try {
                const res = await getAdminProducts();
                if (res?.success && Array.isArray(res.data)) {
                    setProducts(res.data);
                } else {
                    toast.error("Failed to load products");
                }
            } catch (e) {
                console.error(e);
                toast.error("Error fetching products");
            }
        })();
    }, []);

    const getBasePrice = (p) => {
        const selling =
            Number(p?.productselling_price) ||
            Number(p?.selling_price) ||
            Number(p?.product_selling_price);
        const mrp =
            Number(p?.product_price) ||
            Number(p?.Price) ||
            Number(p?.mrp);
        return Number.isFinite(selling) && selling > 0
            ? selling
            : Number.isFinite(mrp)
                ? mrp
                : 0;
    };

    const getVariantPrice = (v) => {
        const selling = Number(v?.selling_price);
        const mrp = Number(v?.Price) || Number(v?.mrp);
        return Number.isFinite(selling) && selling > 0
            ? selling
            : Number.isFinite(mrp)
                ? mrp
                : 0;
    };

    const getTaxRate = (obj) => {
        const rate =
            Number(obj?.tax_rate) ||
            Number(obj?.gst_rate) ||
            Number(obj?.taxRate);
        return Number.isFinite(rate) && rate >= 0 ? rate : DEFAULT_TAX_RATE;
    };

    const computeTotals = (unitPrice, qty, rate) => {
        const subtotal = (Number(unitPrice) || 0) * (Number(qty) || 1);
        const tax = +(subtotal * rate).toFixed(2);
        const total = +(subtotal + tax).toFixed(2);
        return { tax, total };
    };

    const handleAddProduct = (productId) => {
        if (!productId) return;

        const selected = products.find(
            (p) => String(p._id || p.id) === String(productId)
        );
        if (!selected) return;

        const already = selectedProducts.some(
            (sp) => String(sp.product_id) === String(selected._id || selected.id)
        );
        if (already) {
            toast.info("Product already added");
            return;
        }

        const variants =
            selected?.product_varients || selected?.product_variants || [];
        const hasVariants = Array.isArray(variants) && variants.length > 0;

        let initialPrice = 0;
        let initialTax = 0;
        let initialTotal = 0;
        const qty = 1;
        let taxRateToUse = getTaxRate(selected);

        if (!hasVariants) {
            initialPrice = getBasePrice(selected);
            const totals = computeTotals(initialPrice, qty, taxRateToUse);
            initialTax = totals.tax;
            initialTotal = totals.total;
        }

        setSelectedProducts((prev) => [
            ...prev,
            {
                product_id: selected._id || selected.id,
                product_name: selected.product_name,
                product_variants: variants,
                selected_variant: "",
                quantity: qty,
                unit_price: hasVariants ? 0 : initialPrice,
                tax_rate: taxRateToUse,
                tax: initialTax,
                total_price: initialTotal,
            },
        ]);
    };

    const handleVariantChange = (productId, variantId) => {
        setSelectedProducts((prev) =>
            prev.map((row) => {
                if (String(row.product_id) !== String(productId)) return row;

                const variant = row.product_variants.find(
                    (v) => String(v.id) === String(variantId)
                );
                const price = getVariantPrice(variant);
                const rate = getTaxRate(variant ?? row);
                const { tax, total } = computeTotals(price, row.quantity, rate);

                return {
                    ...row,
                    selected_variant: variantId,
                    unit_price: price,
                    tax_rate: rate,
                    tax,
                    total_price: total,
                };
            })
        );
    };

    const handleQuantityChange = (productId, qtyValue) => {
        setSelectedProducts((prev) =>
            prev.map((row) => {
                if (String(row.product_id) !== String(productId)) return row;
                const qty = Math.max(1, Number(qtyValue) || 1);
                const { tax, total } = computeTotals(
                    row.unit_price,
                    qty,
                    row.tax_rate
                );
                return { ...row, quantity: qty, tax, total_price: total };
            })
        );
    };

    const handleRemoveProduct = (productId) => {
        setSelectedProducts((prev) =>
            prev.filter((row) => String(row.product_id) !== String(productId))
        );
    };

    const grandTotal = selectedProducts.reduce(
        (sum, r) => sum + (Number(r.total_price) || 0),
        0
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedProducts.length === 0) {
            toast.warn("Please add at least one product");
            return;
        }

        const payload = {
            name: formData.name,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            address1: formData.address1,
            address2: formData.address2,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            pincode: Number(formData.pincode),
            products: selectedProducts.map((p) => ({
                product_id: p.product_id,
                product_variant_id: p.selected_variant || undefined,
                quantity: p.quantity,
            })),
        };

        try {
            const data = await createPOS(payload);
            if (data?.success) {
                toast.success("✅ POS created successfully!");
                setSelectedProducts([]);
                setFormData({
                    name: "",
                    email: "",
                    phoneNumber: "",
                    address1: "",
                    address2: "",
                    city: "",
                    state: "",
                    country: "",
                    pincode: "",
                });
            } else {
                toast.error(data?.message || "Failed to create POS");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error submitting order");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ToastContainer position="top-right" autoClose={2200} />

            <aside className="w-64 bg-white shadow-sm">
                <Menu />
            </aside>

            <main className="flex-1">
                <Header />

                <div className="max-w-5xl mx-auto bg-white shadow-md rounded-lg p-6 mt-6">
                    <h1 className="text-2xl font-bold text-green-700 mb-6">
                        Create Order (POS)
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "name",
                                "email",
                                "phoneNumber",
                                "address1",
                                "address2",
                                "city",
                                "state",
                                "country",
                                "pincode",
                            ].map((field) => (
                                <input
                                    key={field}
                                    type={
                                        field === "email"
                                            ? "email"
                                            : field === "pincode"
                                                ? "number"
                                                : "text"
                                    }
                                    placeholder={
                                        field.charAt(0).toUpperCase() + field.slice(1)
                                    }
                                    value={formData[field]}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            [field]: e.target.value,
                                        })
                                    }
                                    className="border rounded-md p-2 w-full"
                                    required={!["address2"].includes(field)}
                                />
                            ))}
                        </div>

                        {/* Product Selection */}
                        <div className="mt-6">
                            <h2 className="text-lg font-semibold mb-2">
                                Add Products
                            </h2>

                            <div className="flex gap-2 items-center mb-4">
                                <select
                                    onChange={(e) => handleAddProduct(e.target.value)}
                                    className="border p-2 rounded-md w-1/2"
                                >
                                    <option value="">Select Product</option>
                                    {Array.isArray(products) &&
                                        products.map((p) => (
                                            <option
                                                key={p._id || p.id}
                                                value={p._id || p.id}
                                            >
                                                {p.product_name}
                                            </option>
                                        ))}
                                </select>

                            </div>

                            {/* Selected Products Table */}
                            {selectedProducts.length > 0 && (
                                <table className="w-full border text-sm">
                                    <thead className="bg-green-100 text-gray-700">
                                        <tr>
                                            <th className="p-2 text-left">Product</th>
                                            <th className="p-2 text-left">Variant</th>
                                            <th className="p-2 text-left">Qty</th>
                                            <th className="p-2 text-left">Unit Price</th>
                                            <th className="p-2 text-left">Tax</th>
                                            <th className="p-2 text-left">Total</th>
                                            <th className="p-2 text-left">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedProducts.map((row) => {
                                            const hasVariants =
                                                Array.isArray(row.product_variants) &&
                                                row.product_variants.length > 0;

                                            return (
                                                <tr
                                                    key={row.product_id}
                                                    className="border-b"
                                                >
                                                    <td className="p-2">
                                                        {row.product_name}
                                                    </td>

                                                    <td className="p-2">
                                                        {hasVariants ? (
                                                            <select
                                                                value={
                                                                    row.selected_variant
                                                                }
                                                                onChange={(e) =>
                                                                    handleVariantChange(
                                                                        row.product_id,
                                                                        e.target.value
                                                                    )
                                                                }
                                                                className="border rounded p-1"
                                                            >
                                                                <option value="">
                                                                    Select Variant
                                                                </option>
                                                                {row.product_variants.map(
                                                                    (v) => (
                                                                        <option
                                                                            key={v.id}
                                                                            value={v.id}
                                                                        >
                                                                            {v.quntity ||
                                                                                v.quntity ||
                                                                                `#${v.id}`}
                                                                        </option>
                                                                    )
                                                                )}
                                                            </select>
                                                        ) : (
                                                            <span className="text-gray-500">
                                                                No Variant
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="p-2">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={row.quantity}
                                                            onChange={(e) =>
                                                                handleQuantityChange(
                                                                    row.product_id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="w-20 border rounded p-1"
                                                        />
                                                    </td>

                                                    <td className="p-2">
                                                        ${" "}
                                                        {Number(
                                                            row.unit_price || 0
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="p-2">
                                                        ${" "}
                                                        {Number(row.tax || 0).toFixed(2)}
                                                    </td>
                                                    <td className="p-2 font-semibold">
                                                        ${" "}
                                                        {Number(
                                                            row.total_price || 0
                                                        ).toFixed(2)}
                                                    </td>

                                                    <td className="p-2">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveProduct(
                                                                    row.product_id
                                                                )
                                                            }
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}

                                        <tr className="bg-gray-50 font-bold">
                                            <td
                                                colSpan={5}
                                                className="text-right p-2"
                                            >
                                                Grand Total
                                            </td>
                                            <td
                                                colSpan={2}
                                                className="p-2 text-green-700"
                                            >
                                                $ {grandTotal.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="mt-6 text-right">
                            <button
                                type="submit"
                                className="bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-600"
                            >
                                Submit Order
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
