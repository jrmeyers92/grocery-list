"use client";

import { getShoppingListRecipeCount } from "@/actions/shopping-list/get-count";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function ShoppingListBadge() {
  const [count, setCount] = useState<number>(0);
  const pathname = usePathname();

  useEffect(() => {
    const fetchCount = async () => {
      const result = await getShoppingListRecipeCount();
      if (result.success && result.data) {
        setCount(result.data.count);
      }
    };

    fetchCount();
  }, [pathname]); // Refetch when pathname changes

  if (count === 0) return null;

  return (
    <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-primary rounded-full">
      {count > 99 ? "99+" : count}
    </span>
  );
}
