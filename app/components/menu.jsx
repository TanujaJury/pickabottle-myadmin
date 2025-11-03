"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Package,
  Receipt,
} from "lucide-react";

// ✅ JS version of cx (no TypeScript types)
function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function DashboardHeader() {
  const pathname = usePathname();

  const items = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      exact: true,
    },
    {
      href: "/orderlist",
      label: "Order Management",
      icon: <ShoppingCart className="w-5 h-5" />,
    },
    {
      href: "/transaction",
      label: "Transaction",
      icon: <CreditCard className="w-5 h-5" />,
    },
    {
      href: "/productlist",
      label: "Product List",
      icon: <Package className="w-5 h-5" />,
    },
    {
      href: "/pos",
      label: "Pos",
      icon: <Receipt className="w-5 h-5" />,
    },
  ];

  const isActive = (item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <>
      <Image
        src="/pickabottle-logo.png"
        alt="Pickabottle"
        width={50}
        height={50}
        className="mx-auto rounded-full"
        priority
      />
      <div className="text-gray-700 ml-7">
        <h4 className="mt-4 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Main Menu
        </h4>
        <ul className="flex flex-col gap-2 mt-3 mr-7">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cx(
                  "flex items-center gap-2 rounded-md px-3 py-2 transition-colors",
                  "hover:bg-gray-200 hover:text-black",
                  isActive(item) && "bg-green-700 text-white"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
