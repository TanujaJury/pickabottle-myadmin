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
    const [variants, setVariants] = useState([
        { _id: null, quantity: "", price: "", selling_price: "", stock: "" },
    ]);

    const [loading, setLoading] = useState(false);
    const didFetch = useRef(false);

    // Fetch product data in edit mode
    useEffect(() => {
        if (!edit || didFetch.current) return;
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

            setForm({
                name: data.product_name || "",
                price: data.product_price || "",
                selling_price: data.productselling_price || "",
                stock: data.stock || "",
                product_ingredients: data.product_indegrents || "",
                description: data.product_description || "",
                isActive: data.isActive ?? true,
            });

            if (data.product_varients?.length > 0) {
                setVariants(
                    data.product_varients.map((v) => ({
                        _id: v?.id || null,
                        quantity: v?.quntity || "",
                        price: v?.Price || "",
                        selling_price: v?.selling_price || "",
                        stock: v?.stock || "",
                    }))
                );
            }

            if (data.product_images?.length > 0) {
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
            toast.error("❌ Error loading product data");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

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
            const payload = {
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

            // ✔ CREATE PRODUCT
            if (!edit) {
                const res = await createProduct(payload);

                console.log("CREATE PRODUCT RESPONSE:", res);

                productId =
                    res?.data?._id ||
                    res?.data?.id ||
                    res?.data?.product_id ||
                    res?.product_id;

                if (!productId) {
                    toast.error("❌ Could not get product ID from backend.");
                    setLoading(false);
                    return;
                }

                toast.success("✅ Product created!");
            }

            // ✔ UPDATE PRODUCT
            else {
                const res = await updateProduct(payload, edit);

                if (!res?.success) {
                    toast.error(res?.message || "Failed to update product");
                    setLoading(false);
                    return;
                }

                toast.success("✅ Product updated!");
            }

            // ✔ SAVE VARIANTS  
            if (productId && variants.length > 0) {
                for (const variant of variants) {
                    const vPayload = {
                        product_id: productId,
                        quantity: variant.quantity,
                        price: Number(variant.price) || 0,
                        selling_price: Number(variant.selling_price) || 0,
                        stock: Number(variant.stock) || 0,
                    };

                    await createVariant(vPayload);
                }

                toast.success("🧩 Variants saved!");
            }

            // ✔ UPLOAD IMAGES
            if (productId && images.length > 0) {
                for (const img of images) {
                    if (img.file) {
                        const formData = new FormData();
                        formData.append("product_id", productId);
                        formData.append("file", img.file);
                        await uploadProductImage(formData);
                    }
                }
                toast.success("📸 Images uploaded!");
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
            console.error("Error:", error);
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
                                } text-white px-5 py-2 rounded-md`}
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
                            <h2 className="text-lg font-semibold mb-4">Basic Details</h2>

                            <label className="text-sm">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border p-2 rounded bg-gray-50 mb-4"
                            />

                            <label className="text-sm">Description</label>
                            <textarea
                                name="description"
                                rows="3"
                                value={form.description}
                                onChange={handleChange}
                                className="w-full border p-2 rounded bg-gray-50 mb-4"
                            ></textarea>

                            <label className="text-sm">Ingredients</label>
                            <input
                                type="text"
                                name="product_ingredients"
                                value={form.product_ingredients}
                                onChange={handleChange}
                                className="w-full border p-2 rounded bg-gray-50 mb-6"
                            />

                            <h2 className="text-lg font-semibold mb-2">Pricing</h2>

                            <label className="text-sm">Product Price</label>
                            <input
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                                className="w-full border p-2 rounded bg-gray-50 mb-4"
                            />

                            <label className="text-sm">Selling Price</label>
                            <input
                                type="number"
                                name="selling_price"
                                value={form.selling_price}
                                onChange={handleChange}
                                className="w-full border p-2 rounded bg-gray-50 mb-4"
                            />

                            <label className="text-sm">Stock</label>
                            <input
                                type="number"
                                name="stock"
                                value={form.stock}
                                onChange={handleChange}
                                className="w-full border p-2 rounded bg-gray-50 mb-4"
                            />
                        </div>

                        {/* RIGHT */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <h2 className="text-lg font-semibold mb-4">
                                Upload Product Image
                            </h2>

                            <div className="border rounded p-4 flex justify-center mb-4">
                                {images.length > 0 ? (
                                    <img
                                        src={images[0].preview}
                                        className="w-40 h-40 object-cover rounded"
                                    />
                                ) : (
                                    <span className="text-gray-400">No image selected</span>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3 mb-6">
                                {images.map((img, i) => (
                                    <div key={i} className="relative">
                                        <img
                                            src={img.preview}
                                            className="w-16 h-16 object-cover rounded border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(i)}
                                            className="absolute -top-2 -right-2 bg-white border rounded-full p-1"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}

                                <label className="flex flex-col items-center justify-center w-16 h-16 border-2 border-dashed border-gray-300 rounded cursor-pointer">
                                    <PlusCircle className="w-6 h-6" />
                                    <span className="text-xs">Add</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageSelect}
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            <h2 className="text-lg font-semibold mb-4">Product Variants</h2>

                            {variants.map((variant, index) => (
                                <div key={index} className="border p-4 rounded mb-3 bg-gray-50 relative">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            name="quantity"
                                            placeholder="Quantity"
                                            value={variant.quantity}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border rounded p-2"
                                        />
                                        <input
                                            type="number"
                                            name="price"
                                            placeholder="Price"
                                            value={variant.price}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border rounded p-2"
                                        />
                                        <input
                                            type="number"
                                            name="selling_price"
                                            placeholder="Selling Price"
                                            value={variant.selling_price}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border rounded p-2"
                                        />
                                        <input
                                            type="number"
                                            name="stock"
                                            placeholder="Stock"
                                            value={variant.stock}
                                            onChange={(e) => handleVariantChange(index, e)}
                                            className="border rounded p-2"
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
                                className="flex items-center gap-2 text-green-700"
                            >
                                <PlusCircle className="w-5 h-5" /> Add Variant
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
