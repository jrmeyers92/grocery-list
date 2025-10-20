import GroceryList from "@/components/shopping-list/GroceryList";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListRecipes from "@/components/shopping-list/ShoppingListRecipes";
import { createAdminClient } from "@/lib/supabase/clients/admin";
import { RecipeWithIngredients } from "@/types/database.types";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createAdminClient();

  // Get active shopping list
  const { data: activeList } = await supabase
    .from("grocerylist_shoppinglist")
    .select("id, title, created_at")
    .eq("owner_id", userId)
    .eq("is_active", true)
    .single();

  // If no active list, create one
  if (!activeList) {
    const { data: newList } = await supabase
      .from("grocerylist_shoppinglist")
      .insert([
        {
          owner_id: userId,
          title: "My Shopping List",
          is_active: true,
        },
      ])
      .select()
      .single();

    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <ShoppingListHeader
          listId={newList?.id || ""}
          title={newList?.title || "My Shopping List"}
          recipeCount={0}
        />
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Your shopping list is empty. Add some recipes to get started!
          </p>
        </div>
      </div>
    );
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
    .eq("menu_id", activeList.id)
    .eq("owner_id", userId);

  // Fetch custom items for this shopping list
  const { data: customItems } = await supabase
    .from("grocerylist_shoppinglist_items")
    .select("id, name, quantity, unit, aisle, notes")
    .eq("menu_id", activeList.id)
    .eq("owner_id", userId)
    .order("created_at", { ascending: true });

  // Filter out any items where recipe is null and extract recipe from array
  const recipes = (shoppingListRecipes || [])
    .filter((item) => item.recipe != null)
    .map((item) => {
      // Supabase returns recipe as an array when using foreign key syntax
      const recipe = Array.isArray(item.recipe) ? item.recipe[0] : item.recipe;

      return {
        id: item.id,
        serving_multiplier: item.serving_multiplier,
        added_at: item.added_at,
        recipe: recipe as RecipeWithIngredients,
      };
    })
    .filter((item) => item.recipe != null); // Filter again in case array was empty

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <ShoppingListHeader
        listId={activeList.id}
        title={activeList.title}
        recipeCount={recipes.length}
      />

      {recipes.length === 0 && (!customItems || customItems.length === 0) ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            Your shopping list is empty. Add some recipes to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2">
            <ShoppingListRecipes recipes={recipes} />
          </div>
          <div className="lg:col-span-1">
            <GroceryList recipes={recipes} customItems={customItems || []} />
          </div>
        </div>
      )}
    </div>
  );
}
