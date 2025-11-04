
import api from "./api";
import { logout } from './authService'

export const fetchOrders = async (page = 1, limit = 10, status = "") => {
    try {
        const params = { page, limit };
        if (status) params.status = status;

        // 🔗 API request
        const response = await api.get("/fetch-admin-order", { params });

        // ✅ Handle success

        if (response.data?.success) {
            return response.data.data;
        } else {
            throw new Error(response.data?.message || "Failed to fetch orders");
        }
    } catch (error) {
        if (error?.message === "Session expired") {
            await logout();
        }
        console.error("❌ Order Fetch Error:", error.response?.data || error.message);
        throw error;
    }
};

export async function fetchOrderById(id) {
    try {
        const res = await api.get(`/single-order-fetch/${id}`);
        if (res.data?.success && res.data.data) {
            return res.data.data;
        }
        throw new Error(res.data?.message || "Failed to fetch order");
    } catch (error) {
        if (error?.message === "Session expired") {
            await logout();
        }
        console.log("❌ fetchOrderById error:", error.message);
        throw error;
    }
}

export async function updateOrderStatus(order_id, status) {
    try {
        const res = await api.put('/update-status', { order_id, status });
        if (res.data?.success && res.data.data) {
            return res.data.data;
        }
        throw new Error(res.data?.message || "Failed to fetch order");
    } catch (error) {
        if (error?.message === "Session expired") {
            await logout();
        }
        console.log("❌ updateOrderStatus error:", error.message);
        throw error;
    }
}
export async function fetchDashboardData() {
    try {
        const res = await api.get("/dashboard-order");

        if (res?.data?.success && res.data.data) {
            return res.data.data; // { product_count, order_count, total_deliverd }
        }

        throw new Error(res.data?.message || "Failed to fetch dashboard data");
    } catch (error) {
        if (error?.message === "Session expired") {
            await logout();
        }
        console.error("❌ fetchDashboardData error:", error.message);
        throw error;
    }
}

export async function fetchTransactions(page = 1, limit = 10) {
    try {
        const res = await api.get("/transaction", {
            params: { page, limit },
        });

        const { success, data, transaction_count, message } = res.data || {};

        if (success && Array.isArray(data)) {
            return {
                data,
                total: Number(transaction_count) || data.length, // ✅ use transaction_count
            };
        }

        throw new Error(message || "Failed to fetch transactions");
    } catch (error) {
        if (error?.message === "Session expired") {
            await logout();
        }
        console.error("❌ fetchTransactions error:", error.message);
        throw error;
    }
}
export const fetchInvoice = async ({ order_id }) => {
    if (!order_id) {
        return { success: false, message: "Missing order id" };
    }

    try {
        const res = await api.get(
            `/invoice/${order_id}`
        );

        return res.data; // { success, message, data? }
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || error.message,
        };
    }
};

export const createPOS = async (data) => {
    try {
        const res = await api.post("/pos", data); // same as POST /api/pos
        return res.data; // return full JSON (includes success, message, data)
    } catch (err) {
        // Handle auth/session expiration gracefully
        if (err?.message === "Session expired") {
            await logout();
        }
        console.error("Error creating POS:", err);
        throw err;
    }
};
export const fetchPOS = async ({ page = 1, limit = 10, search = "" }) => {
    try {
        const params = { page, limit };
        if (search) params.search = search;
        const res = await api.get("/fetch-pos", {
            params
        });

        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") {
            await logout();
        }
        console.error("Axios Error:", err);
        throw err;
    }
};
export const fetchOrderCount = async () => {
    try {
        const res = await api.get("/orders-count"); // ✅ axios-style request

        // API returns: { success, message, data: {...} }
        if (!res.data?.success) {
            throw new Error(res.data?.message || "Failed to fetch order count");
        }

        return res.data.data; // ✅ return the data object directly (order_count, etc.)
    } catch (err) {
        if (err?.message === "Session expired") {
            await logout(); // same pattern as your fetchPOS
        }
        console.error("❌ fetchOrderCount error:", err.message);
        throw err;
    }
};