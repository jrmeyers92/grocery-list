import GroceryList from "@/components/shopping-list/GroceryList";
import ShoppingListHeader from "@/components/shopping-list/ShoppingListHeader";
import ShoppingListRecipes from "@/components/shopping-list/ShoppingListRecipes";
import { createAdminClient } from "@/lib/supabase/clients/admin";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const supabase = await createAdminClient();

  // Get active shopping list with recipes
  const { data: activeList } = await supabase
    .from("grocerylist_shoppinglist")
    .select(
      `
      id,
      title,
      created_at,
      grocerylist_shoppinglist_recipes (
        id,
        serving_multiplier,
        added_at,
        recipe:grocerylist_recipes (
          id,
          title,
          image_url,
          servings,
          grocerylist_recipe_ingredients (
            id,
            name_raw,
            quantity,
            unit,
            aisle,
            notes
          )
        )
      )
    `
    )
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
          listId={newList.id}
          title={newList.title}
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

  const recipes = activeList.grocerylist_shoppinglist_recipes || [];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <ShoppingListHeader
        listId={activeList.id}
        title={activeList.title}
        recipeCount={recipes.length}
      />

      {recipes.length === 0 ? (
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
            <GroceryList recipes={recipes} />
          </div>
        </div>
      )}
    </div>
  );
}
