"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import {
  createErrorResponse,
  createSuccessResponse,
  errorMessages,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type CustomItemResponse =
  | { success: false; error: string; details?: unknown }
  | { success: true; message: string; data?: { itemId: string } };

interface AddCustomItemInput {
  name: string;
  quantity: number;
  unit: string;
  aisle?: string;
  notes?: string;
}

/**
 * Add a custom item to the active shopping list
 */
export async function addCustomItem(
  input: AddCustomItemInput
): Promise<CustomItemResponse> {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    const { name, quantity, unit, aisle = "other", notes } = input;

    // 2. Validate inputs
    if (!name || name.trim().length === 0) {
      return createErrorResponse("Item name is required");
    }

    if (quantity <= 0) {
      return createErrorResponse("Quantity must be greater than 0");
    }

    if (!unit) {
      return createErrorResponse("Unit is required");
    }

    const supabase = await createAdminClient();

    // 3. Get or create active shopping list
    let activeList: { id: string } | null = null;
    const { data: listData } = await supabase
      .from("grocerylist_shoppinglist")
      .select("id")
      .eq("owner_id", userId)
      .eq("is_active", true)
      .single();

    activeList = listData;

    // If no active list exists, create one
    if (!activeList) {
      const { data: newList, error: createError } = await supabase
        .from("grocerylist_shoppinglist")
        .insert([
          {
            owner_id: userId,
            title: "My Shopping List",
            is_active: true,
          },
        ])
        .select("id")
        .single();

      if (createError) {
        console.error("Error creating shopping list:", createError);
        return createErrorResponse("Failed to create shopping list");
      }

      activeList = newList;
    }

    // 4. Add custom item to shopping list
    const { data: customItem, error: insertError } = await supabase
      .from("grocerylist_shoppinglist_items")
      .insert([
        {
          owner_id: userId,
          menu_id: activeList.id,
          name: name.trim(),
          quantity,
          unit,
          aisle,
          notes: notes?.trim() || null,
        },
      ])
      .select("id")
      .single();

    if (insertError) {
      console.error("Error adding custom item:", insertError);
      return createErrorResponse("Failed to add item to shopping list");
    }

    // 5. Revalidate path
    revalidatePath("/shopping-list");

    return createSuccessResponse(`Added ${name} to shopping list`, {
      itemId: customItem.id,
    });
  } catch (error) {
    console.error("Error adding custom item:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}

/**
 * Remove a custom item from the shopping list
 */
export async function removeCustomItem(
  itemId: string
): Promise<CustomItemResponse> {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    if (!itemId) {
      return createErrorResponse("Item ID is required");
    }

    const supabase = await createAdminClient();

    // 2. Delete the custom item
    const { error: deleteError } = await supabase
      .from("grocerylist_shoppinglist_items")
      .delete()
      .eq("id", itemId)
      .eq("owner_id", userId);

    if (deleteError) {
      console.error("Error removing custom item:", deleteError);
      return createErrorResponse("Failed to remove item from shopping list");
    }

    // 3. Revalidate path
    revalidatePath("/shopping-list");

    return createSuccessResponse("Removed item from shopping list");
  } catch (error) {
    console.error("Error removing custom item:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}

/**
 * Update a custom item in the shopping list
 */
export async function updateCustomItem(
  itemId: string,
  updates: Partial<AddCustomItemInput>
): Promise<CustomItemResponse> {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    if (!itemId) {
      return createErrorResponse("Item ID is required");
    }

    // 2. Validate updates
    if (updates.quantity !== undefined && updates.quantity <= 0) {
      return createErrorResponse("Quantity must be greater than 0");
    }

    if (updates.name !== undefined && updates.name.trim().length === 0) {
      return createErrorResponse("Item name cannot be empty");
    }

    const supabase = await createAdminClient();

    // 3. Build update object
    const updateData: Record<string, unknown> = {};
    if (updates.name !== undefined) updateData.name = updates.name.trim();
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.aisle !== undefined) updateData.aisle = updates.aisle;
    if (updates.notes !== undefined)
      updateData.notes = updates.notes?.trim() || null;

    // 4. Update the custom item
    const { error: updateError } = await supabase
      .from("grocerylist_shoppinglist_items")
      .update(updateData)
      .eq("id", itemId)
      .eq("owner_id", userId);

    if (updateError) {
      console.error("Error updating custom item:", updateError);
      return createErrorResponse("Failed to update item");
    }

    // 5. Revalidate path
    revalidatePath("/shopping-list");

    return createSuccessResponse("Updated item");
  } catch (error) {
    console.error("Error updating custom item:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}

/**
 * Toggle the checked state of a custom item
 */
export async function toggleCustomItemChecked(
  itemId: string,
  isChecked: boolean
): Promise<CustomItemResponse> {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    if (!itemId) {
      return createErrorResponse("Item ID is required");
    }

    const supabase = await createAdminClient();

    // 2. Update the checked state
    const { error: updateError } = await supabase
      .from("grocerylist_shoppinglist_items")
      .update({ is_checked: isChecked })
      .eq("id", itemId)
      .eq("owner_id", userId);

    if (updateError) {
      console.error("Error toggling item checked state:", updateError);
      return createErrorResponse("Failed to update item");
    }

    // 3. Revalidate path
    revalidatePath("/shopping-list");

    return createSuccessResponse(isChecked ? "Item checked" : "Item unchecked");
  } catch (error) {
    console.error("Error toggling item checked state:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}
