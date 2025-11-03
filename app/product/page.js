"use client";

import React, { useState } from "react";
import Header from "../components/header";
import Menu from "../components/menu";
import { PlusCircle, X } from "lucide-react";
import {
    createProduct,
    uploadProductImage,
    createVariant,
} from "../services/productService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddProduct() {
    const [form, setForm] = useState({
        name: "",
        price: "",
        selling_price: "",
        stock: "",
        product_ingredients: "",
        description: "",
        isActive: true,
    });

    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [variants, setVariants] = useState([
        { quantity: "", price: "", selling_price: "", stock: "" },
    ]);

    // ✅ Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // ✅ Handle image selection
    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const previews = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));
        setImages((prev) => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    // ✅ Variant handlers
    const handleVariantChange = (index, e) => {
        const { name, value } = e.target;
        const newVariants = [...variants];
        newVariants[index][name] = value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([
            ...variants,
            { quantity: "", price: "", selling_price: "", stock: "" },
        ]);
    };

    const removeVariant = (index) => {
        const updated = variants.filter((_, i) => i !== index);
        setVariants(updated);
    };

    // ✅ Publish product
    const handlePublish = async () => {
        if (!form.name || !form.price) {
            toast.warn("Please enter product name and price ⚠️");
            return;
        }

        setLoading(true);
        try {
            const productPayload = {
                name: form.name,
                price: Number(form.price),
                selling_price: Number(form.selling_price) || 0,
                stock: Number(form.stock) || 0,
                product_ingredients: form.product_ingredients,
                description: form.description,
                isActive: form.isActive,
            };

            const res = await createProduct(productPayload);
            if (!res?.success) {
                toast.error(res?.message || "Failed to create product");
                setLoading(false);
                return;
            }

            const productId = res?.data?._id || res?.product_id;
            toast.success("✅ Product created successfully!");

            // 🧩 Create variants
            if (productId && variants.length > 0) {
                for (const variant of variants) {
                    if (variant.quantity) {
                        const payload = {
                            product_id: productId,
                            quantity: variant.quantity,
                            price: Number(variant.price) || 0,
                            selling_price: Number(variant.selling_price) || 0,
                            stock: Number(variant.stock) || 0,
                        };
                        await createVariant(payload);
                    }
                }
                toast.success("🧩 Variants added successfully!");
            }

            // 🖼️ Upload images
            if (productId && images.length > 0) {
                for (const img of images) {
                    const formData = new FormData();
                    formData.append("product_id", productId);
                    formData.append("file", img.file);
                    await uploadProductImage(formData);
                }
                toast.success("📸 Images uploaded successfully!");
            }

            // 🔄 Reset form
            setForm({
                name: "",
                price: "",
                selling_price: "",
                stock: "",
                product_ingredients: "",
                description: "",
                isActive: true,
            });
            setImages([]);
            setVariants([{ quantity: "", price: "", selling_price: "", stock: "" }]);
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error("❌ Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

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
                <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-green-900">
                            Add New Product
                        </h1>
                        <button
                            onClick={handlePublish}
                            disabled={loading}
                            className={`${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-800 hover:bg-green-700"
                                } text-white px-5 py-2 rounded-md text-sm font-medium`}
                        >
                            {loading ? "Publishing..." : "Publish Product"}
                        </button>
                    </div>

                    {/* GRID LAYOUT */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LEFT - DETAILS */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Basic Details
                            </h2>

                            {/* Product Name */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Spicy Cucumber Pickle"
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 mb-4 focus:ring-2 focus:ring-green-700 focus:outline-none"
                            />

                            {/* Description */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                name="description"
                                rows="3"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Crunchy cucumbers blended with fresh dill..."
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 mb-6 focus:ring-2 focus:ring-green-700 focus:outline-none"
                            ></textarea>

                            {/* Ingredients */}
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ingredients
                            </label>
                            <input
                                type="text"
                                name="product_ingredients"
                                value={form.product_ingredients}
                                onChange={handleChange}
                                placeholder="Enter ingredients"
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 mb-6 focus:ring-2 focus:ring-green-700 focus:outline-none"
                            />

                            <h2 className="text-lg font-semibold text-gray-800 mb-3">
                                Pricing
                            </h2>

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Product Price
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                placeholder="45.89"
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 mb-4 focus:ring-2 focus:ring-green-700 focus:outline-none"
                            />

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Selling Price (Discounted)
                            </label>
                            <input
                                type="number"
                                name="selling_price"
                                value={form.selling_price}
                                onChange={handleChange}
                                placeholder="39.99"
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 mb-4 focus:ring-2 focus:ring-green-700 focus:outline-none"
                            />

                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock
                            </label>
                            <input
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                placeholder="100"
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 mb-4 focus:ring-2 focus:ring-green-700 focus:outline-none"
                            />
                        </div>

                        {/* RIGHT - IMAGES & VARIANTS */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Upload Product Image
                            </h2>

                            {/* Main Preview */}
                            <div className="border border-gray-200 rounded-lg p-4 flex justify-center mb-4">
                                {images.length > 0 ? (
                                    <img
                                        src={images[0].preview}
                                        alt="Main Product"
                                        className="w-40 h-40 object-cover rounded-md"
                                    />
                                ) : (
                                    <div className="text-gray-400 text-sm italic">
                                        No image selected
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                {images.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={img.preview}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-16 h-16 object-cover rounded-md border border-gray-300"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-white border border-gray-300 rounded-full p-1 text-gray-600 hover:text-red-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                {/* Add Button */}
                                <label className="flex flex-col items-center justify-center w-16 h-16 border-2 border-dashed border-gray-300 rounded-md text-gray-400 hover:text-green-700 hover:border-green-700 cursor-pointer">
                                    <PlusCircle className="w-6 h-6" />
                                    <span className="text-xs mt-1">Add</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Variants */}
                            <h2 className="text-lg font-semibold text-gray-800 mb-3">
                                Product Variants
                            </h2>
                            {variants.map((variant, index) => (
                                <div
                                    key={index}
                                    className="border border-gray-200 rounded-md p-4 mb-3 bg-gray-50 relative"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="quantity"
                                            placeholder="Quantity (e.g., 500g)"
                                            value={variant.quantity}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border border-gray-300 rounded-md p-2 text-sm"
                                        />
                                        <input
                                            type="number"
                                            name="price"
                                            placeholder="Price"
                                            value={variant.price}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border border-gray-300 rounded-md p-2 text-sm"
                                        />
                                        <input
                                            type="number"
                                            name="selling_price"
                                            placeholder="Selling Price"
                                            value={variant.selling_price}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border border-gray-300 rounded-md p-2 text-sm"
                                        />
                                        <input
                                            type="number"
                                            name="stock"
                                            placeholder="Stock"
                                            value={variant.stock}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border border-gray-300 rounded-md p-2 text-sm"
                                        />
                                    </div>

                                    {variants.length > 1 && (
                                        <button
                                            onClick={() => removeVariant(index)}
                                            className="absolute top-2 right-2 text-gray-500 hover:text-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}

                            <button
                                onClick={addVariant}
                                className="flex items-center gap-2 mt-2 text-green-700 hover:text-green-800 text-sm font-medium"
                            >
                                <PlusCircle className="w-5 h-5" />
                                Add Variant
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
