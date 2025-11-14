import api from "./api";
import { logout } from "./authService";

// Fetch ALL taxes
export const fetchAllTaxes = async () => {
    try {
        const res = await api.get("/tax");
        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") await logout();
        throw err;
    }
};

// Fetch single country tax
export const fetchSingleCountryTax = async (id) => {
    try {
        const res = await api.get(`/tax/country/${id}`);
        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") await logout();
        throw err;
    }
};

// Fetch single state tax
export const fetchSingleStateTax = async (id) => {
    try {
        const res = await api.get(`/tax/state/${id}`);
        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") await logout();
        throw err;
    }
};

// Create Country Tax
export const createCountryTax = async (payload) => {
    try {
        const res = await api.post("/tax/country", payload);
        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") await logout();
        throw err;
    }
};

// Create State Tax
export const createStateTax = async (payload) => {
    try {
        const res = await api.post("/tax/state", payload);
        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") await logout();
        throw err;
    }
};

// Delete Tax (country/state both use same delete)
export const deleteTax = async (id) => {
    try {
        const res = await api.delete(`/tax/${id}`);
        return res.data;
    } catch (err) {
        if (err?.message === "Session expired") await logout();
        throw err;
    }
};
