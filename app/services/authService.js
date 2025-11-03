import api from "./api";

/** Internal helpers */
const setAuthHeader = (token) => {
    if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common["Authorization"];
    }
};

const safeRemoveStoredToken = () => {
    if (typeof window !== "undefined") {
        try {
            localStorage.removeItem("token");
            // If you ever stored it in session storage too:
            if (typeof sessionStorage !== "undefined") {
                sessionStorage.removeItem("token");
            }
        } catch (e) {
            // ignore storage errors
        }
    }
};
// Login
export const login = async (username, password) => {
    try {
        const res = await api.post("/admin-login", { username, password });
        localStorage.setItem("token", res.data.token || "");
        return res.data;
    } catch (error) {
        console.error("Login API Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Login failed");
    }
};
export const logout = async () => {
    try {
        safeRemoveStoredToken();
        setAuthHeader(null);

        // 3) OPTIONAL redirect (browser-only)
        if (typeof window !== "undefined") {
            // Use assign so it doesn't keep history (safer for auth flows)
            window.location.assign("/login");
        }

        return true;
    } catch (error) {
        console.error("Logout Error:", error?.response?.data || error?.message);
        // Still attempt to clear client-side state so the user is effectively logged out
        safeRemoveStoredToken();
        setAuthHeader(null);
        // Decide whether to redirect anyway:
        if (typeof window !== "undefined") {
            window.location.assign("/login");
        }
        return false;
    }
};

// Register
export const register = async (name, username, password) => {
    try {
        const res = await api.post("/register", { name, username, password });
        return res.data;
    } catch (error) {
        console.error("Register API Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Registration failed");
    }
};
