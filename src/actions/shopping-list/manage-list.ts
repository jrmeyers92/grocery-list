"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import {
  createErrorResponse,
  createSuccessResponse,
  errorMessages,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type ShoppingListResponse =
  | { success: false; error: string; details?: unknown }
  | { success: true; message: string; data?: Record<string, unknown> };

/**
 * Archives the current active list and creates a new one
 */
export async function startNewShoppingList(): Promise<ShoppingListResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    const supabase = await createAdminClient();

    // 1. Get current active list
    const { data: activeList } = await supabase
      .from("grocerylist_shoppinglist")
      .select("id, created_at")
      .eq("owner_id", userId)
      .eq("is_active", true)
      .single();

    if (activeList) {
      // 2. Generate archive name based on date range
      const startDate = new Date(activeList.created_at);
      const endDate = new Date();
      const archiveTitle = `${startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;

      // 3. Archive current list
      const { error: archiveError } = await supabase
        .from("grocerylist_shoppinglist")
        .update({
          is_active: false,
          title: archiveTitle,
        })
        .eq("id", activeList.id);

      if (archiveError) {
        console.error("Error archiving list:", archiveError);
        return createErrorResponse("Failed to archive current list");
      }
    }

    // 4. Create new active list
    const { data: newList, error: createError } = await supabase
      .from("grocerylist_shoppinglist")
      .insert([
        {
          owner_id: userId,
          title: "My Shopping List",
          is_active: true,
        },
      ])
      .select()
      .single();

    if (createError) {
      console.error("Error creating new list:", createError);
      return createErrorResponse("Failed to create new list");
    }

    revalidatePath("/shopping-list");

    return createSuccessResponse("Started new shopping list", {
      listId: newList.id,
    });
  } catch (error) {
    console.error("Error starting new list:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}

/**
 * Clears all recipes from the current active list
 */
export async function clearShoppingList(): Promise<ShoppingListResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    const supabase = await createAdminClient();

    // 1. Get active list
    const { data: activeList } = await supabase
      .from("grocerylist_shoppinglist")
      .select("id")
      .eq("owner_id", userId)
      .eq("is_active", true)
      .single();

    if (!activeList) {
      return createErrorResponse("No active shopping list found");
    }

    // 2. Delete all recipes from the list
    const { error: deleteError } = await supabase
      .from("grocerylist_shoppinglist_recipes")
      .delete()
      .eq("menu_id", activeList.id)
      .eq("owner_id", userId);

    if (deleteError) {
      console.error("Error clearing list:", deleteError);
      return createErrorResponse("Failed to clear shopping list");
    }

    revalidatePath("/shopping-list");

    return createSuccessResponse("Shopping list cleared");
  } catch (error) {
    console.error("Error clearing list:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}

/**
 * Rename the current active shopping list
 */
export async function renameShoppingList(
  newTitle: string
): Promise<ShoppingListResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    if (!newTitle || newTitle.trim().length === 0) {
      return createErrorResponse("Title cannot be empty");
    }

    const supabase = await createAdminClient();

    // 1. Get active list
    const { data: activeList } = await supabase
      .from("grocerylist_shoppinglist")
      .select("id")
      .eq("owner_id", userId)
      .eq("is_active", true)
      .single();

    if (!activeList) {
      return createErrorResponse("No active shopping list found");
    }

    // 2. Update title
    const { error: updateError } = await supabase
      .from("grocerylist_shoppinglist")
      .update({ title: newTitle.trim() })
      .eq("id", activeList.id);

    if (updateError) {
      console.error("Error renaming list:", updateError);
      return createErrorResponse("Failed to rename shopping list");
    }

    revalidatePath("/shopping-list");

    return createSuccessResponse(`Renamed to "${newTitle}"`);
  } catch (error) {
    console.error("Error renaming list:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}

/**
 * Get all archived shopping lists
 */
export async function getArchivedLists() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: errorMessages.AUTHENTICATION_REQUIRED };
    }

    const supabase = await createAdminClient();

    const { data: archivedLists, error } = await supabase
      .from("grocerylist_shoppinglist")
      .select(
        `
        id,
        title,
        created_at,
        updated_at,
        grocerylist_shoppinglist_recipes(count)
      `
      )
      .eq("owner_id", userId)
      .eq("is_active", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching archived lists:", error);
      return createErrorResponse("Failed to fetch archived lists");
    }

    return createSuccessResponse("Fetched archived lists", {
      lists: archivedLists,
    });
  } catch (error) {
    console.error("Error fetching archived lists:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}

/**
 * Delete an archived shopping list permanently
 */
export async function deleteArchivedList(
  listId: string
): Promise<ShoppingListResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    const supabase = await createAdminClient();

    // Make sure it's not the active list
    const { data: list } = await supabase
      .from("grocerylist_shoppinglist")
      .select("is_active")
      .eq("id", listId)
      .eq("owner_id", userId)
      .single();

    if (!list) {
      return createErrorResponse("List not found");
    }

    if (list.is_active) {
      return createErrorResponse("Cannot delete active list");
    }

    // Delete the list (cascade will handle recipes)
    const { error: deleteError } = await supabase
      .from("grocerylist_shoppinglist")
      .delete()
      .eq("id", listId)
      .eq("owner_id", userId);

    if (deleteError) {
      console.error("Error deleting list:", deleteError);
      return createErrorResponse("Failed to delete list");
    }

    revalidatePath("/shopping-list");

    return createSuccessResponse("List deleted");
  } catch (error) {
    console.error("Error deleting list:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}
