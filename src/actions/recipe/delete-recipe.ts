"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import { cleanupFiles } from "@/lib/supabase/storage";
import {
  createErrorResponse,
  createSuccessResponse,
  errorMessages,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

type DeleteRecipeResponse =
  | { success: false; error: string }
  | { success: true; message: string };

export async function deleteRecipe(
  recipeId: string
): Promise<DeleteRecipeResponse> {
  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    const supabase = await createAdminClient();

    // 2. Verify recipe exists and belongs to user
    const { data: recipe, error: fetchError } = await supabase
      .from("grocerylist_recipes")
      .select("id, image_url, owner_id")
      .eq("id", recipeId)
      .eq("owner_id", userId)
      .single();

    if (fetchError || !recipe) {
      return createErrorResponse("Recipe not found or unauthorized");
    }

    // 3. Delete recipe (this will cascade delete ingredients and steps due to foreign key constraints)
    const { error: deleteError } = await supabase
      .from("grocerylist_recipes")
      .delete()
      .eq("id", recipeId)
      .eq("owner_id", userId);

    if (deleteError) {
      console.error("Recipe delete error:", deleteError);
      return createErrorResponse("Failed to delete recipe");
    }

    // 4. Clean up associated image if it exists
    if (recipe.image_url) {
      await cleanupFiles(supabase, [recipe.image_url]);
    }

    // 5. Revalidate the recipes page
    revalidatePath("/recipes");
    revalidatePath(`/recipes/${recipeId}`);

    return createSuccessResponse("Recipe deleted successfully");
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}
