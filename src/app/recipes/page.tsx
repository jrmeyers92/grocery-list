import RecipesPageClient from "@/components/RecipePageClient";
import { createAdminClient } from "@/lib/supabase/clients/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function RecipesPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createAdminClient();

  // Fetch all recipes for the current user
  const { data: recipes, error } = await supabase
    .from("grocerylist_recipes")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipes:", error);
  }

  // Fetch active shopping list and its recipes
  const { data: activeList } = await supabase
    .from("grocerylist_shoppinglist")
    .select(
      `
      id,
      grocerylist_shoppinglist_recipes(recipe_id)
    `
    )
    .eq("owner_id", userId)
    .eq("is_active", true)
    .single();

  // Create a Set of recipe IDs that are in the shopping list for O(1) lookup
  const shoppingListRecipeIds = new Set(
    activeList?.grocerylist_shoppinglist_recipes?.map(
      (item) => item.recipe_id
    ) || []
  );

  return (
    <RecipesPageClient
      recipes={recipes || []}
      shoppingListRecipeIds={shoppingListRecipeIds}
    />
  );
}
