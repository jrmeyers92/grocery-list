"use server";

import { createAdminClient } from "@/lib/supabase/clients/admin";
import { cleanupFiles, uploadFile } from "@/lib/supabase/storage";
import {
  createErrorResponse,
  createSuccessResponse,
  errorMessages,
} from "@/lib/validation";
import {
  createRecipeServerSchema,
  type CreateRecipeClientInput,
} from "@/lib/validation/recipe";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type UpdateRecipeResponse =
  | { success: false; error: string; details?: unknown }
  | { success: true; message: string; data?: { recipeId: string } };

export async function updateRecipe(
  recipeId: string,
  recipeData: CreateRecipeClientInput
): Promise<UpdateRecipeResponse> {
  const uploadedFiles: string[] = [];

  try {
    // 1. Check authentication
    const { userId } = await auth();
    if (!userId) {
      return createErrorResponse(errorMessages.AUTHENTICATION_REQUIRED);
    }

    // 2. Add owner_id and validate with server schema
    let validatedData;
    try {
      validatedData = createRecipeServerSchema.parse({
        ...recipeData,
        owner_id: userId,
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return createErrorResponse(
          errorMessages.VALIDATION_FAILED,
          validationError.issues
        );
      }
      throw validationError;
    }

    const supabase = await createAdminClient();

    // 3. Verify recipe exists and belongs to user
    const { data: existingRecipe, error: fetchError } = await supabase
      .from("grocerylist_recipes")
      .select("id, image_url, owner_id")
      .eq("id", recipeId)
      .eq("owner_id", userId)
      .single();

    if (fetchError || !existingRecipe) {
      return createErrorResponse("Recipe not found or unauthorized");
    }

    const { ingredients, steps, recipeImage, ...recipeFields } = validatedData;

    // 4. Handle image upload if new image provided
    let imageUrl: string | null = existingRecipe.image_url;
    if (recipeImage) {
      const imageUpload = await uploadFile(
        supabase,
        recipeImage,
        userId,
        "recipeImages"
      );

      if (!imageUpload.success) {
        return createErrorResponse(imageUpload.error || "Image upload failed");
      }

      if (imageUpload.path) {
        imageUrl = imageUpload.path;
        uploadedFiles.push(imageUrl);

        // Delete old image if it exists and is different
        if (existingRecipe.image_url && existingRecipe.image_url !== imageUrl) {
          await cleanupFiles(supabase, [existingRecipe.image_url]);
        }
      }
    }

    // 5. Update recipe
    const { error: recipeError } = await supabase
      .from("grocerylist_recipes")
      .update({
        ...recipeFields,
        image_url: imageUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", recipeId)
      .eq("owner_id", userId);

    if (recipeError) {
      console.error("Recipe update error:", recipeError);
      await cleanupFiles(supabase, uploadedFiles);
      return createErrorResponse("Failed to update recipe");
    }

    // 6. Delete existing ingredients and steps
    await supabase
      .from("grocerylist_recipe_ingredients")
      .delete()
      .eq("recipe_id", recipeId);

    await supabase
      .from("grocerylist_recipe_steps")
      .delete()
      .eq("recipe_id", recipeId);

    // 7. Insert new ingredients
    const ingredientsToInsert = ingredients.map((ing) => ({
      name_raw: ing.name_raw,
      quantity: ing.quantity,
      unit: ing.unit,
      aisle: ing.aisle || "other",
      notes: ing.notes || null,
      recipe_id: recipeId,
      owner_id: userId,
    }));

    const { error: ingredientsError } = await supabase
      .from("grocerylist_recipe_ingredients")
      .insert(ingredientsToInsert);

    if (ingredientsError) {
      console.error("Ingredients insert error:", ingredientsError);
      await cleanupFiles(supabase, uploadedFiles);
      return createErrorResponse("Failed to update ingredients");
    }

    // 8. Insert new steps
    const stepsToInsert = steps.map((step) => ({
      step_number: step.step_number,
      instruction: step.instruction,
      recipe_id: recipeId,
    }));

    const { error: stepsError } = await supabase
      .from("grocerylist_recipe_steps")
      .insert(stepsToInsert);

    if (stepsError) {
      console.error("Steps insert error:", stepsError);
      await cleanupFiles(supabase, uploadedFiles);
      return createErrorResponse("Failed to update instructions");
    }

    // 9. Revalidate pages
    revalidatePath("/recipes");
    revalidatePath(`/recipes/${recipeId}`);
    revalidatePath(`/recipes/${recipeId}/edit`);

    return createSuccessResponse("Recipe updated successfully", {
      recipeId,
    });
  } catch (error) {
    console.error("Error updating recipe:", error);
    const supabase = await createAdminClient();
    await cleanupFiles(supabase, uploadedFiles);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}
