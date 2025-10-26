"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import { Tables } from "@/types/database.types";
import { auth } from "@clerk/nextjs/server";

export type StockedItem = Tables<"grocerylist_stocked_items">;

export async function getStockedItems() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
        data: [] as StockedItem[],
      };
    }

    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from("grocerylist_stocked_items")
      .select("*")
      .eq("owner_id", userId)
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return {
        success: false,
        error: "Failed to fetch stocked items",
        data: [] as StockedItem[],
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Error fetching stocked items:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
      data: [] as StockedItem[],
    };
  }
}
