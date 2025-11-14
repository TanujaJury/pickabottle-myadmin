'use client';

import React, { Suspense } from "react";
import AddProductContent from "./AddProductContent";

export default function AddProductPage() {
    return (
        <Suspense fallback={<div className="p-6 text-green-700">Loading product editor...</div>}>
            <AddProductContent />
        </Suspense>
    );
}
