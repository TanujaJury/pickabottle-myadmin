import axios from "axios";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Warn if missing (helps catch misconfig)
if (!API_BASE_URL) {
    // eslint-disable-next-line no-console
    console.log("❌ NEXT_PUBLIC_API_URL is not set. Check your .env.local");
}

const api = axios.create({
    baseURL: API_BASE_URL || "http://localhost:8000/api", // safe fallback
    headers: { "Content-Type": "application/json" },
});

// Attach Authorization header from localStorage (client-only)
api.interceptors.request.use(
    (config) => {
        if (typeof window !== "undefined") {
            const token = localStorage.getItem("token");
            if (token) {
                // If your backend expects `Bearer <token>`, use:
                // config.headers.Authorization = `Bearer ${token}`;
                config.headers.Authorization = token;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Optional: log non-2xx responses for easier debugging
api.interceptors.response.use(
    (res) => res,
    (error) => {
        const data = error?.response?.data;
        // eslint-disable-next-line no-console
        console.error("Axios Error:", {
            url: error?.config?.url,
            status: error?.response?.status,
            data: typeof data === "string" ? data.slice(0, 500) : data,
            message: error?.message,
        });
        return Promise.reject(error);
    }
);

// If your services import this:ss
export const ensureGuestSession = async () => {
    // no-op placeholder: keep if your other services call it
    // You can implement guest-token creation here if your backend supports it.
    return true;
};

export default api;
