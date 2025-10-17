import EditRecipeForm from "@/components/forms/EditRecipeForm";
import { createAdminClient } from "@/lib/supabase/clients/admin";
import type {
  Ingredient,
  RecipeWithIngredients,
  Step,
} from "@/types/database.types";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

interface EditRecipePageProps {
  params: {
    id: string;
  };
}

export default async function page({ params }: EditRecipePageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createAdminClient();

  // Fetch recipe with ingredients and steps
  const { data: recipe, error } = await supabase
    .from("grocerylist_recipes")
    .select(
      `
      *,
      grocerylist_recipe_ingredients(*),
      grocerylist_recipe_steps(*)
    `
    )
    .eq("id", params.id)
    .eq("owner_id", userId)
    .single();

  if (error || !recipe) {
    notFound();
  }

  // Sort ingredients and steps
  const ingredients =
    recipe.grocerylist_recipe_ingredients?.sort(
      (a: Ingredient, b: Ingredient) =>
        a.created_at?.localeCompare(b.created_at || "") || 0
    ) || [];

  const steps =
    recipe.grocerylist_recipe_steps?.sort(
      (a: Step, b: Step) => a.step_number - b.step_number
    ) || [];

  const recipeData: RecipeWithIngredients = {
    ...recipe,
    grocerylist_recipe_ingredients: ingredients,
    grocerylist_recipe_steps: steps,
  };

  return <EditRecipeForm recipe={recipeData} />;
}
