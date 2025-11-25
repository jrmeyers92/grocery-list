"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import {
  createErrorResponse,
  createSuccessResponse,
  errorMessages,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type ToggleFavoriteResponse =
  | { success: false; error: string }
  | { success: true; message: string; data?: { isFavorite: boolean } };

export async function toggleFavorite(
  recipeId: string
): Promise<ToggleFavoriteResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    const supabase = await createAdminClient();

    // Get current favorite status
    const { data: recipe, error: fetchError } = await supabase
      .from("grocerylist_recipes")
      .select("is_favorite")
      .eq("id", recipeId)
      .single();

    if (fetchError || !recipe) {
      return createErrorResponse("Recipe not found");
    }

    // Toggle favorite status
    const newFavoriteStatus = !recipe.is_favorite;

    const { error: updateError } = await supabase
      .from("grocerylist_recipes")
      .update({ is_favorite: newFavoriteStatus })
      .eq("id", recipeId)
      .eq("owner_id", userId);

    if (updateError) {
      console.error("Error toggling favorite:", updateError);
      return createErrorResponse("Failed to update favorite status");
    }

    revalidatePath("/recipes");
    revalidatePath(`/recipes/${recipeId}`);

    return createSuccessResponse(
      newFavoriteStatus ? "Added to favorites" : "Removed from favorites",
      { isFavorite: newFavoriteStatus }
    );
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}
