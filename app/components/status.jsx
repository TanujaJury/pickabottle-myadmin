import React from "react";
import { Search } from "lucide-react";

export default function Status() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 ml-8">
        {/* Status tabs */}
        <div className="bg-green-100 px-5 py-2 rounded-md">
          <ul className="flex flex-wrap gap-2 sm:gap-4 text-sm text-gray-700">
            <li>
              <button className="px-3 py-1 rounded-md bg-white text-black">
                All Orders (10)
              </button>
            </li>
            <li>
              <button className="px-3 py-1 rounded-md hover:bg-green-100">
                Delivered
              </button>
            </li>
            <li>
              <button className="px-3 py-1 rounded-md hover:bg-green-100">
                Pending
              </button>
            </li>
            <li>
              <button className="px-3 py-1 rounded-md hover:bg-green-100">
                Canceled
              </button>
            </li>
          </ul>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md mx-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search orders"
            className="w-full rounded-full bg-gray-200 pl-10 pr-4 py-2 text-gray-700 placeholder-gray-500 outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
      </div>
    </>
  );
}
