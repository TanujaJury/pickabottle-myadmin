"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "../services/authService";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await login(username, password);
            if (res.success) {
                toast.success(res.message || "Logged in successfully!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                router.push("/dashboard"); // redirect after login
            } else {
                toast.error(res.message || "Invalid username or password", {
                    position: "top-right",
                    autoClose: 3000,
                });
            }
        } catch (error) {
            // This catches the Error thrown from authService
            toast.error(error.message || "Login failed", {
                position: "top-right",
                autoClose: 3000,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="w-96 p-8 bg-white rounded-lg shadow-xl border-t-8 border-t-green-800"
            >
                <h1 className="text-3xl font-bold text-green-700 text-center mb-6">
                    Log In
                </h1>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-1">Username</label>
                    <input
                        type="text"
                        placeholder="Enter username"
                        className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm text-gray-600"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        placeholder="Enter password"
                        className="w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 shadow-sm text-gray-600"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-green-800 text-white py-3 rounded-md hover:bg-green-900 transition"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Log In"}
                </button>

                <p className="text-center mt-4 text-gray-600">
                    New user?{" "}
                    <span
                        className="text-green-700 font-medium cursor-pointer hover:underline"
                        onClick={() => router.push("/register")}
                    >
                        Register here
                    </span>
                </p>
            </form>

            <ToastContainer />
        </div>
    );
}
