"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Star } from "lucide-react";
import { fetchInvoice } from "../../services/orderService";

export default function Invoice() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [invoice, setInvoice] = useState(null);

    // ✅ Fetch Product Details
    useEffect(() => {

        async function loadInvoice() {
            try {
                setLoading(true);
                const data = await fetchInvoice({
                    order_id: id
                });

                setInvoice(data.data.invoiceHtml)

            } finally {
                setLoading(false);
            }
        }
        if (id) loadInvoice();
    }, [id]);


    if (loading)
        return (
            <div className="flex items-center justify-center h-screen text-green-800 font-bold text-lg">
                Loading Invoice...
            </div>
        );
    return (
        <>
            <div className="mx-auto flex flex-col lg:flex-row justify-between px-10 items-center gap-10" dangerouslySetInnerHTML={{ __html: invoice }} ></div>
        </>
    );
}
