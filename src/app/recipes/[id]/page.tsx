import { default as RecipeHeader } from "@/components/recipe/RecipeHeader";
import RecipeInfo from "@/components/recipe/RecipeInfo";
import RecipeIngredients from "@/components/recipe/RecipeIngredients";
import RecipeSteps from "@/components/recipe/RecipeSteps";
import { createAdminClient } from "@/lib/supabase/clients/admin";
import type {
  Ingredient,
  RecipeWithIngredients,
  Step,
} from "@/types/database.types";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

interface RecipePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function page({ params }: RecipePageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Await params before using
  const { id } = await params;

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
    .eq("id", id)
    .single();

  if (error || !recipe) {
    notFound();
  }

  // Check if the current user is the owner
  const isOwner = recipe.owner_id === userId;

  // If not the owner, check visibility permissions
  if (!isOwner) {
    // If recipe is private, only the owner can view it
    if (recipe.visibility === "private") {
      notFound();
    }

    // TODO: Add followers check when you implement the followers feature
    // if (recipe.visibility === "followers") {
    //   const isFollowing = await checkIfFollowing(userId, recipe.owner_id);
    //   if (!isFollowing) {
    //     notFound();
    //   }
    // }
  }

  // Fetch creator information if not the owner
  let creatorName: string | undefined;
  let creatorUsername: string | undefined;

  if (!isOwner && recipe.owner_id) {
    try {
      const client = await clerkClient();
      const creator = await client.users.getUser(recipe.owner_id);
      creatorName =
        creator.firstName && creator.lastName
          ? `${creator.firstName} ${creator.lastName}`
          : undefined;
      creatorUsername = creator.username || undefined;
    } catch (error) {
      console.error("Failed to fetch creator info:", error);
    }
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

  // Check if recipe is in shopping list (only for owner)
  let isInShoppingList = false;
  if (isOwner) {
    const { data: shoppingListRecipe } = await supabase
      .from("grocerylist_shopping_list_recipes")
      .select("id")
      .eq("recipe_id", id)
      .eq("owner_id", userId)
      .single();

    isInShoppingList = !!shoppingListRecipe;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <RecipeHeader
        recipe={recipeData}
        isOwner={isOwner}
        isInShoppingList={isInShoppingList}
        creatorName={creatorName}
        creatorUsername={creatorUsername}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 space-y-8">
          <RecipeInfo recipe={recipeData} />
          <RecipeSteps steps={steps} />
        </div>

        <div className="lg:col-span-1">
          <RecipeIngredients ingredients={ingredients} />
        </div>
      </div>
    </div>
  );
}
