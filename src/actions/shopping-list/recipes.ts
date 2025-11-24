"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import {
  createErrorResponse,
  createSuccessResponse,
  errorMessages,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type AddToShoppingListResponse =
  | { success: false; error: string; details?: unknown }
  | { success: true; message: string; data?: { menuRecipeId: string } };

interface AddToShoppingListInput {
  recipeId: string;
  servingMultiplier?: number;
}

export async function addToShoppingList(
  input: AddToShoppingListInput
): Promise<AddToShoppingListResponse> {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    const { recipeId, servingMultiplier = 1.0 } = input;

    // 2. Validate inputs
    if (!recipeId) {
      return createErrorResponse("Recipe ID is required");
    }

    if (servingMultiplier <= 0) {
      return createErrorResponse("Serving multiplier must be greater than 0");
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
            title: "This Week",
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

    // 4. Check if recipe exists and user has permission to view it
    const { data: recipe, error: recipeError } = await supabase
      .from("grocerylist_recipes")
      .select("id, title, owner_id, visibility")
      .eq("id", recipeId)
      .single();

    if (recipeError || !recipe) {
      return createErrorResponse("Recipe not found");
    }

    // Check visibility permissions
    const isOwner = recipe.owner_id === userId;
    const isPublic = recipe.visibility === "public";
    // TODO: Add followers check when implemented
    // const isFollower = recipe.visibility === "followers" && await checkIfFollowing(userId, recipe.owner_id);

    if (!isOwner && !isPublic) {
      return createErrorResponse(
        "You don't have permission to add this recipe"
      );
    }

    // 5. Check if recipe is already in the shopping list
    const { data: existingEntry } = await supabase
      .from("grocerylist_shoppinglist_recipes")
      .select("id, serving_multiplier")
      .eq("menu_id", activeList.id)
      .eq("recipe_id", recipeId)
      .single();

    if (existingEntry) {
      // Update serving multiplier if recipe already exists
      const { error: updateError } = await supabase
        .from("grocerylist_shoppinglist_recipes")
        .update({ serving_multiplier: servingMultiplier })
        .eq("id", existingEntry.id);

      if (updateError) {
        console.error("Error updating shopping list entry:", updateError);
        return createErrorResponse("Failed to update recipe in shopping list");
      }

      revalidatePath("/shopping-list");
      revalidatePath("/recipes");
      revalidatePath("/explore-recipes");

      return createSuccessResponse(
        `Updated ${recipe.title} serving size in shopping list`
      );
    }

    // 6. Add recipe to shopping list
    const { data: menuRecipe, error: insertError } = await supabase
      .from("grocerylist_shoppinglist_recipes")
      .insert([
        {
          owner_id: userId,
          menu_id: activeList.id,
          recipe_id: recipeId,
          serving_multiplier: servingMultiplier,
        },
      ])
      .select("id")
      .single();

    if (insertError) {
      console.error("Error adding to shopping list:", insertError);
      return createErrorResponse("Failed to add recipe to shopping list");
    }

    // 7. Revalidate paths
    revalidatePath("/shopping-list");
    revalidatePath("/recipes");
    revalidatePath("/explore-recipes");

    return createSuccessResponse(`Added ${recipe.title} to shopping list`, {
      menuRecipeId: menuRecipe.id,
    });
  } catch (error) {
    console.error("Error adding to shopping list:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}

export async function removeFromShoppingList(
  recipeId: string
): Promise<AddToShoppingListResponse> {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    if (!recipeId) {
      return createErrorResponse("Recipe ID is required");
    }

    const supabase = await createAdminClient();

    // 2. Get active shopping list
    const { data: activeList } = await supabase
      .from("grocerylist_shoppinglist")
      .select("id")
      .eq("owner_id", userId)
      .eq("is_active", true)
      .single();

    if (!activeList) {
      return createErrorResponse("No active shopping list found");
    }

    // 3. Remove recipe from shopping list
    const { error: deleteError } = await supabase
      .from("grocerylist_shoppinglist_recipes")
      .delete()
      .eq("menu_id", activeList.id)
      .eq("recipe_id", recipeId)
      .eq("owner_id", userId);

    if (deleteError) {
      console.error("Error removing from shopping list:", deleteError);
      return createErrorResponse("Failed to remove recipe from shopping list");
    }

    // 4. Revalidate paths
    revalidatePath("/shopping-list");
    revalidatePath("/recipes");
    revalidatePath("/explore-recipes");

    return createSuccessResponse("Removed from shopping list");
  } catch (error) {
    console.error("Error removing from shopping list:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}

export async function updateServingMultiplier(
  recipeId: string,
  multiplier: number
): Promise<AddToShoppingListResponse> {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    if (!recipeId) {
      return createErrorResponse("Recipe ID is required");
    }

    if (multiplier <= 0) {
      return createErrorResponse("Serving multiplier must be greater than 0");
    }

    const supabase = await createAdminClient();

    // 2. Get active shopping list
    const { data: activeList } = await supabase
      .from("grocerylist_shoppinglist")
      .select("id")
      .eq("owner_id", userId)
      .eq("is_active", true)
      .single();

    if (!activeList) {
      return createErrorResponse("No active shopping list found");
    }

    // 3. Update serving multiplier
    const { error: updateError } = await supabase
      .from("grocerylist_shoppinglist_recipes")
      .update({ serving_multiplier: multiplier })
      .eq("menu_id", activeList.id)
      .eq("recipe_id", recipeId)
      .eq("owner_id", userId);

    if (updateError) {
      console.error("Error updating serving multiplier:", updateError);
      return createErrorResponse("Failed to update serving size");
    }

    // 4. Revalidate paths
    revalidatePath("/shopping-list");

    return createSuccessResponse("Updated serving size");
  } catch (error) {
    console.error("Error updating serving multiplier:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}
