// /services/testimonialService.js
import api from "./api";
import { logout } from "./authService";

// Fetch testimonials (GET)
export const fetchTestimonials = async () => {
    try {
        const response = await api.get("/fetch-testimonial");
        return response.data;
    } catch (error) {
        if (error?.message === "Session expired") await logout();
        console.error("❌ Error fetching testimonials:", error);
        throw error;
    }
};

// Create testimonial (with image upload)
export const createTestimonial = async (formData) => {
    try {
        const response = await api.post("/create-testimonial", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } catch (error) {
        if (error?.message === "Session expired") await logout();
        console.error("❌ Error creating testimonial:", error);
        throw error;
    }
};

export const deleteTestimonial = async (id) => {
    try {
        const response = await api.delete(`/delete-testimonial/${id}`);
        return response.data;
    } catch (error) {
        if (error?.message === "Session expired") await logout();
        console.error("❌ Error deleting testimonial:", error);
        throw error;
    }
};

export const updateTestimonial = async (id, formData) => {
    try {
        const response = await api.put(`/update-testimonial/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return response.data;
    } catch (error) {
        if (error?.message === "Session expired") await logout();
        console.error("❌ Error updating testimonial:", error);
        throw error;
    }
};
export const fetchSingleTestimonial = async (id) => {
    try {
        const response = await api.get(`/fetchsingle-testimonial/${id}`);
        return response.data;
    } catch (error) {
        if (error?.message === "Session expired") await logout();
        console.error("❌ Error fetching single testimonial:", error);
        throw error;
    }
};

