"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "../components/header";
import Menu from "../components/menu";
import { PlusCircle, X } from "lucide-react";
import {
    createProduct,
    uploadProductImage,
    createVariant,
    updateProduct,
    getAdminProduct,
} from "../services/productService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams, useRouter } from "next/navigation";

export default function AddProductContent() {
    const searchParams = useSearchParams();
    const edit = searchParams.get("edit");
    const router = useRouter();

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
        { _id: null, quantity: "", price: "", selling_price: "", stock: "" },
    ]);

    const didFetch = useRef(false);

    // Fetch product data in edit mode
    useEffect(() => {
        if (!edit) return;
        if (didFetch.current) return;
        didFetch.current = true;

        fetchProductData(edit);
    }, [edit]);

    const fetchProductData = async (id) => {
        try {
            const data = await getAdminProduct(id);

            if (!data) {
                toast.error("⚠️ Failed to load product details");
                return;
            }

            // Main form fields
            setForm({
                name: data.product_name || "",
                price: data.product_price || "",
                selling_price: data.productselling_price || "",
                stock: data.stock || "",
                product_ingredients: data.product_indegrents || "",
                description: data.product_description || "",
                isActive: data.isActive ?? true,
            });

            // Variants
            if (data.product_varients && data.product_varients.length > 0) {
                setVariants(
                    data.product_varients.map((v) => ({
                        _id: v.id || null,
                        quantity: v.quntity || "",
                        price: v.Price || "",
                        selling_price: v.selling_price || "",
                        stock: v.stock || "",
                    }))
                );
            }

            // Images
            if (data.product_images && data.product_images.length > 0) {
                setImages(
                    data.product_images.map((img) => ({
                        file: null,
                        preview:
                            `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${img.file_url}`,
                    }))
                );
            }

            toast.info("✏️ Edit mode enabled");
        } catch (err) {
            console.error("Error fetching product:", err);
            toast.error("❌ Error loading product data");
        }
    };

    // Input change handler
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    // Image select
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

    // Variant updates
    const handleVariantChange = (index, e) => {
        const { name, value } = e.target;
        const updated = [...variants];
        updated[index][name] = value;
        setVariants(updated);
    };

    const addVariant = () => {
        setVariants([
            ...variants,
            { _id: null, quantity: "", price: "", selling_price: "", stock: "" },
        ]);
    };

    const removeVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

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

            let productId = edit || null;
            let isUpdate = !!edit;

            if (!edit) {
                const res = await createProduct(productPayload);
                if (!res?.success) {
                    toast.error(res?.message || "Failed to create product");
                    setLoading(false);
                    return;
                }
                productId = res?.data?._id || res?.product_id;
                toast.success("✅ Product created successfully!");
            } else {
                const res = await updateProduct(productPayload, edit);
                if (!res?.success) {
                    toast.error(res?.message || "Failed to update product");
                    setLoading(false);
                    return;
                }
                toast.success("✅ Product updated successfully!");
            }

            // Variants
            if (productId && variants.length > 0) {
                for (const variant of variants) {
                    const payload = {
                        product_id: productId,
                        quantity: variant.quantity,
                        price: Number(variant.price) || 0,
                        selling_price: Number(variant.selling_price) || 0,
                        stock: Number(variant.stock) || 0,
                    };
                    await createVariant(payload);
                }
                toast.success("🧩 Variants saved successfully!");
            }

            // Images
            if (productId && images.length > 0) {
                for (const img of images) {
                    if (img.file) {
                        const formData = new FormData();
                        formData.append("product_id", productId);
                        formData.append("file", img.file);
                        await uploadProductImage(formData);
                    }
                }
                toast.success("📸 Images uploaded successfully!");
            }

            if (!isUpdate) {
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
                setVariants([
                    { _id: null, quantity: "", price: "", selling_price: "", stock: "" },
                ]);
            }
        } catch (error) {
            console.error("Error creating/updating product:", error);
            toast.error("❌ Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ToastContainer position="top-right" autoClose={2000} />

            <aside className="w-64 bg-white shadow-sm">
                <Menu />
            </aside>

            <main className="flex-1">
                <Header />

                <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-green-900">
                            {edit ? "Edit Product" : "Add New Product"}
                        </h1>

                        <button
                            onClick={handlePublish}
                            disabled={loading}
                            className={`${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-800 hover:bg-green-700"
                                } text-white px-5 py-2 rounded-md text-sm font-medium`}
                        >
                            {loading
                                ? edit
                                    ? "Updating..."
                                    : "Publishing..."
                                : edit
                                    ? "Update Product"
                                    : "Publish Product"}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* LEFT */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Basic Details
                            </h2>

                            <label className="block text-sm text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 mb-4"
                            />

                            <label className="block text-sm text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                rows="3"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-3 mb-6"
                            ></textarea>

                            <label className="block text-sm text-gray-700 mb-1">Ingredients</label>
                            <input
                                type="text"
                                name="product_ingredients"
                                value={form.product_ingredients}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 mb-6"
                            />

                            <h2 className="text-lg font-semibold text-gray-800 mb-3">Pricing</h2>

                            <label className="block text-sm text-gray-700 mb-1">Product Price</label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 mb-4"
                            />

                            <label className="block text-sm text-gray-700 mb-1">Selling Price</label>
                            <input
                                type="number"
                                name="selling_price"
                                value={form.selling_price}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 mb-4"
                            />

                            <label className="block text-sm text-gray-700 mb-1">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-300 rounded-md p-2.5 mb-4"
                            />
                        </div>

                        {/* RIGHT */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                Upload Product Image
                            </h2>

                            <div className="border border-gray-200 rounded-lg p-4 flex justify-center mb-4">
                                {images.length > 0 ? (
                                    <img
                                        src={images[0].preview}
                                        alt="Main Product"
                                        className="w-40 h-40 object-cover rounded-md"
                                    />
                                ) : (
                                    <div className="text-gray-400 italic">No image selected</div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                {images.map((img, index) => (
                                    <div key={index} className="relative">
                                        <img
                                            src={img.preview}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-16 h-16 object-cover rounded-md border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-white rounded-full p-1 border"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                <label className="flex flex-col items-center justify-center w-16 h-16 border-2 border-dashed border-gray-300 rounded-md text-gray-400 cursor-pointer">
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

                            <h2 className="text-lg font-semibold text-gray-800 mb-3">
                                Product Variants
                            </h2>

                            {variants.map((variant, index) => (
                                <div
                                    key={index}
                                    className="border rounded-md p-4 mb-3 bg-gray-50 relative"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="quantity"
                                            placeholder="Quantity"
                                            value={variant.quantity}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border rounded-md p-2 text-sm"
                                        />
                                        <input
                                            type="number"
                                            name="price"
                                            placeholder="Price"
                                            value={variant.price}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border rounded-md p-2 text-sm"
                                        />
                                        <input
                                            type="number"
                                            name="selling_price"
                                            placeholder="Selling Price"
                                            value={variant.selling_price}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border rounded-md p-2 text-sm"
                                        />
                                        <input
                                            type="number"
                                            name="stock"
                                            placeholder="Stock"
                                            value={variant.stock}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border rounded-md p-2 text-sm"
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
                                className="flex items-center gap-2 mt-2 text-green-700"
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
