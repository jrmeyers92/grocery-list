"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import {
  createErrorResponse,
  createSuccessResponse,
  errorMessages,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";

export async function getShoppingListRecipeCount() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    const supabase = await createAdminClient();

    // Get the active shopping list
    const { data: activeList, error: listError } = await supabase
      .from("grocerylist_shoppinglist")
      .select("id")
      .eq("owner_id", userId)
      .eq("is_active", true)
      .single();

    if (listError) {
      return createErrorResponse(errorMessages.SERVER_ERROR, listError);
    }

    if (!activeList) {
      return createSuccessResponse("Shopping list retrieved", { count: 0 });
    }

    // Get count of recipes in the active list
    const { count, error } = await supabase
      .from("grocerylist_shoppinglist_recipes")
      .select("*", { count: "exact", head: true })
      .eq("menu_id", activeList.id);

    if (error) {
      return createErrorResponse(errorMessages.SERVER_ERROR, error);
    }

    return createSuccessResponse("Recipe count retrieved", {
      count: count || 0,
    });
  } catch (error) {
    return createErrorResponse(errorMessages.SERVER_ERROR, error);
  }
}
