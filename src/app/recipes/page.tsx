import RecipeCard from "@/components/recipe/RecipeCard";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/clients/admin";
import { auth } from "@clerk/nextjs/server";
import { Plus } from "lucide-react";
import Link from "next/link";
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
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <p className="text-muted-foreground mt-2">
            Manage your recipe collection
          </p>
        </div>
        <Link href="/recipes/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Recipe
          </Button>
        </Link>
      </div>

      {!recipes || recipes.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No recipes yet</h2>
          <p className="text-muted-foreground mb-6">
            Start building your recipe collection
          </p>
          <Link href="/recipes/create">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Recipe
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              isInShoppingList={shoppingListRecipeIds.has(recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
