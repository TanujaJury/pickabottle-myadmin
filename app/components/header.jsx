"use client";

import React from "react";

export default function DashboardHeader() {
  return (
    <div className="flex items-center justify-between p-4 bg-white shadow-sm px-5">
      {/* Left: Title */}
      <h1 className="text-2xl font-bold text-green-900">Dashboard</h1>

      {/* Right: User info */}
      <div className="ml-auto flex items-center">
        {/* Vertical divider */}
        <div className="hidden sm:block h-6 w-px bg-gray-300 mx-6" />

        {/* Name + email */}
        <div className="text-right">
          <div className="font-semibold text-gray-900">suresh</div>
          <div className="text-sm text-gray-500">suresh@villasaa.com</div>
        </div>
      </div>
    </div>
  );
}
