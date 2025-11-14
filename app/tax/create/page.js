"use client";

import { useState } from "react";
import Header from "../../components/header";
import Menu from "../../components/menu";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
    createCountryTax,
    createStateTax,
} from "../../services/taxService";

export default function CreateTax() {
    const [type, setType] = useState("country"); // default = country

    // Form fields
    const [country, setCountry] = useState("");
    const [countryTax, setCountryTax] = useState("");

    const [stateName, setStateName] = useState("");
    const [stateTax, setStateTax] = useState("");

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let res;

            if (type === "country") {
                if (!country || !countryTax) {
                    toast.warn("Please fill all country fields");
                    setLoading(false);
                    return;
                }

                const payload = {
                    country: country,
                    country_tax: Number(countryTax),
                };

                res = await createCountryTax(payload);
            } else {
                if (!stateName || !stateTax) {
                    toast.warn("Please fill all state fields");
                    setLoading(false);
                    return;
                }

                const payload = {
                    state: stateName,
                    state_tax: Number(stateTax),
                };

                res = await createStateTax(payload);
            }

            toast.success("Tax created successfully!");
            setCountry("");
            setCountryTax("");
            setStateName("");
            setStateTax("");

        } catch (err) {
            toast.error("Error creating tax");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ToastContainer position="top-right" autoClose={2200} />

            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm">
                <Menu />
            </aside>

            <main className="flex-1">
                <Header />

                <div className="px-10 mt-6">
                    <h1 className="text-2xl font-bold text-green-800 mb-6">
                        Add Tax
                    </h1>

                    <form
                        onSubmit={handleSubmit}
                        className="bg-white p-6 rounded-lg shadow-md max-w-lg"
                    >
                        {/* === RADIO BUTTONS === */}
                        <div className="flex items-center gap-6 mb-6">
                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="taxType"
                                    checked={type === "country"}
                                    onChange={() => setType("country")}
                                />
                                <span>Country Tax</span>
                            </label>

                            <label className="flex items-center gap-2">
                                <input
                                    type="radio"
                                    name="taxType"
                                    checked={type === "state"}
                                    onChange={() => setType("state")}
                                />
                                <span>State Tax</span>
                            </label>
                        </div>

                        {/* === COUNTRY FORM === */}
                        {type === "country" && (
                            <div>
                                <label className="block mb-2 font-medium">
                                    Country Name
                                </label>
                                <input
                                    type="text"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                    placeholder="Enter country"
                                    className="w-full px-4 py-2 border rounded-lg mb-4"
                                />

                                <label className="block mb-2 font-medium">
                                    Country Tax (%)
                                </label>
                                <input
                                    type="number"
                                    value={countryTax}
                                    onChange={(e) => setCountryTax(e.target.value)}
                                    placeholder="Enter tax (%)"
                                    className="w-full px-4 py-2 border rounded-lg mb-4"
                                />
                            </div>
                        )}

                        {/* === STATE FORM === */}
                        {type === "state" && (
                            <div>
                                <label className="block mb-2 font-medium">
                                    State Name
                                </label>
                                <input
                                    type="text"
                                    value={stateName}
                                    onChange={(e) => setStateName(e.target.value)}
                                    placeholder="Enter state"
                                    className="w-full px-4 py-2 border rounded-lg mb-4"
                                />

                                <label className="block mb-2 font-medium">
                                    State Tax (%)
                                </label>
                                <input
                                    type="number"
                                    value={stateTax}
                                    onChange={(e) => setStateTax(e.target.value)}
                                    placeholder="Enter tax (%)"
                                    className="w-full px-4 py-2 border rounded-lg mb-4"
                                />
                            </div>
                        )}

                        {/* === SUBMIT BUTTON === */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-green-700 text-white py-2 rounded-lg mt-4 
                                ${loading ? "opacity-60 cursor-not-allowed" : "hover:bg-green-600"}
                            `}
                        >
                            {loading ? "Saving..." : "Save Tax"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
