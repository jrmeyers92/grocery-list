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

type CreateRecipeResponse =
  | { success: false; error: string; details?: unknown }
  | { success: true; message: string; data?: { recipeId: string } };

export async function createRecipe(
  recipeData: CreateRecipeClientInput
): Promise<CreateRecipeResponse> {
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
    const { ingredients, steps, recipeImage, ...recipeFields } = validatedData;

    // 3. Handle image upload if provided
    let imageUrl: string | null = null;
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
      }
    }

    // 4. Insert recipe
    const { data: recipe, error: recipeError } = await supabase
      .from("grocerylist_recipes")
      .insert([
        {
          ...recipeFields,
          image_url: imageUrl,
          owner_id: userId,
        },
      ])
      .select()
      .single();

    if (recipeError) {
      console.error("Recipe insert error:", recipeError);
      await cleanupFiles(supabase, uploadedFiles);
      return createErrorResponse("Failed to create recipe");
    }

    // 5. Insert ingredients
    const ingredientsToInsert = ingredients.map((ing) => ({
      name_raw: ing.name_raw,
      quantity: ing.quantity,
      unit: ing.unit,
      aisle: ing.aisle || "other",
      notes: ing.notes || null,
      recipe_id: recipe.id,
      owner_id: userId,
    }));

    const { error: ingredientsError } = await supabase
      .from("grocerylist_recipe_ingredients")
      .insert(ingredientsToInsert);

    if (ingredientsError) {
      console.error("Ingredients insert error:", ingredientsError);
      // Clean up recipe and uploaded files
      await supabase.from("grocerylist_recipes").delete().eq("id", recipe.id);
      await cleanupFiles(supabase, uploadedFiles);
      return createErrorResponse("Failed to add ingredients");
    }

    // 6. Insert steps
    const stepsToInsert = steps.map((step) => ({
      step_number: step.step_number,
      instruction: step.instruction,
      recipe_id: recipe.id,
    }));

    const { error: stepsError } = await supabase
      .from("grocerylist_recipe_steps")
      .insert(stepsToInsert);

    if (stepsError) {
      console.error("Steps insert error:", stepsError);
      // Clean up recipe, ingredients, and uploaded files
      await supabase.from("grocerylist_recipes").delete().eq("id", recipe.id);
      await cleanupFiles(supabase, uploadedFiles);
      return createErrorResponse("Failed to add instructions");
    }

    // 7. Revalidate the recipes page
    revalidatePath("/recipes");

    return createSuccessResponse("Recipe created successfully", {
      recipeId: recipe.id,
    });
  } catch (error) {
    console.error("Error creating recipe:", error);
    const supabase = await createAdminClient();
    await cleanupFiles(supabase, uploadedFiles);
    return createErrorResponse(errorMessages.SERVER_ERROR);
  }
}
