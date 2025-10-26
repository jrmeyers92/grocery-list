"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function deleteStockedItem(id: string) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const supabase = await createAdminClient();

    // Verify ownership before deleting
    const { data: item } = await supabase
      .from("grocerylist_stocked_items")
      .select("owner_id")
      .eq("id", id)
      .single();

    if (!item || item.owner_id !== userId) {
      return {
        success: false,
        error: "Item not found or access denied",
      };
    }

    const { error } = await supabase
      .from("grocerylist_stocked_items")
      .delete()
      .eq("id", id)
      .eq("owner_id", userId);

    if (error) {
      console.error("Supabase error:", error);
      return {
        success: false,
        error: "Failed to delete stocked item",
      };
    }

    revalidatePath("/stocked-items");

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting stocked item:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
