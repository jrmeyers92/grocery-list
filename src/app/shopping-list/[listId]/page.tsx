import GroceryList from "@/components/shopping-list/GroceryList";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/clients/admin";
import { RecipeWithIngredients } from "@/types/database.types";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    listId: string;
  };
}

export default async function PastShoppingListPage({ params }: PageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createAdminClient();

  // Fetch the specific shopping list
  const { data: list, error } = await supabase
    .from("grocerylist_shoppinglist")
    .select("id, title, created_at, updated_at, is_active")
    .eq("id", params.listId)
    .eq("owner_id", userId)
    .single();

  if (error || !list) {
    notFound();
  }

  // If this is the active list, redirect to main page
  if (list.is_active) {
    redirect("/shopping-list");
  }

  // Fetch recipes for this shopping list
  const { data: shoppingListRecipes } = await supabase
    .from("grocerylist_shoppinglist_recipes")
    .select(
      `
      id,
      serving_multiplier,
      added_at,
      recipe:recipe_id (
        id,
        title,
        description,
        image_url,
        servings,
        cook_time,
        prep_time,
        is_favorite,
        tags,
        owner_id,
        created_at,
        updated_at,
        grocerylist_recipe_ingredients (
          id,
          name_raw,
          quantity,
          unit,
          aisle,
          notes,
          owner_id,
          recipe_id,
          created_at,
          name_norm
        ),
        grocerylist_recipe_steps (
          id,
          step_number,
          instruction,
          recipe_id,
          created_at
        )
      )
    `
    )
    .eq("menu_id", list.id)
    .eq("owner_id", userId);

  // Fetch custom items
  const { data: customItems } = await supabase
    .from("grocerylist_shoppinglist_items")
    .select("id, name, quantity, unit, aisle, notes")
    .eq("menu_id", list.id)
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  // Process recipes
  const recipes = (shoppingListRecipes || [])
    .filter((item) => item.recipe != null)
    .map((item) => {
      const recipe = Array.isArray(item.recipe) ? item.recipe[0] : item.recipe;
      return {
        id: item.id,
        serving_multiplier: item.serving_multiplier,
        added_at: item.added_at,
        recipe: recipe as RecipeWithIngredients,
      };
    })
    .filter((item) => item.recipe != null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header with back button */}
      <div className="mb-6">
        <Link href="/shopping-list">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Current List
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{list.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <p className="text-sm">Created {formatDate(list.created_at)}</p>
            </div>
          </div>

          {/* Archive badge */}
          <div className="bg-muted px-3 py-1 rounded-full text-sm text-muted-foreground">
            Archived
          </div>
        </div>
      </div>

      {recipes.length === 0 && (!customItems || customItems.length === 0) ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">This list is empty</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 order-2 lg:order-1">
            {/* Read-only recipe list */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Recipes</h2>
              {recipes.map((item) => {
                const recipe = item.recipe;
                const originalServings = recipe.servings || 4;
                const multiplier = item.serving_multiplier || 1;
                const adjustedServings = Math.round(
                  originalServings * multiplier
                );

                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-4 border rounded-lg"
                  >
                    {recipe.image_url && (
                      <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                        <img
                          src={recipe.image_url}
                          alt={recipe.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <Link
                        href={`/recipes/${recipe.id}`}
                        className="font-medium hover:underline"
                      >
                        {recipe.title}
                      </Link>
                      <p className="text-sm text-muted-foreground mt-1">
                        {adjustedServings} servings (×{multiplier})
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-1 order-1 lg:order-2">
            <GroceryList
              listId={list.id}
              recipes={recipes}
              customItems={customItems || []}
            />
          </div>
        </div>
      )}
    </div>
  );
}
