// /services/productService.js
import api from "./api";
import { logout } from './authService'



export const getAdminProducts = async (page = 1, limit = 10) => {
    try {
        const response = await api.get("/admin-product-fetch", {
            params: { page, limit },
        });
        return response.data;
    } catch (error) {
        if (error?.message === "Session expired") {
            await logout();
        }
        console.error("Error fetching admin products:", error);
        throw error;
    }
};

export const getAdminProduct = async (id) => {
    try {
        const response = await api.get(`/user-product/${id}`);

        return response.data.data;
    } catch (error) {
        if (error?.message === "Session expired") {
            await logout();
        }
        console.error("Error fetching admin products:", error);
        throw error;
    }
};
// ✅ Delete a product by ID
export const deleteProduct = async (productId) => {
    if (!productId) throw new Error("Product ID is required for deletion.");

    try {
        const response = await api.delete(`/delete-product/${productId}`);
        return response.data; // expected { success: true, message }
    } catch (error) {
        if (error?.message === "Session expired") {
            await logout();
        }
        console.error("❌ Error deleting product:", error);
        throw error.response?.data || error.message;
    }
};


// Create Product (JSON)
export const createProduct = async (data) => {
    try {
        const res = await api.post("/create-product", data);
        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") {
            await logout();
        }
        console.error("Error creating product:", err);
        throw err;
    }
};
export const updateProduct = async (data, id) => {
    try {
        const res = await api.put(`/update-product/${id}`, data);
        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") {
            await logout();
        }
        console.error("Error creating product:", err);
        throw err;
    }
};

// Upload Product Image (FormData)
export const uploadProductImage = async (formData) => {
    try {
        const res = await api.post("/create-product-image", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") {
            await logout();
        }
        console.error("Error uploading product image:", err);
        throw err;
    }
};
export async function createVariant(payload) {
    try {
        const res = await api.post("/create-varient", payload);
        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") {
            await logout();
        }
        console.error("Error creating product variant:", err);
        throw err;
    }
}

export async function updateVariant(payload, variantId) {
    try {
        const res = await api.post(`/update-varient/${variantId}`, payload);
        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") {
            await logout();
        }
        console.error("Error updating product variant:", err);
        throw err;
    }
}
