"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../../components/header";
import Menu from "../../components/menu";

import {
    createTestimonial,
    fetchSingleTestimonial,
    updateTestimonial,
} from "../../services/testimonialService";

export default function ManageTestimonialContent() {
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const isEdit = Boolean(editId);
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        message: "",
        profile_url: null,
        old_image: "",
    });

    const [preview, setPreview] = useState("");

    // Load testimonial (edit mode)
    useEffect(() => {
        if (!isEdit) return;

        const loadData = async () => {
            try {
                const res = await fetchSingleTestimonial(editId);

                if (!res?.data) {
                    toast.error("Testimonial not found!");
                    return;
                }

                const item = res.data;

                setForm({
                    name: item.name,
                    message: item.description,
                    profile_url: null,
                    old_image: item.profile_url,
                });

                setPreview(
                    `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item.profile_url}`
                );

            } catch (error) {
                console.error("❌ Failed to load testimonial:", error);
                toast.error("Failed to load testimonial");
            }
        };

        loadData();
    }, [editId]);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "profile_url") {
            const file = files[0];
            if (file) {
                setForm({ ...form, profile_url: file });
                setPreview(URL.createObjectURL(file));
            }
            return;
        }

        setForm({ ...form, [name]: value });
    };

    // Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.message) {
            toast.error("Name and message are required!");
            return;
        }

        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("message", form.message);

        if (form.profile_url) fd.append("profile_url", form.profile_url);

        try {
            if (isEdit) {
                const res = await updateTestimonial(editId, fd);
                toast.success(res?.message || "Testimonial updated!");
            } else {
                const res = await createTestimonial(fd);
                toast.success(res?.message || "Testimonial added!");

                // reset form
                setForm({
                    name: "",
                    message: "",
                    profile_url: null,
                    old_image: "",
                });
                setPreview("");
            }

        } catch (error) {
            console.error("❌ Failed to submit testimonial:", error);
            toast.error("Failed to submit testimonial");
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

                <div className="max-w-xl mx-auto bg-white p-6 mt-10 rounded-xl shadow">
                    <h1 className="text-2xl font-semibold mb-6 text-green-700">
                        {isEdit ? "Edit Testimonial" : "Add Testimonial"}
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Name */}
                        <div>
                            <label className="text-sm font-medium">Name</label>
                            <input
                                name="name"
                                value={form.name}
                                className="w-full border px-3 py-2 rounded mt-1"
                                placeholder="Enter name"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="text-sm font-medium">Message</label>
                            <textarea
                                name="message"
                                value={form.message}
                                placeholder="Enter message"
                                rows={4}
                                className="w-full border px-3 py-2 rounded mt-1"
                                onChange={handleChange}
                                required
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="text-sm font-medium">Profile Image</label>

                            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-500 transition mt-2">
                                <div className="text-center">
                                    <p className="text-gray-500 text-sm">
                                        {isEdit ? "Click to change image" : "Click to upload image"}
                                    </p>
                                </div>

                                <input
                                    type="file"
                                    name="profile_url"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleChange}
                                />
                            </label>

                            {preview && (
                                <img
                                    src={preview}
                                    className="w-24 h-24 mt-3 rounded-full object-cover border shadow"
                                    alt="Preview"
                                />
                            )}

                            {form.profile_url && (
                                <p className="mt-2 text-sm text-gray-600">
                                    Selected: <b>{form.profile_url.name}</b>
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                        >
                            {isEdit ? "Update Testimonial" : "Add Testimonial"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
