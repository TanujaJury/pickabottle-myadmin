"use client";

import React, { Suspense } from "react";
import ManageTestimonialContent from "./ManageTestimonialContent";

export default function ManageTestimonialPageWrapper() {
    return (
        <Suspense fallback={<div>Loading testimonial form...</div>}>
            <ManageTestimonialContent />
        </Suspense>
    );
}
